/**
 * Views for simpleshelf
 * To protect the templates from premature initialization, wrap all views in document.ready
 */

$(document).ready(function(){
/**
 * Show basic info about entire library; based on Library [collection]
 */
window.LibraryInfoView = Backbone.View.extend({
    template: "#info-template",
    tag: "div",
    className: "info-view",
    
    initialize: function(){
        _.bindAll(this, "render");
        this.initializeTemplate();
        this.collection.bind('reset', this.render);
    },
    
    initializeTemplate: function() {
        this.template = _.template($(this.template).html());
    },

    render: function() {
        $(this.el).html(this.template({bookCount: this.collection.length}));
        return this;
    }
});

});