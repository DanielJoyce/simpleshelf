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
            "books": "books"
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
            $.when(
                app.views.booksPageView.collection.fetch(),
                app.catalog.spineCollection.fetch()
            ).always(_.bind(function() {
                app.views.booksPageView.render();
                this._changeScreen(app.views.booksPageView);
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
