/**
 * Show individual report
 */
window.ReportView = Backbone.View.extend({
    className: 'report',
    tagName: 'li',
    template: _.template('{{ title }}'),

    events: {
        'click': 'reportSelected'
    },
    viewName: 'ReportView',

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove', 'reportSelected', 'highlightIfMatch');
        this.model.bind('change', this.render);
        this.model.bind('destroy', this.remove);
        this.model.bind('report:highlight', this.highlightIfMatch);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        if (this.model.get('selected')){
            $(this.el).addClass('selected');
        }
        return this;
    },

    remove: function() {
        $(this.el).remove();
    },

    reportSelected: function(){
        this.log(this.viewName + ' click evt for report==' + this.model.get('title'));
        this.model.select();
        this.trigger('reportview:selected', this.model.id);
    },

    highlightIfMatch: function(reportId){
        $(this.el).toggleClass('selected', (this.model.id == reportId));
    }
});
