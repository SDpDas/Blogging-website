require('dotenv').config();

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt'); // helps to decrypt hidden info
const jwt = require ('jsonwebtoken'); // constant to use JSON web tokens

const adminLayout = '../views/layouts/admin'; 
const jwtSecret = process.env.JWT_SECRET;



    /**
     *  
     *  Check Login
     */

    const authMiddleware = (req, res, next) => { //code used to authenticate users
        const token = req.cookies.token;    //next is the next middleware function in request-response cycle
    

    if(!token) {        //deleted or ungiven tokens will be unauthorized
        return res.status(401).json ( { message: 'Unauthorized'} );
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) //token verifier that returns payload if valid token else error
        req.userId = decoded.userId; //if token verified then user is extracted from token payload
        next(); 
    } catch (error) 
    {   console.log(error);
        return res.status(401).json ( { message: 'Unauthorized'} );
    }
}



    /**
     *  GET /
     *  Admin - Login Page
     */

    router.get('/admin', async (req, res) =>
    {
        const locals = {
            title: "Admin",
            description: "Blog made using NodeJS, Express and MongoDB"
        }

        try {
            const data = await Post.find();
            res.render('admin/index', {locals, layout: adminLayout});
        } catch (error) {
            console.log(error);
        }
        
    });

    /**
     *  GET /
     *  Admin - Check Login
     */

    router.post('/admin', async (req, res) => {
        try {

            const{ username, password } = req.body;
            
            const user = await User.findOne( { username } );

            if(!user) {
                return res.status(401).json( {message: "Invalid credentials"} ); // Using Invalid credentials instead of user not found to not give them hint
            }

            const isPasswordValid = await bcrypt.compare(password, user.password) //Compares the form entered password with one stored in MongoDB

            if(!isPasswordValid) {
                return res.status(401).json( {message: "Invalid credentials"} );
            }

            const token = jwt.sign({ userId: user._id}, jwtSecret) // creates a new JSON web token
            res.cookie('token', token, { httpOnly: true }); //passing token to cookie that is randomly signed with JWT
            res.redirect('/dashboard');

        } catch (error)
        {
            console.log(error);
        }
    });

    /**
     *  GET /
     *  Admin - Dashboard
     */

    router.get('/dashboard', authMiddleware, async (req, res) => { //Password Protected

        try {
    
            const locals = {
                title : "Dashboard",
                description : 'Simple Blog created with NodeJS, Express and MongoDB'
            }
    
            // creating pagination to split posts in dashboard for different pages
            let perPage = 5;
            let page = req.query.page || 1;

            const data = await Post.aggregate([ { $sort: { createdAt: -1}} ])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

            const count = await Post.countDocuments();
            const nextPage = parseInt(page) + 1;
            const hasNextPage = nextPage <= Math.ceil(count / perPage);

            res.render('admin/dashboard', {
                locals, 
                data,
                layout: adminLayout,
                current: page,
                nextPage: hasNextPage ? nextPage : null
            });   
    
        } catch (error) {
            console.log(error);
        }
    
    });
    
    /**
     *  GET /
     *  Admin - Create New Posts
     */

    router.get('/add-post', authMiddleware, async (req, res) => { //Password Protected

        try {
    
            const locals = {
                title : "Add Post",
                description : 'Simple Blog created with NodeJS, Express and MongoDB'
            }

            res.render('admin/add-post', {
                locals, 
                layout: adminLayout
            });   
    
        } catch (error) {
            console.log(error);
        }
    
    });
    
    /**
     *  POST /
     *  Admin - Create New Posts
     */

    router.post('/add-post', authMiddleware, async (req, res) => { //Password Protected

        try {

            console.log(req.body);


            try {
                const newPost = new Post({
                    title: req.body.title,
                    body: req.body.body
                })

                await Post.create(newPost);
                res.redirect('/dashboard');

            } catch (error) {
                console.log(error);
            }
    
        } catch (error) {
            console.log(error);
        }
    
    });


    /**
     *  GET /
     *  Admin - Edit Posts
     */

    router.get('/edit-post/:id', authMiddleware, async (req, res) => { //Password Protected

        try {
    
             // In order to update everything in db we have to wrap it inside track catch
             // and inside we can do route to get info 
            
             const locals = {
                title: "Edit Post",
                description: "User Management",
             };

             const data = await Post.findOne({_id: req.params.id});

             res.render('admin/edit-post', {
                locals,
                data,
                layout: adminLayout
             })


        } catch (error) {
            console.log(error);
        }
    
    });

    /**
     *  PUT /
     *  Admin - Edit Posts
     */

    router.put('/edit-post/:id', authMiddleware, async (req, res) => { //Password Protected

        try {
    
             // In order to update everything in db we have to wrap it inside track catch
             // and inside we can do route to put info 
            
             await Post.findByIdAndUpdate(req.params.id, 
            {
                title: req.body.title,
                body: req.body.body,
                updatedAt: Date.now()
            });

            res.redirect(`/edit-post/${req.params.id}`);

        } catch (error) {
            console.log(error);
        }
    
    });

    // sample post method to check login

    // router.post('/admin', async (req, res) => {
    //     try {
    //         const{ username, password } = req.body;
            
    //         if(req.body.username === 'admin' && req.body.password === 'password'){
    //             res.send("You are logged in")
    //         } else {
    //             res.send("Wrong Username or Password");
    //         }
    //     } catch (error)
    //     {
    //         console.log(error);
    //     }
    // });

    /**
     *  POST /
     *  Admin - Click Register
     */

    router.post('/register', async (req, res) =>
    {
    try {

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            const user = await User.create({ username, password:hashedPassword });
            res.status(201).json({message: 'User Created', user })
        } catch (error) {
            if(error.code === 11000) {
                res.status(409).json({ message: 'User already in use'});
            }
            res.status(500).json({ message: "Internal Server error" });
        }

    } catch (error) {
        console.log(error);
    }
    
    });
    
/**
     *  DELETE /
     *  Admin - Delete Posts
     */

router.delete('/delete-post/:id', authMiddleware, async (req, res) => { //Password Protected

    try {
        await Post.deleteOne( {_id:req.params.id} );
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }

    });

/**
     *  GET /
     *  Admin - Logout
     */

// Done by removing cookie with the name of token

router.get('/logout', (req, res) => {
    res.clearCookie('token');
        // res.json({message: 'Logout successful' });
    res.redirect('/');
});

module.exports = router;