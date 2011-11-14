// encase in jQuery-safe wrapper
(function($) {
    // prep vars
    window.library = new Library();
    window.tagList = new TagList();
    
    // load a set of books
    library.fetch();
    // load tags
    tagList.fetch();

    $(document).ready(function() {
        // reverse colors on the welcome msg
        $('#sidebar').css({backgroundColor: 'black', color: 'white'});
        
        // instantiate Router
        window.App = new SimpleShelfLibrary();
        // start (?) router
        Backbone.history.start({pushState: true});
        // go to start point
        window.App.home();
        
        // showImportMessage();
    });
})(jQuery);
