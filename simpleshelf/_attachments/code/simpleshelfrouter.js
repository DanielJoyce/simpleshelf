/**
 * router for simpleshelf
 */
window.SimpleShelfLibrary = Backbone.Router.extend({
    routes: {
        '': 'home',
        'tags/:tagName': 'tags',
        'books/:bookId': 'books'
    },
    
    initialize: function(){
        console.log("initializing SimpleShelfLibrary (Backbone.Router)");
        _.bindAll(this, 'home', 'tags', 'books');

        /*this.infoView = new LibraryInfoView({
            collection: window.library
        });*/

        this.navigationView = new NavigationView({});

        this.spineListView = new SpineListView({
            collection: window.spineList
        });

        this.tagCloudView = new TagCloudView({
            collection: window.tagList
        });
        
        // the following views are initially hidden
        window.book = new window.Book();
        this.editBookView = new EditBookView({
            model: window.book
        })
        
        this.bookView = new BookView({
            model: window.book
        });

        // prep UI objects
        this._profile = $("#profile");
        this._items = $('#items');
        this._sidebar = $('#sidebar');

        // one-time setup
        this._profile.append(this.navigationView.render().el)
    },
    
    home: function() {
        this._items.empty().append(this.spineListView.render().el);
        this.tagCloudView.resetTags();
        this._sidebar
            .empty()
            .append(this.tagCloudView.render().el);
    },

    /**
     * Route for a specific tag
     */
    tags: function(tagName){
        console.log("Routing to tag", tagName);
    },
    
    books: function(bookId){
        console.log('Routing to book', bookId);
        // TODO: setup couchdb's routes & sync w/next line
        // Backbone.history.navigate('./books/' + bookId);
        // clear UI container
        this._items.empty();
        
        var me = this;
        
        if (bookId == null){
            // new book
            window.book = new window.Book();
            me.editBookView.initialize({model: window.book});
            me._items.append(me.editBookView.render().el);
        } else {
            // get requested book
            var loadBookView = function(){
                // create book view
                me.bookView.initialize({
                    model: window.book
                });
                // append book view to DOM
                me._items.append(me.bookView.render().el);
            }
            if (window.book.id != bookId){
                window.book = new Book({id: bookId});
                window.book.fetch({success: loadBookView});
            } else {
                loadBookView();
            }
        }
    }
});
