var SEARCHABLESELECTOR = function() {
    SEARCHABLESELECTOR.superclass.constructor.apply(this, arguments);
};

Y.extend(SEARCHABLESELECTOR, Y.Base, {

    /**
     * The node instance for the select element.
     * @type Node
     * @protected
     */
    select: null,

    /**
     * The node instance for the search textfield element.
     * @type Node
     * @protected
     */
    searchfield: null,

    /**
     * The node instance for the list of selected items.
     * @type Node
     * @protected
     */
    selectedlist: null,

    /**
     * The array containing the IDs of the selected items by the user.
     * @type Array
     * @protected
     */
    selecteditems: [],

    /**
     * The node instance for the spinner icon.
     * @type Node
     * @protected
     */
    spinner: null,

    /**
     * Initialize the module
     * @return {Self} An instance of the current object.
     */
    initializer: function() {
        // Variable to reference the current object.
        var me = this,

        // Y.AutoComplete configuration.
        config = {},

        // User defined source.
        source = this.get('source');

        try {
            this.select = Y.one('#' + this.get('selectid'));
            this.searchfield = Y.one('#' + this.get('searchfieldid'));
            this.selectedlist = Y.one('#' + this.get('selectedlistid'));

            // Hide the main select element.
            if (this.select) {
                this.select.hide();
            }

            // Create autocomplete
            config = {
                resultListLocator: function(response) {
                    return me._resultListLocator(response);
                },
                resultTextLocator: 'name',
                width: 'auto',
                source: this._get_source()
            };
            // We use an autocomplete filter, if the source isn't from Ajax request.
            if (source !== null) {
                config.resultFilters = 'phraseMatch';
            }
            this.searchfield.plug(Y.Plugin.AutoComplete, config);

            // On typing, show spinner icon to indicate that something is in progress.
            this.searchfield.on('keyup', this._show_spinner, this);

            // After an item is selected from the autocomplete list.
            this.searchfield.ac.on('select', this._item_selected, this);

            // After the result returned from the server.
            this.searchfield.ac.on('results', this._hide_spinner, this);

            // pre-selected items
            this.select.all('option:checked').each(function(option) {
                me.select_item(option.getContent(), option.get('value'));
            });
        } catch (error) {
            return this._throw_exception(error);
        }
        return this;
    },

    /**
     * Remove all of the selected items.
     * @return {Boolean}
     */
    remove_selected_items: function() {
        try {
            this.select.setContent('');
            this.selectedlist.setContent('');
            while (this.selecteditems.length > 0) {
                this.selecteditems.pop();
            }
        } catch (error) {
            return this._throw_exception(error);
        }
        return true;
    },

    /**
     * Select an item.
     * @param {String} name
     * @param {Int} id
     * @return {Boolan}
     */
    select_item: function(name, id) {
        try {
            // If only one item can be selected, then clear all of the existing items before selecting new item.
            if (!this.get('ismultiple')) {
                this.remove_selected_items();
            }

            // Execute a user defined callback if it exist.
            var callback = this.get('selecteditem_template');
            if (callback !== null) {
                return callback(name, id);
            }

            // Render the default template. A 'li' tag with a delete button.
            var li = Y.Node.create('<li />').setContent('<span>' + name + '</span>');
            var removebutton = Y.Node.create('<button />').addClass('yui3-button closebutton');
            removebutton.on('click', function(e) {
                e.preventDefault();
                var option = this.select.one('option[value="' + id + '"]');
                if (option) {
                    option.remove();
                }
                e.target.get('parentNode').remove();
            }, this);
            li.append(removebutton);
            this.selectedlist.append(li);

            // Add the item id to the selected items array.
            this.selecteditems.push(id);

            // Add an option element to the hidden select element and make it selected.
            // These are the values that are going to be submitted with form data.
            var option = Y.Node.create('<option />')
                    .set('text', stripHTML(name))
                    .set('value', parseInt(id))
                    .set('selected', 'selected');
            this.select.append(option);
        } catch (error) {
            return this._throw_exception(error);
        }
        return true;
    },

    /**
     * Callback function for 'resultListLocator' in Y.AutoCompleteList.
     * @private
     * @param {JSON} response
     * @return {Array} The array of search results.
     */
    _resultListLocator: function(response) {
        var results = new Array;
        Y.Object.each(response, function(name, id) {
            if (this.selecteditems.indexOf(id) === -1) {
                results.push({name: name, id: id});
            }
        }, this);
        return results;
    },

    /**
     * Show spinner icon.
     * @private
     * @return {Boolean}
     */
    _show_spinner: function() {
        if (!this.spinner) {
            this.spinner = M.util.add_spinner(Y, this.searchfield.get('parentNode'));
        }
        this.spinner.show();
        return true;
    },

    /**
     * Hide visible spinner icon.
     * @private
     * @return {Boolean}
     */
    _hide_spinner: function() {
        if (this.spinner) {
            this.spinner.hide();
            return true;
        }
        return false;
    },

    /**
     * Function called on the select event to select an item.
     * @private
     * @param {EventFacade} e
     * @return {Boolean}
     */
    _item_selected: function(e) {
        var result = e.result.raw;

        // Prevent the default select handler so we can provide our own selection behavior instead.
        e.preventDefault();
        this.searchfield.select();
        this.searchfield.ac.hide();

        // Select an item and render the selected item template.
        this.select_item(result.name, result.id);

        // To keep the results list visible.
        Y.later(1, this.searchfield.ac, 'show', [], false);

        return true;
    },

    /**
     * Returns the Y.AutoComplete source value.
     * @private
     * @return {String|Function} A URL to the server file or callback function.
     */
    _get_source: function() {
        var source = this.get('source');
        if (source !== null) {
            return source;
        }
        return this.get('serverfile') + '?keyword={query}&' + this.get('serverparams');
    },

    /**
     * Throw Moodle exception.
     * @private
     * @return {M.core.exception}
     */
    _throw_exception: function(error) {
        return new M.core.exception({
            message: error.message,
            name: error.name,
            fileName: error.fileName,
            lineNumber: error.lineNumber,
            stack: error.stack
        });
    }
},
{
    NAME: 'moodle-core-searchableselector',
    ATTRS: {

        /**
         * The id attribute for the select element.
         * @attribute selectid
         * @type String|Null
         * @default Null
         */
        selectid: {
            value: null
        },

        /**
         * The id attribute for the search field element.
         * @attribute searchfieldid
         * @type String|Null
         * @default Null
         */
        searchfieldid: {
            value: null
        },

        /**
         * The id attribute for the html element 'ul' containing list of the selected items.
         * @attribute selectedlistid
         * @type String|Null
         * @default Null
         */
        selectedlistid: {
            value: null
        },

        /**
         * The url to be used in the Ajax request to retrieve the search results.
         * The value must not include any parameters. see attribuet 'serverparams'.
         * @attribute serverfile
         * @type String|Null
         * @default Null
         */
        serverfile: {
            value: null
        },

        /**
         * The query string to be added to the attribute 'serverfile'. (e.g name1=value1&name2=value2)
         * @attribute serverparams
         * @type String|Null
         * @default Null
         */
        serverparams: {
            value: null
        },

        /**
         * The boolean value to indicate if the select element has the 'multiple' attribute.
         * @attribute ismultiple
         * @type Boolean
         * @default False
         */
        ismultiple: {
            value: false
        },

        /**
         * The callback function to render a selected item.
         * The callback function has 2 parameters callback(name, id).
         * @attribute selecteditem_template
         * @type Function
         * @default Null
         */
        selecteditem_template: {
            value: null
        },

        /**
         * Callback function to define static source to replace the ajax request.
         * Example,
         * function() {
         *     return {"1":"Title 1", "2":"Title 2", "3":"Title 3", "4":"Title 4"};
         * }
         * @attribute source
         * @type Function
         * @default Null
         */
        source: {
            value: null
        }
    }
});
M.core = M.core || {};
M.core.init_searchableselector = M.core.init_searchableselector || function(config) {
    return new SEARCHABLESELECTOR(config);
};
