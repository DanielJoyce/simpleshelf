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

        this.spineListView = new SpineListView({
            collection: window.spineList
        });

        this.tagCloudView = new TagCloudView({
            collection: window.tagList
        });
        
        // prep UI objects
        this._items = $('#items');
        this._sidebar = $('#sidebar');
    },
    
    home: function() {
        this._items.empty().append(this.spineListView.render().el);
        this._sidebar.append(this.tagCloudView.render().el);
    },

    /**
     * Route for a specific tag
     */
    tags: function(tagName){
        console.log("Routing to tag", tagName);
    },
    
    books: function(bookId){
        console.log('Routing to book', bookId);
        Backbone.history.navigate('./books/' + bookId);
    }
});
