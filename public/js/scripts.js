document.addEventListener('DOMContentLoaded', function(){


    const allButtons = document.querySelectorAll('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');

    for (var i = 0; i < allButtons.length; i++)
    {
        allButtons[i].addEventListener('click', function() {
        searchBar.style.visibility = 'visible'; //sets searchbar visibility from false to true
        searchBar.classList.add('open'); //accessing subclass open within class searchbar
        this.setAttribute('aria-expanded', 'true'); //from header.ejs file adding event to searchBtn
        searchInput.focus();
        });
    }

    searchClose.addEventListener('click', function() {
    searchBar.style.visibility = 'hidden'; //hides the searchbar
    searchBar.classList.remove('open'); //doesn't access searchbar open subclass anymore
    this.setAttribute('aria-expanded', 'false'); //reversing changes to event for searchBtn from header.ejs
    });

});