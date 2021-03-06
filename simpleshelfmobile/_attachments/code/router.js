"use strict";
/**
 * Handle all routes.
 */
define([
    "underscore",
    "backbone",
    "app"
], function(_, Backbone, app) {

    // Define the application router.
    var Router = Backbone.Router.extend({
        routes: {
            "": "index",
            "login": "login",
            "main" : "main",
            "books": "books",
            "books/:id": "book"
        },

        initialize: function(options) {
            this._lastPageId = null;
            this._currentPageId = null;
        },

        /**
         * Index route (default)
         */
        index: function() {
            this._log("/ route.");
            // this._changeScreen(app.views.frontPageView);
        },

        login: function() {
            this._log("/login");
            this._changeScreen(app.views.loginPageView);
        },

        main: function() {
            this._log("/main");
            $.when(
                app.views.mainPageView.model.fetch(),
                app.views.mainPageView.books.fetch()
            ).always(_.bind(function() {
                app.views.mainPageView.render();
                this._changeScreen(app.views.mainPageView);
            }, this));
        },

        books: function() {
            this._log("/books");
            
            // Only load the spine collection *once*.
            // Since the view renders itself when the collection syncs, no need to call it here.
            $.when(
                app.catalog.loadBooksByLetter(),
                app.catalog.loadSpines()
            ).always(_.bind(function() {
                this._changeScreen(app.views.booksPageView);
            }, this));
        },

        book: function(bookId) {
            this._log("/book/" + bookId);
            app.views.bookPageView.model.clear({"silent": true});
            app.views.bookPageView.model.set("id", bookId);
            $.when(
                app.views.bookPageView.model.fetch()
            ).always(_.bind(function() {
                app.views.bookPageView.render();
                this._changeScreen(app.views.bookPageView);
            }, this));
        },

        /**
         * Change to another view.
         */
        _changeScreen: function(view, options) {
            // console.info("Changing from", this._currentPageId, "to", view.$el.attr("id"),
            //     "last==" + this._lastPageId);
            // Check if moving to the previous page.
            var changeOptions = {};
            if (this._lastPageId === view.$el.attr("id")) {
                changeOptions.reverse = true;
                this._lastPageId = null;
            } else {
                this._lastPageId = this._currentPageId;
            }
            this._currentPageId = view.$el.attr("id");

            $("body").pagecontainer("change", view.$el, changeOptions);
        },

        _log: function() {
            console.log("[router]", _.toArray(arguments).join(" "));
        }

    });

    return Router;
});
