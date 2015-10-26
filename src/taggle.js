/* !
 * @author Sean Coker <sean@seancoker.com>
 * @version 1.5.1
 * @url http://sean.is/poppin/tags
 * @license MIT
 * @description Taggle is a dependency-less tagging library
 */

(function(window, document) {
    'use strict';

    var noop = function() {};

    var DEFAULTS = {
        /**
         * Class names to be added on each tag entered
         * @type {String}
         */
        additionalTagClasses: '',

        /**
         * Allow duplicate tags to be entered in the field?
         * @type {Boolean}
         */
        allowDuplicates: false,

        /**
         * Allow the saving of a tag on blur, rather than it being
         * removed.
         *
         * @type {Boolean}
         */
        saveOnBlur: false,

        /**
         * Class name that will be added onto duplicate existant tag
         * @type {String}
         */
        duplicateTagClass: '',

        /**
         * Class added to the container div when focused
         * @type {String}
         */
        containerFocusClass: 'active',

        /**
         * Name added to the hidden inputs within each tag
         * @type {String}
         */
        hiddenInputName: 'taggles[]',

        /**
         * Tags that should be preloaded in the div on load
         * @type {Array}
         */
        tags: [],

        /**
         * Tags that the user will be restricted to
         * @type {Array}
         */
        allowedTags: [],

        /**
         * If within a form, you can specify the tab index flow
         * @type {Number}
         */
        tabIndex: 1,

        /**
         * Placeholder string to be placed in an empty taggle field
         * @type {String}
         */
        placeholder: 'Enter tags...',

        /**
         * Keycodes that will add a tag
         * @type {Array}
         */
        submitKeys: [],

        /**
         * Preserve case of tags being added
         * @type {Boolean}
         */
        preserveCase: false,

        /**
         * Function hook called before a tag is added. Return false
         * to prevent tag from being added
         * @param  {String} tag The tag to be added
         */
        onBeforeTagAdd: noop,

        /**
         * Function hook called when a tag is added
         * @param  {Event} event Event triggered when tag was added
         * @param  {String} tag The tag added
         */
        onTagAdd: noop,

        /**
         * Function hook called before a tag is removed. Return false
         * to prevent tag from being removed
         * @param  {String} tag The tag to be removed
         */
        onBeforeTagRemove: noop,

        /**
         * Function hook called when a tag is removed
         * @param  {Event} event Event triggered when tag was removed
         * @param  {String} tag The tag removed
         */
        onTagRemove: noop
    };

    var BACKSPACE = 8;
    var COMMA = 188;
    var TAB = 9;
    var ENTER = 13;

    /**
     * Constructor
     * @param {Mixed} el ID of an element or the actual element
     * @param {Object} options
     */
    var Taggle = function(el, options) {
        var self = this;
        var settings = _extend({}, DEFAULTS, options);
        var measurements = {
            container: {
                rect: null,
                style: null,
                padding: null
            }
        };
        var container = el;
        var tag = {
            values: [],
            elements: []
        };
        var list = document.createElement('ul');
        var inputLi = document.createElement('li');
        var input = document.createElement('input');
        var sizer = document.createElement('div');
        var placeholder;

        if (settings.placeholder) {
            placeholder = document.createElement('span');
        }

        if (!settings.submitKeys.length) {
            settings.submitKeys = [COMMA, TAB, ENTER];
        }

        if (typeof el === 'string') {
            container = document.getElementById(el);
        }

        function _init() {
            _getMeasurements();
            _setupTextarea();
            _attachEvents();
        }

        /**
         * Gets all the layout measurements up front
         */
        function _getMeasurements() {
            var style;
            var lpad;
            var rpad;

            measurements.container.rect = container.getBoundingClientRect();
            measurements.container.style = window.getComputedStyle(container);

            style = measurements.container.style;
            lpad = parseInt(style['padding-left'] || style.paddingLeft, 10);
            rpad = parseInt(style['padding-right'] || style.paddingRight, 10);
            measurements.container.padding = lpad + rpad;
        }

        /**
         * Setup the div container for tags to be entered
         */
        function _setupTextarea() {
            var fontSize;

            list.className = 'taggle_list';
            input.type = 'text';
            input.className = 'taggle_input';
            input.tabIndex = settings.tabIndex;
            sizer.className = 'taggle_sizer';

            if (settings.tags.length) {
                for (var i = 0, len = settings.tags.length; i < len; i++) {
                    var taggle = _createTag(settings.tags[i]);
                    list.appendChild(taggle);
                }
            }

            if (placeholder) {
                placeholder.style.opacity = 0;
                placeholder.classList.add('taggle_placeholder');
                container.appendChild(placeholder);
                _setText(placeholder, settings.placeholder);

                if (!settings.tags.length) {
                    placeholder.style.opacity = 1;
                }
            }

            inputLi.appendChild(input);
            list.appendChild(inputLi);
            container.appendChild(list);
            container.appendChild(sizer);
            fontSize = window.getComputedStyle(input).fontSize;
            sizer.style.fontSize = fontSize;
        }

        /**
         * Attaches neccessary events
         */
        function _attachEvents() {
            _on(container, 'click', function() {
                input.focus();
            });

            input.onfocus = _focusInput;

            _on(input, 'blur', _blurEvent);
            _on(input, 'keydown', _keydownEvents);
            _on(input, 'keyup', _keyupEvents);
        }

        /**
         * Resizes the hidden input where user types to fill in the
         * width of the div
         */
        function _fixInputWidth() {
            var width;
            var inputRect, rect;
            var leftPos;
            var padding;
            //reset width incase we've broken to the next line on a backspace erase
            _setInputWidth();

            inputRect = input.getBoundingClientRect();
            rect = measurements.container.rect;
            width = ~~rect.width;
            // Could probably just use right - left all the time
            // but eh, this check is mostly for IE8
            if (!width) {
                width = ~~rect.right - ~~rect.left;
            }
            leftPos = ~~inputRect.left - ~~rect.left;
            padding = measurements.container.padding;

            _setInputWidth(width - leftPos - padding);
        }

        /**
         * Returns whether or not the specified tag text can be added
         * @param  {Event} e event causing the potentially added tag
         * @param  {String} text tag value
         * @return {Boolean}
         */
        function _canAdd(e, text) {
            if (!text) {
                return false;
            }

            if (!settings.allowDuplicates && _hasDupes(text)) {
                return false;
            }

            if (settings.allowedTags.length && settings.allowedTags.indexOf(text) === -1) {
                return false;
            }

            if (settings.onBeforeTagAdd(e, text) === false) {
                return false;
            }

            return true;
        }

        /**
         * Appends tag with its corresponding input to the list
         * @param  {String} tag
         */
        function _add(e, text) {
            var val = _formatTag(typeof text === 'string' ? text : _trim(input.value));
            var li;
            var lis;
            var lastLi;

            if (!_canAdd(e, val)) {
                return;
            }

            li = _createTag(val);
            lis = list.querySelectorAll('li');
            lastLi = lis[lis.length - 1];
            list.insertBefore(li, lastLi);

            settings.onTagAdd(e, val);

            input.value = '';
            _setInputWidth();
            _fixInputWidth();
            _focusInput();
        }

        /**
         * Removes last tag if it has already been probed
         */
        function _checkLastTag(e) {
            e = e || window.event;

            var taggles = container.querySelectorAll('.taggle');
            var lastTaggle = taggles[taggles.length - 1];
            var hotClass = 'taggle_hot';
            var heldDown = input.classList.contains('taggle_back');

            //prevent holding backspace from deleting all tags
            if (input.value === '' && e.keyCode === BACKSPACE && !heldDown) {
                if (lastTaggle.classList.contains(hotClass)) {
                    input.classList.add('taggle_back');
                    _remove(lastTaggle, e);
                    _fixInputWidth();
                    _focusInput();
                }
                else {
                    lastTaggle.classList.add(hotClass);
                }
            }
            else if (lastTaggle.classList.contains(hotClass)) {
                lastTaggle.classList.remove(hotClass);
            }
        }

        /**
         * Setter for the hidden input.
         * @param {Number} width
         */
        function _setInputWidth(width) {
            input.style.width = (width || 10) + 'px';
        }

        /**
         * Checks global tags array if provided tag exists
         * @param  {String} text
         * @return {Boolean}
         */
        function _hasDupes(text) {
            var needle = tag.values.indexOf(text);
            var tagglelist = container.querySelector('.tagglelist');
            var dupes;

            if (settings.duplicateTagClass) {
                dupes = tagglelist.querySelectorAll('.' + settings.duplicateTagClass);
                for (var i = 0, len = dupes.length; i < len; i++) {
                    dupes[i].classList.remove(settings.duplicateTagClass);
                }
            }

            // if found
            if (needle > -1) {
                if (settings.duplicateTagClass) {
                    tagglelist.childNodes[needle].classList.add(settings.duplicateTagClass);
                }
                return true;
            }

            return false;
        }

        /**
         * Checks whether or not the key pressed is acceptable
         * @param  {Number}  key code
         * @return {Boolean}
         */
        function _isConfirmKey(key) {
            var confirmKey = false;

            if (settings.submitKeys.indexOf(key) > -1) {
                confirmKey = true;
            }

            return confirmKey;
        }

        // Event handlers

        /**
         * Handles focus state of div container.
         */
        function _focusInput() {
            _fixInputWidth();

            if (!container.classList.contains(settings.containerFocusClass)) {
                container.classList.add(settings.containerFocusClass);
            }

            if (placeholder) {
                placeholder.style.opacity = 0;
            }
        }

        /**
         * Runs all the events that need to happen on a blur
         * @param  {Event} e
         */
        function _blurEvent(e) {

            if (settings.saveOnBlur) {
                e = e || window.event;

                _listenForEndOfContainer();

                if (input.value !== '') {
                    _confirmValidTagEvent(e);
                    return;
                }

                if (tag.values.length) {
                    _checkLastTag(e);
                }

            }
            else {
                input.value = '';
                _setInputWidth();

                if (container.classList.contains(settings.containerFocusClass)) {
                    container.classList.remove(settings.containerFocusClass);
                }

                if (!tag.values.length && placeholder) {
                    placeholder.style.opacity = 1;
                }
            }
        }

        /**
         * Runs all the events that need to run on keydown
         * @param  {Event} e
         */
        function _keydownEvents(e) {
            e = e || window.event;

            var key = e.keyCode;

            _listenForEndOfContainer();

            if (_isConfirmKey(key) && input.value !== '') {
                _confirmValidTagEvent(e);
                return;
            }

            if (tag.values.length) {
                _checkLastTag(e);
            }
        }

        /**
         * Runs all the events that need to run on keyup
         * @param  {Event} e
         */
        function _keyupEvents(e) {
            e = e || window.event;

            input.classList.remove('taggle_back');

            _setText(sizer, input.value);
        }

        /**
         * Confirms the inputted value to be converted to a tag
         * @param  {Event} e
         */
        function _confirmValidTagEvent(e) {
            e = e || window.event;

            _add(e);

            // prevents from jumping out of textarea
            if (e.preventDefault) {
                e.preventDefault();
            }
            else {
                e.returnValue = false;
            }
        }

        /**
         * Approximates when the hidden input should break to the next line
         */
        function _listenForEndOfContainer() {
            var width = sizer.getBoundingClientRect().width;
            var max = measurements.container.rect.width - measurements.container.padding;
            var size = parseInt(sizer.style.fontSize, 10);

            // 1.5 just seems to be a good multiplier here
            if (width + (size * 1.5) > parseInt(input.style.width, 10)) {
                input.style.width = max + 'px';
            }
        }

        function _createTag(text) {
            var li = document.createElement('li');
            var close = document.createElement('a');
            var hidden = document.createElement('input');
            var span = document.createElement('span');

            text = _formatTag(text);

            close.href = 'javascript:void(0)';
            close.innerHTML = '&times;';
            close.className = 'close';
            close.onclick = _remove.bind(null, close);

            _setText(span, text);
            span.className = 'taggle_text';

            li.className = 'taggle ' + settings.additionalTagClasses;

            hidden.type = 'hidden';
            hidden.value = text;
            hidden.name = settings.hiddenInputName;

            li.appendChild(span);
            li.appendChild(close);
            li.appendChild(hidden);

            tag.values.push(text);
            tag.elements.push(li);

            return li;
        }

        /**
         * Removes tag from the tags collection
         * @param  {li} li List item to remove
         * @param  {Event} e
         */
        function _remove(li, e) {
            var span;
            var text;

            if (li.tagName.toLowerCase() !== 'li') {
                li = li.parentNode;
            }

            span = li.querySelector('.taggle_text');
            text = span.innerText || span.textContent;

            if (settings.onBeforeTagRemove(e, text) === false) {
                return false;
            }

            li.parentNode.removeChild(li);
            _removeFromTheTags(li, tag);

            settings.onTagRemove(e, text);

            _focusInput();
        }

        /**
         * Format the text for a tag
         * @param {String} text Tag text
         * @return {String}
         */
        function _formatTag(text) {
            return settings.preserveCase ? text : text.toLowerCase();
        }

        self.getTags = function() {
            return {
                elements: self.getTagElements(),
                values: self.getTagValues()
            };
        };

        self.getTagElements = function() {
            return tag.elements;
        };

        self.getTagValues = function() {
            return [].slice.apply(tag.values);
        };

        self.getInput = function() {
            return input;
        };

        self.getContainer = function() {
            return container;
        };

        self.add = function(text) {
            var isArr = _isArray(text);

            if (typeof text === 'string') {
                return _add(null, text);
            }

            if (isArr) {
                for (var i = 0, len = text.length; i < len; i++) {
                    if (typeof text[i] === 'string') {
                        _add(null, text[i]);
                    }
                }
            }

            return self;
        };

        self.remove = function(text, all) {
            var len = tag.values.length - 1;
            var found = false;

            while (len > -1) {
                if (tag.values[len] === text) {
                    found = true;
                    _remove(tag.elements[len]);
                }

                if (found && !all) {
                    break;
                }

                len--;
            }

            return self;
        };

        self.removeAll = function() {
            for (var i = tag.values.length - 1; i >= 0; i--) {
                _remove(tag.elements[i]);
            }

            return self;
        };

        // Bang bang bang skeet skeet
        _init();
    };


    function _extend() {
        var master = arguments[0];
        for (var i = 1, l = arguments.length; i < l; i++) {
            var object = arguments[i];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    master[key] = object[key];
                }
            }
        }

        return master;
    }

    function _isArray(arr) {
        if (Array.isArray) {
            return Array.isArray(arr);
        }
        return Object.prototype.toString.call(arr) === '[object Array]';
    }

    /**
     * Grabs the text from the li item and removes it from global array
     * @param  {Element} el
     */
    function _removeFromTheTags(el, tag) {
        var elem = (el.tagName.toLowerCase() === 'a') ? el.parentNode : el;
        var index = tag.elements.indexOf(elem);

        // Going to assume the indicies match for now
        tag.elements.splice(index, 1);
        tag.values.splice(index, 1);
    }

    function _on(element, eventName, handler) {
        if (element.addEventListener) {
            element.addEventListener(eventName, handler, false);
        }
        else if (element.attachEvent) {
            element.attachEvent('on' + eventName, handler);
        }
        else {
            element['on' + eventName] = handler;
        }
    }

    function _trim(str) {
        return str.replace(/^\s+|\s+$/g, '');
    }

    function _setText(el, text) {
        if (window.attachEvent && !window.addEventListener) { // <= IE8
            el.innerText = text;
        }
        else {
            el.textContent = text;
        }
    }

    window.Taggle = Taggle;

}(window, document));
