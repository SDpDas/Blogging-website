const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

module.exports = function(app) {

    // rendering the home page
    router.get('', async (req, res) => {   

        try {
            const locals = {
                title: "NodeJS Blog",
                description: "Blog made using NodeJS, Express and MongoDB",
                currentRoute: '/'
            }

            let perPage = 5;
            let page = req.query.page || 1;

            const data = await Post.aggregate([ { $sort: { createdAt: -1}} ])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();
            
            const count = await Post.countDocuments();
            const nextPage = parseInt(page) + 1;
            const hasNextPage = nextPage <= Math.ceil(count / perPage);


            res.render('index', { 
                locals, 
                data,
                current: page,
                nextPage: hasNextPage ? nextPage : null,
                currentRoute: '/'
            });
        
        } catch (error) {
            console.log(error);
        }

    });

    /**
     *  GET /
     *  Post: id 
     */

    router.get('/post/:id', async (req, res) => {   

        try {


            let slug = req.params.id;

            const data = await Post.findById({ _id: slug });

            const locals = {
                title: data.title,
                description: "Blog made using NodeJS, Express and MongoDB",
                currentRoute: `/post/${slug}`
            }

            res.render('post', {locals, data, currentRoute: 'post'});
        } catch (error) {
            console.log(error);
            res.status(500).send('Error fetching post');
        }

    });

     /**
     *  GET /
     *  Post : Searchterm
     */

    router.post('/search', async (req, res) =>
    {

        try {

            const locals = {
                title: "Search",
                description: "Blog made using NodeJS, Express and MongoDB"
            }

            let searchTerm = req.body.searchTerm;
            const searchNoSpecialChar = searchTerm.replace(/[^a-zA-z0-9]/g, "") //removes special characters (use regex from online)
            
            //console.log(searchTerm); prints the search term on new page
            
            const data = await Post.find({
                $or: [
                    {title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                    {body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}   //using mongoose to perform database query 
                ]
            })

            res.render("search", {
                data, 
                locals
            });

        } catch (error) {
            console.log(error);
        }

    });

    /**
     *  GET /
     *  about page
     */

    router.get('/about', (req, res) => {
        const locals = {
            title: "About",
            description: "About page description",
            currentRoute: '/about'
        }
        res.render('about', {locals});
    });

    /**
     *  GET /
     *  contact page
     */

    router.get('/contact', (req, res) => {
        const locals = {
            title: "Contact",
            description: "About page description",
            currentRoute: '/contact'
        }
        res.render('contact', {locals});
    });

    /* Default format for getting the post requests
    Kindly use it carefully

    router.get('', async (req, res) =>
    {
        const locals = {
            title: "NodeJS Blog",
            description: "Blog made using NodeJS, Express and MongoDB"
        }

        try {
            const data = await Post.find();
            res.render('index', {locals, data});
        } catch (error) {
            console.log(error);
        }
        
    });

    

    /*
    // Function to insert post data
    function insertPostData() {
        Post.insertMany([
            {
                title: "The Rise of Quantum Computing",
                body: "With breakthroughs in hardware and algorithms, it's poised to revolutionize fields from cryptography to drug discovery."
            },
            {
                title: "Dilemmas in AI",
                body: "From bias in algorithms to the implications of autonomous decision-making, delve into the complex ethical landscape surrounding AI and the need for responsible development.."
            },
            {
                title: "Blockchain Beyond Cryptocurrency",
                body: "While blockchain technology gained fame through cryptocurrencies like Bitcoin, its potential extends far beyond digital money."
            },
            {
                title: "Exploring the World of Augmented Reality",
                body: "Augmented reality (AR) technology is blurring the lines between the physical and digital worlds, offering immersive experiences across various domains"
            },
            {
                title: "The promise of edge computing",
                body: "As the volume of data generated by IoT devices continues to skyrocket, traditional cloud computing architectures are facing scalability and latency challenges."
            }
        ])
        .then(posts => {
            console.log('Posts inserted successfully:', posts);
        })
        .catch(error => {
            console.error('Error inserting posts:', error);
        });
    }

    // Connect to MongoDB using Mongoose
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connected to MongoDB');
            // Insert post data after successfully connecting to MongoDB
            insertPostData();
        })
        .catch(error => {
            console.error('Error connecting to MongoDB:', error);
        });
        
        // rendering the about page

    router.get('/about', (req, res) => {     
        res.render('about');
    }); 
    */

    return router;

};
