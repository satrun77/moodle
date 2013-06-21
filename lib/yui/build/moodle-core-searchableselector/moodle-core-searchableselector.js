YUI.add('moodle-core-searchableselector', function (Y, NAME) {

/**
 * This file contains a module to convert the form select element into a searchable selector element.
 *
 * @module moodle-core-searchableselector
 */

/**
 * Constructs a new searchable selector element.
 *
 * @constructor
 * @class M.core.searchableselector
 * @extends Y.Base
 */
var SEARCHABLESELECTOR = function() {
    SEARCHABLESELECTOR.superclass.constructor.apply(this, arguments);
};

Y.extend(SEARCHABLESELECTOR, Y.Base, {

    /**
     * The node instance for the select element.
     *
     * @property select
     * @type Node
     * @protected
     */
    select: null,

    /**
     * The node instance for the search textfield element.
     *
     * @property searchfield
     * @type Node
     * @protected
     */
    searchfield: null,

    /**
     * The node instance for the list of selected items.
     *
     * @property selectedlist
     * @type Node
     * @protected
     */
    selectedlist: null,

    /**
     * The array containing the IDs of the selected items by the user.
     *
     * @property selecteditems
     * @type Array
     * @protected
     */
    selecteditems: [],

    /**
     * The node instance for the spinner icon.
     *
     * @property spinner
     * @type Node
     * @protected
     */
    spinner: null,

    /**
     * Initialize the module
     *
     * @method initializer
     * @chainable
     */
    initializer: function() {
        // Y.AutoComplete configuration.
        config = {},

        // User defined source.
        source = this.get('source');

        this.select = Y.one('#' + this.get('selectid'));
        this.searchfield = Y.one('#' + this.get('searchfieldid'));
        this.selectedlist = Y.one('#' + this.get('selectedlistid'));

        if (!this._check_required_attributes()) {
            return this;
        }

        // Hide the main select element.
        if (this.select) {
            this.select.hide();
        }

        // Create autocomplete
        config = {
            resultListLocator: Y.bind('_resultListLocator', this),
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
        this.select.all('option:checked').each(Y.bind(function(option) {
            this.select_item(option.getContent(), option.get('value'));
        }, this));

        return this;
    },

    /**
     * Remove all of the selected items.
     *
     * @method remove_selected_items
     * @chainable
     */
    remove_selected_items: function() {
        this.select.setContent('');
        this.selectedlist.setContent('');
        while (this.selecteditems.length > 0) {
            this.selecteditems.pop();
        }
        return this;
    },

    /**
     * Select an item.
     *
     * @method select_item
     * @param {String} name
     * @param {Number} id
     * @chainable
     */
    select_item: function(name, id) {
        // If only one item can be selected, then clear all of the existing items before selecting new item.
        if (!this.get('ismultiple')) {
            this.remove_selected_items();
        }

        // Execute a user defined callback if it exist.
        var callback = this.get('selecteditem_template');
        if (callback !== null) {
            callback.call(this);
            return this;
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
            var idindex = this.selecteditems.indexOf(id);
            if (idindex !== -1) {
                this.selecteditems.splice(idindex, 1);
            }
        }, this);
        li.append(removebutton);
        this.selectedlist.append(li);

        // Add the item id to the selected items array.
        this.selecteditems.push(id);

        // Add an option element to the hidden select element and make it selected.
        // These are the values that are going to be submitted with form data.
        var option = Y.Node.create('<option />')
                .set('text', stripHTML(name))
                .set('value', parseInt(id, 10))
                .set('selected', 'selected');
        this.select.append(option);

        return this;
    },

    /**
     * Callback function for 'resultListLocator' in Y.AutoCompleteList.
     *
     * Iterator over the response object from the Ajax request to filter out the selected items and also to make
     * sure the autocomplete result list is in the expacted format. An array containing objects
     * with 2 properties (name and id).
     *
     * @method _resultListLocator
     * @private
     * @param {Object} response
     * @return {Array} The array of search results.
     */
    _resultListLocator: function(response) {
        var results = [];
        Y.Object.each(response, function(name, id) {
            if (this.selecteditems.indexOf(id) === -1) {
                results.push({name: name, id: id});
            }
        }, this);
        return results;
    },

    /**
     * Show spinner icon.
     *
     * @method _show_spinner
     * @private
     * @chainable
     */
    _show_spinner: function() {
        if (!this.spinner) {
            this.spinner = M.util.add_spinner(Y, this.searchfield.get('parentNode'));
        }
        this.spinner.show();
        return this;
    },

    /**
     * Hide visible spinner icon.
     *
     * @method _hide_spinner
     * @private
     * @chainable
     */
    _hide_spinner: function() {
        if (this.spinner) {
            this.spinner.hide();
        }
        return this;
    },

    /**
     * Function called on the select event to select an item.
     *
     * @method _item_selected
     * @private
     * @param {EventFacade} e
     */
    _item_selected: function(e) {
        var result = e.result.raw;

        // Prevent the default select handler so we can provide our own selection behavior instead.
        e.preventDefault();
        this.searchfield.select();
        this.searchfield.ac.hide();

        // Select an item and render the selected item template.
        this.select_item(result.name, result.id);

        // To keep the results list visible & remove selected item after a user has selected an item.
        Y.later(1, this.searchfield.ac, 'sendRequest', [''], false);
        Y.later(1, this.searchfield.ac, 'show', [], false);
    },

    /**
     * Returns the Y.AutoComplete source value.
     *
     * @method _get_source
     * @private
     * @return {String|Function} A URL to the server file or callback function.
     */
    _get_source: function() {
        var source = this.get('source');
        if (source !== null) {
            return source;
        }
        var file = this.get('serverfile');
        if (file === null) {
            this._log("Misconfigured 'source' attribute in Y.AutoComplete. The 'serverfile' and 'source' " +
                      "attributes are empty in M.core.searchableselector. One of these attributes should have " +
                      "a valid value.", "warn");
        }
        return file + '?keyword={query}&' + this.get('serverparams');
    },

    /**
     * Validate the required attributes.
     *
     * @method _check_required_attributes
     * @private
     * @return {Boolean}
     */
    _check_required_attributes: function() {
        var errormessage = '';
        if (!this.select) {
            errormessage += "- Unable to find the select element.\n";
        }

        if (!this.searchfield) {
            errormessage += "- Unable to find the select search field element.\n";
        }

        if (!this.selectedlist) {
            errormessage += "- Unable to find the container element for the selected items.\n";
        }

        if (errormessage !== '') {
            this._log(errormessage, 'error');
            return false;
        }
        return true;
    },

    /**
     * Helper method to output message to the console.
     *
     * @method _log
     * @private
     */
    _log: function(message, type) {
    }
},
{
    NAME: 'moodle-core-searchableselector',
    ATTRS: {

        /**
         * The id attribute for the select element.
         *
         * @attribute selectid
         * @required
         * @type String|Null
         * @default Null
         */
        selectid: {
            value: null
        },

        /**
         * The id attribute for the search field element.
         *
         * @attribute searchfieldid
         * @required
         * @type String|Null
         * @default Null
         */
        searchfieldid: {
            value: null
        },

        /**
         * The id attribute for the html element 'ul' containing list of the selected items.
         *
         * @attribute selectedlistid
         * @required
         * @type String|Null
         * @default Null
         */
        selectedlistid: {
            value: null
        },

        /**
         * The url to be used in the Ajax request to retrieve the search results.
         * The value must not include any parameters. see attribuet 'serverparams'.
         *
         * @attribute serverfile
         * @optional
         * @type String|Null
         * @default Null
         */
        serverfile: {
            value: null,
            validator : function (value) {
                return Y.Lang.isString(value) && value.length;
            }
        },

        /**
         * The query string to be added to the attribute 'serverfile'. (e.g name1=value1&name2=value2)
         *
         * @attribute serverparams
         * @optional
         * @type String|Null
         * @default Null
         */
        serverparams: {
            value: null,
            validator : function (value) {
                return Y.Lang.isString(value) && value.length;
            }
        },

        /**
         * The boolean value to indicate if the select element has the 'multiple' attribute.
         *
         * @attribute ismultiple
         * @optional
         * @type Boolean
         * @default False
         */
        ismultiple: {
            value: false,
            validator : Y.Lang.isBoolean
        },

        /**
         * The callback function to render a selected item.
         * The callback function has 2 parameters callback(name, id).
         *
         * @attribute selecteditem_template
         * @optional
         * @type Function
         * @default Null
         */
        selecteditem_template: {
            value: null,
            validator: Y.Lang.isFunction
        },

        /**
         * Callback function to define static source to replace the ajax request.
         *
         * @example
         *     function() {
         *         return {"1":"Title 1", "2":"Title 2", "3":"Title 3", "4":"Title 4"};
         *     }
         * @attribute source
         * @optional
         * @type Function
         * @default Null
         */
        source: {
            value: null,
            validator : function (value) {
                return Y.Lang.isString(value) && value.length;
            }
        }
    }
});

/**
 * Core namespace.
 *
 * @static
 * @class core
 */
M.core = M.core || {};

/**
 * searchableselector namespace.
 *
 * @namespace M.core
 * @class searchableselector
 * @static
 */
M.core.searchableselector = M.core.searchableselector || {};

/**
 * An array contains the instances of the searchableselector classes.
 *
 * @static
 * @property instance
 * @type {Array}
 */
M.core.searchableselector.instances = M.core.searchableselector.instances || [];

/**
 * Init function.
 *
 * @method init
 * @static
 * @param {Object} params
 * @return {SEARCHABLESELECTOR}
 */
M.core.searchableselector.init = function(params) {
    var searchableselector = new SEARCHABLESELECTOR(params);
    M.core.searchableselector.instances.push(searchableselector);
    return searchableselector;
};


}, '@VERSION@', {"requires": ["base", "io", "moodle-core-notification", "autocomplete", "autocomplete-filters"]});
