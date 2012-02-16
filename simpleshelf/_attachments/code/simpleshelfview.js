/**
 * Views for simpleshelf
 */

// set underscore to use mustache-style interpolation
_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

/**
 * Show basic info about entire library; based on Library [collection]
 */
window.LibraryInfoView = Backbone.View.extend({
    template: _.template('<ul><li>book count: {{ bookCount }}</li></ul>'),
    tagName: "div",
    className: "info-view",

    initialize: function(){
        _.bindAll(this, "render");
        this.collection.bind('reset', this.render);
    },

    render: function() {
        $(this.el).html(this.template({bookCount: this.collection.length}));
        return this;
    }
});

/**
 * Navigation for entire app
 */
window.NavigationView = Backbone.View.extend({
    template: _.template(
        '<ul></ul>'
    ),
    tagName: "div",
    className: "navigation-view",
    events: {
      'click .newbook': 'addBook',
      'click .index': 'goIndex'
    },
    viewName: 'NavigationView',

    initialize: function(){
        _.bindAll(this, "render", "addBook", "goIndex");
    },

    render: function(){
        // get template
        var $parent = $(this.template());

        // add links
        var links = {
            "newbook": "New book",
            "index": "Index"
            }

        var linkTemplate = _.template('<li><a href="#{{key}}" class="{{key}}">{{name}}</a></li>');
        _.each(links, function(value, key, list){
            $parent.append(linkTemplate({'key': key, 'name': value}));
        });

        $(this.el).html($parent);
        return this;
    },

    goIndex: function(event){
        event.preventDefault();
        // return home
        this.options.dispatcher.trigger('navigation:index');
    },

    addBook: function(event){
        event.preventDefault();
        // show new book form
        this.options.dispatcher.trigger('navigation:newbook');
    }
});

/**
 * Container for simple list of titles
 */
window.SpineListView = Backbone.View.extend({
    template: _.template('<h2>All books</h2><ul></ul>'),
    tagName: 'div',
    className: 'spine-list-view',
    viewName: 'SpineListView',

    initialize: function(){
        _.bindAll(this, 'render', 'addAll', 'addOne', 'updateTag', 'bookSelected');
        this.collection.on('add', this.addOne);
        this.collection.on('reset', this.render);
    },

    render: function(){
        console.log('rendering window.SpineListView');
        $(this.el).html(this.template());
        this.addAll();
        return this;
    },

    onClose: function(){
        this.collection.off('add', this.addOne);
        this.collection.off('reset', this.render);
    },

    addAll: function() {
        console.log('SpineListView.addAll: this.collection.length==', this.collection.length)
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        // TODO: hold in array for onClose clean-up
        var view = new SpineView({
            dispatcher: this.options.dispatcher,
            model: model
        });
        view.render();
        $('ul', this.el).append(view.el);
        model.on('remove', view.remove);
        // even though the subview is given the dispatcher reference,
        // its events should still bubble up to the parent view, which
        // will handle dispatching them globally
        view.on('spineview:selected', this.bookSelected)
    },

    updateTag: function(msgArgs){
        console.log('SpineListView:updateTag', msgArgs);
        this.collection.filterByTag(msgArgs);
    },

    bookSelected: function(msgArgs){
        console.log('SpineListView:bookSelected', msgArgs);
        this.options.dispatcher.trigger('spinelistview:bookSelected', msgArgs.bookId);
    }
});

/**
 * Simple representation of book
 */
window.SpineView = Backbone.View.extend({
    className: 'spine-view',
    tagName: 'li',
    template: _.template('<span class="spine"><a href="./{{id}}">{{title}}</a></span> <span class="del"><a href="#">delete</a></span>'),
    events: {
      'click .spine a': 'bookSelected',
      'click .del a': 'bookRequestedDelete'
    },
    viewName: 'SpineView',

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove', 'bookSelected', 'bookRequestedDelete');
        this.model.on('change', this.render);
        this.model.on('destroy', this.remove);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    
    onClose: function(){
        this.model.off('change', this.render);
        this.model.off('destroy', this.remove);
    },

    remove: function() {
        $(this.el).remove();
    },

    bookRequestedDelete: function(evt){
        console.log("SpineView: deleted book", this.options.model);
        evt.preventDefault();
        // verify!
        if (window.confirm("Ok to delete \"" + this.options.model.get("title") + "\"?")){
            this.model.destroy({'wait': true});
        }
    },

    bookSelected: function(evt){
        console.log('SpineView: selected book', this.options.model)
        evt.preventDefault();
        // signal to switch to full view for this book
        this.model.select();
        this.trigger('spineview:selected', {'bookId': this.model.get('id')});
    }
});

/**
 * Show individual tag
 */
window.TagView = Backbone.View.extend({
    className: 'tag',
    tagName: 'li',
    template: _.template('{{ tag }}, {{ count }}'),

    events: {
        'click': 'tagSelected'
    },
    viewName: 'TagView',

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove', 'highlightIfMatch');
        this.model.bind('change', this.render);
        this.model.bind('destroy', this.remove);
        this.model.bind('tag:highlight', this.highlightIfMatch);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        if (this.model.get('selected'))
            $(this.el).addClass('selected');
        return this;
    },

    remove: function() {
        $(this.el).remove();
    },

    tagSelected: function(){
        this.log('TagView: click evt for tag==' + this.model.get('tag'));
        this.model.select();
        this.trigger('tagview:selected', this.model.get('tag'));
    },

    highlightIfMatch: function(tag){
        $(this.el).toggleClass('selected', (this.model.get('tag') == tag));
    }
});

/**
 * Show tag cloud
 */
window.TagCloudView = Backbone.View.extend({
    className: 'tagcloud',
    tagName: 'div',
    template: _.template('<h2 class="tagheader"><a href="#" id="tagcloudviewheader">Tags</a></h2><ul></ul>'),
    events: {
        'click #tagcloudviewheader': 'tagResetRequested'
    },
    viewName: 'TagCloudView',

    initialize: function(properties) {
        _.bindAll(this, 'render', 'addAll', 'addOne', 'tagResetRequested', 'tagSelected',
            'resetTags', 'reloadTags');
        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.render);
    },

    render: function() {
        this.log('rendering window.TagCloudView');
        $(this.el).html(this.template());
        $('.tagheader', this.el).attr('title', 'Click to show all tags');
        this.addAll();
        return this;
    },

    addAll: function() {
        this.log('TagCloudView.addAll: this.collection.length==', this.collection.length)
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        var view = new TagView({
            dispatcher: this.options.dispatcher,
            model: model,
            okToLog: this.okToLog
        });
        view.render();
        $('ul', this.el).append(view.el);
        model.bind('remove', view.remove);
        view.bind('tagview:selected', this.tagSelected)
    },
    
    reloadTags: function(){
        this.log('TagListView.reload');
        this.collection.fetch();
    },

    resetTags: function(fromEvent){
        this.log('TagCloudView.resetTags');
        this.collection.selectTag(null);
        if (fromEvent){
            // fired from UI event; ok to trigger further actions
            this.options.dispatcher.trigger('tagcloudview:tagsreset', {'tag': null});
        }
    },

    tagResetRequested: function(evt){
        evt.preventDefault();
        this.log('TagCloudView.tagResetRequested');
        this.resetTags(true);
    },

    tagSelected: function(tag){
        this.log('TagCloudView.tagSelected event', tag);
        this.options.dispatcher.trigger('tagcloudview:tagselected', tag);
    }
});

/**
 * Show all information for single book
 */
window.BookView = Backbone.View.extend({
    className: 'book',
    tagName: 'div',
    template: _.template(
        '<h2>Book</h2>' +
        '<div class="menu">' +
        '<button id="edit">Edit</button>' +
        '</div>' +
        '<div class="bookinfo"/>'
    ),
    // templates for the different values in a book
    // TODO: custom templates for status, notes
    simpleTemplates: {
        'simpleField': _.template(
            '<tr class="simple"><td><span class="title">{{title}}</span></td>' +
            '<td><span class="value">{{value}}</span></td></tr>'
        ),
        'tags': _.template(
            '<tr class="tags"><td><span class="title">{{title}}</span></td>' +
            '<td><span class="value">{{value}}</span></td></tr>'
        )
    },

    events: {
        'click #edit': 'editBook'
    },

    initialize: function(options){
        _.bindAll(this, 'render', 'editBook');
    },

    render: function(){
        console.log('BookView: rendering');
        $(this.el).html(this.template());

        // build lines programmatically
        var dataKeys = ['title', 'author', 'isbn', 'openlibrary', 'publisher', 'tags'];
        var htmlSnippets = {'tags': this.simpleTemplates.tags};
        var bookinfoEl = $('.bookinfo', this.el);
        var table = $('<table/>');
        var me = this;

        // for each data element (in specified order), render as TR
        _.each(dataKeys, function(element, index, list){
            if (_.has(htmlSnippets, element)){
                // render specific field
                table.append(htmlSnippets[element]({title: element, value: me.model.get(element)}));
            } else {
                // render element in generic way
                table.append(me._addSimpleField(element, me.model.get(element)));
            }
        });

        bookinfoEl.append(table);
        return this;
    },

    editBook: function(evt){
        evt.preventDefault();
        // show new book form
        this.options.dispatcher.trigger('navigation:editbook', this.model.id);
    },

    _addSimpleField: function(fieldTitle, fieldValue){
        return this.simpleTemplates.simpleField({title: fieldTitle, value: fieldValue});
    }
});

/**
 * Add/edit book
 */
window.EditBookView = Backbone.View.extend({
    className: 'editBook',
    tagName: 'div',
    template: _.template(
        '<h2>Book</h2>' +
        '<form class="bookinfo" id="editbookviewform"/>'
    ),

    dataKeys: ['title', 'author', 'isbn', 'openlibrary', 'publisher', 'tags'],
    simpleTemplates: {
        'simpleField': _.template(
            '<tr class="simple {{key}}"><td><span class="title">{{title}}</span></td>' +
            '<td><input type="text" name="{{key}}" value="{{value}}"></td></tr>'
        ),
        'tags': _.template(
            '<tr class="complex {{key}}"><td><span class="title">{{title}}</span></td>' +
            '<td><input type="text" name="{{key}}" value="" id="taginput"></td></tr>'
        )
    },
    
    events: {
        'click .submit': 'save',
        'click .cancel': 'cancel'
    },

    initialize: function(options){
        _.bindAll(this, 'render', 'dataChanged', 'dataSynced', 'save', 'cancel',
            '_addSimpleField', '_getFormData', '_prepPlugins');
        this.model.bind('change', this.dataChanged);
        this.model.bind('sync', this.dataSynced);
    },

    render: function(){
        console.log('EditBookView: rendering');
        $(this.el).html(this.template());

        // build lines programmatically
        var normalInputs = ['title', 'author', 'isbn', 'openlibrary', 'publisher'];
        var htmlSnippets = {'tags': this.simpleTemplates.tags};
        var bookinfoEl = $('.bookinfo', this.el);
        var table = $('<table/>');
        var me = this;

        // for each data element (in specified order), render as TR
        _.each(this.dataKeys, function(element, index, list){
            if (_.indexOf(normalInputs, element) != -1) {
                // render element in generic way
                table.append(me._addSimpleField(element, element));
            } else if (_.has(htmlSnippets, element)){
                var properValue;
                switch(element){
                    case "tags":
                        properValue = me.model.get(element).join(" ");
                        break;
                    default:
                        properValue = me.model.get(element);
                        break;
                }
                table.append(me.simpleTemplates[element]({
                    title: element,
                    key: element,
                    value: properValue
                }));
            }
        });

        var htmlTail = '<input type="submit" value="Submit" class="submit">&nbsp;' +
            '<button class="cancel">Cancel</button>';
        bookinfoEl.append(table).append(htmlTail);

        // call prep plugins after timeout to let DOM render
        window.setTimeout(function(){
            me._prepPlugins();            
        }, 50);

        return this;
    },
    
    _prepPlugins: function(){
       $('#taginput', this.$el).tagsInput({
           'interactive': true
       }).importTags(this.model.get('tags').join(','));
    },
    
    save: function(event){
        event.preventDefault();
        console.log("EditBookView:save", this.model.isNew());
        
        $('input.submit', this.el).attr("disabled", "disabled");
        
        // save everything
        var freshData = this._getFormData();

        // TODO: handle validation
        this.model.save(freshData, {'wait': true});
    },

    /**
     * User requested form cancel; prevent lost changes
     */
    cancel: function(evt){
        evt.preventDefault();
        var formData = this._getFormData();
        var me = this, difference = false, anyDifferences = false, okToGo = false;
        // check for changes; ask user to abandon
        _.each(formData, function(value, key, list){
            difference = false;
            // handle special fields separately
            switch(key){
                case "tags":
                    if (!formData[key].smartCompare(me.model.get(key))){
                        difference = true;
                    }
                    break;

                default:
                    difference = (formData[key] != me.model.get(key));
                    break;
            }

            if (difference){
                console.log('EditBookView.cancel difference', key, value, me.model.get(key));
                anyDifferences = true;
            }
        });

        okToGo = anyDifferences ? window.confirm("There are changes, ok to abandon?") : true;

        if (okToGo){
            this.options.dispatcher.trigger('editbookview:canceledit', this.model.id);
        }
    },

    dataChanged: function(event){
        // console.log("model's data has changed");
    },
    
    dataSynced: function(event){
        console.log("EditBookView: dataSynced");
        this.options.dispatcher.trigger('editbookview:dataSynced', this.model.id);
    },

    _addSimpleField: function(fieldKey, fieldTitle){
        return this.simpleTemplates.simpleField({
            title: fieldTitle,
            key: fieldKey,
            value: this.model.get(fieldKey)
        });
    },

    /**
     * Serialize form data
     */
    _getFormData: function(){
        var formData = {};
        var me = this;
        _.each($('form', this.el).serializeArray(), function(element, index, list){
            if (element.name == "tags"){
                // TODO more robust method of splitting
                formData["tags"] = element.value.split(',');
            } else {
                if (_.indexOf(me.dataKeys, element.name) > -1){
                    formData[element.name] = element.value;
                }
            }
        });
        return formData;
    }
});
