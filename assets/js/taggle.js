/*jshint scripturl:true, smarttabs:true */

/**
 * Copyright 2013 Sean Coker
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
 /*!
 * @author Sean Coker <sean@seancoker.com>
 * @Version 1.1.1
 * @url http://sean.is/poppin/tags
 * @description Taggle is a simple delicious style tagging plugin
 */

;(function(window, document, undefined) {

    var defaults = {

        /**
         * Class names to be added on each tag entered
         * @type {String}
         */
        additionalTagClasses:   '',

        /**
         * Allow duplicate tags to be entered in the field?
         * @type {Boolean}
         */
        allowDuplicates:        false,

        /**
         * Class name that will be added onto duplicate existant tag
         * @type {String}
         */
        duplicateTagClass:      '',

        /**
         * Class added to the container div when focused
         * @type {String}
         */
        containerFocusClass:    'active',

        /**
         * Name added to the hidden inputs within each tag
         * @type {String}
         */
        hiddenInputName:        'taggles[]',

        /**
         * Tags that should be preloaded in the div on load
         * @type {Array}
         */
        tags:                   [],

        /**
         * If within a form, you can specify the tab index flow
         * @type {Number}
         */
        tabIndex:               1,

        /**
         * Placeholder string to be placed in an empty taggle field
         * @type {String}
         */
        placeholder:            'Enter tags...'
    },

    BACKSPACE = 8,
    COMMA = 188,
    TAB = 9,
    ENTER = 13;

    /**
     * Constructor
     * @param {Mixed} el ID of an element or the actual element
     * @param {Object} options
     */
    var Taggle = function(el, options) {
        var self = this;

        self.container = el;
        self.options = _extend({}, defaults, options);
        self.tag = {
            values: [],
            elements: []
        };
        self.measurements = {
            container: {
                rect: null,
                style: null,
                side_padding: null
            }
        };

        self.list = document.createElement('ul');
        self.input_li = document.createElement('li');
        self.input = document.createElement('input');

        if (self.options.placeholder) {
            self.placeholder = document.createElement('span');
        }

        if (typeof el === 'string') {
            self.container = document.getElementById(el);
        }

        // Bang bang bang skeet skeet
        self.init();
    };

    Taggle.prototype.init = function() {
        var self = this;
        self.getMeasurements();
        self.setupTextarea();
        self.attachEvents();
    };

    /**
     * Gets all the layout measurements up front
     */
    Taggle.prototype.getMeasurements = function() {
        var self = this,
            style,
            lpad, rpad;

        self.measurements.container.rect = self.container.getBoundingClientRect();
        self.measurements.container.style = window.getComputedStyle(self.container);

        style = self.measurements.container.style;
        lpad = parseInt(style['padding-left'] || style['paddingLeft'], 10);
        rpad = parseInt(style['padding-right'] || style['paddingRight'], 10);
        self.measurements.container.side_padding =  lpad + rpad;
    };

    /**
     * Setup the div container for tags to be entered
     */
    Taggle.prototype.setupTextarea = function() {
        var self = this,
            font_size;
        self.list.className = 'taggle_list';
        self.input.type = 'text';
        self.input.className = 'taggle_input';
        self.input.tabIndex = self.options.tabIndex;
        self.sizer = document.createElement('div');
        self.sizer.className = 'taggle_sizer';

        if (self.options.tags !== null) {
            for (var i = 0, len = self.options.tags.length; i < len; i++) {
                var tag = self.createTag(self.options.tags[i]);
                self.list.appendChild(tag);
            }
        }

        if (self.placeholder) {
            self.placeholder.style.opacity = 0;
            self.placeholder.classList.add('taggle_placeholder');
            self.container.appendChild(self.placeholder);
            self.placeholder.textContent = self.options.placeholder;

            if (!self.options.tags.length) {
                self.placeholder.style.opacity = 1;
            }
        }

        self.input_li.appendChild(self.input);
        self.list.appendChild(self.input_li);
        self.container.appendChild(self.list);
        self.container.appendChild(self.sizer);

        font_size = window.getComputedStyle(self.input)['font-size'];
        self.sizer.style.fontSize = font_size;
    };

    /**
     * Attaches neccessary events
     */
    Taggle.prototype.attachEvents = function() {
        var self = this;

        _on(self.container, 'click', function() {
            self.input.focus();
        });

        self.input.onfocus = self.focusInput.bind(self);
        self.input.onblur = self.blurInput.bind(self);

        _on(self.input, 'keydown', self.keydownEvents.bind(self));
        _on(self.input, 'keyup', self.keyupEvents.bind(self));
    };

    /**
     * Resizes the hidden input where user types to fill in the
     * width of the div
     */
    Taggle.prototype.fixInputWidth = function() {
        var self = this,
            width,
            input_rect,
            left_pos,
            padding;
        //reset width incase we've broken to the next line on a backspace erase
        self.setInputWidth();

        input_rect = self.input.getBoundingClientRect();
        width = ~~self.measurements.container.rect.width;
        left_pos = ~~input_rect.left - ~~self.measurements.container.rect.left;
        padding = self.measurements.container.side_padding;

        self.setInputWidth(width - left_pos - padding);
    };

    /**
     * Appends tag with its corresponding input to the list
     * @param  {String} tag
     */
    Taggle.prototype.add = function(text) {
        var self = this,
            val = typeof text === 'string' ? text.toLowerCase() :
                _trim(self.input.value.toLowerCase()),
            li, last_li;

        if ((!self.options.allowDuplicates && self.hasDupes()) || val === '') {
            return self;
        }

        li = self.createTag(val);

        last_li = self.list.querySelector('li:last-child');
        self.list.insertBefore(li, last_li);

        self.input.value = '';
        self.setInputWidth();
        self.fixInputWidth();
        self.focusInput();

        return self;
    };

    /**
     * Removes last tag if it has already been probed
     */
    Taggle.prototype.checkLastTag = function(e) {
        e = e || window.event;

        var self = this,
            taggles = self.container.querySelectorAll('.taggle'),
            last_taggle = taggles[taggles.length - 1],
            hot_class = 'taggle_hot';

        //8 - backspace
        if (self.input.value === '' && e.keyCode === BACKSPACE) {
            if (last_taggle.classList.contains(hot_class)) {
                self.remove(last_taggle);
                self.fixInputWidth();
                self.focusInput();
            }
            else {
                last_taggle.classList.add(hot_class);
            }
        }
        else if (last_taggle.classList.contains(hot_class)) {
            last_taggle.classList.remove(hot_class);
        }
    };

    /**
     * Setter for the hidden input.
     * @param {Number} width
     */
    Taggle.prototype.setInputWidth = function(width) {
        this.input.style.width = (width || 10) + 'px';
    };

    /**
     * Checks global tags array if provided tag exists
     * @param  {String} tag
     */
    Taggle.prototype.hasDupes = function(text) {
        var self = this,
            val = self.input.value,
            tag_input_value = text ? text.toLowerCase() : _trim(val.toLowerCase()),
            needle = self.tag.values.indexOf(tag_input_value),
            taggle_list = self.container.querySelector('.taggle_list'),
            dupes;

        if (!!self.options.duplicateTagClass) {
            dupes = taggle_list.querySelectorAll('.' + self.options.duplicateTagClass);
            for (var i = 0, len = dupes.length; i < len; i++) {
                dupes[i].classList.remove(self.options.duplicateTagClass);
            }
        }

        //if found
        if (needle > -1) {
            if (self.options.duplicateTagClass) {
                taggle_list.childNodes[needle].classList.add(self.options.duplicateTagClass);
            }
            return true;
        }

        return false;
    };

    /**
     * Checks whether or not the key pressed is acceptable
     * @param  {Event}  e
     * @return {Boolean}
     */
    Taggle.prototype.isConfirmKey = function(e) {
        var code = e.keyCode,
            confirm_key = false;

        if (code === COMMA || code === TAB || code === ENTER) {
            confirm_key = true;
        }

        return confirm_key;
    };

    //event handlers

    /**
     * Handles focus state of div container.
     */
    Taggle.prototype.focusInput = function() {
        var self = this;

        self.fixInputWidth();

        if (!self.container.classList.contains(self.options.containerFocusClass)) {
            self.container.classList.add(self.options.containerFocusClass);
        }

        if (self.placeholder) {
            self.placeholder.style.opacity = 0;
        }
    };

    /**
     * Sets state of container when blurred
     */
    Taggle.prototype.blurInput = function() {
        var self = this;

        self.input.value = '';
        self.setInputWidth();

        if (self.container.classList.contains(self.options.containerFocusClass)) {
            self.container.classList.remove(self.options.containerFocusClass);
        }

        if (!self.tag.values.length && self.placeholder) {
            self.placeholder.style.opacity = 1;
        }
    };

    /**
     * Runs all the events that need to run on keydown
     * @param  {Event} e
     */
    Taggle.prototype.keydownEvents = function(e) {
        e = e || window.event;

        var self = this;

        self.listenForEndOfContainer();

        if (self.isConfirmKey(e) && self.input.value !== '') {
            self.confirmValidTagEvent(e);
            return;
        }

        if (self.tag.values.length) {
            self.checkLastTag(e);
        }
    };

    /**
     * Runs all the events that need to run on keyup
     * @param  {Event} e
     */
    Taggle.prototype.keyupEvents = function(e) {
        e = e || window.event;
        var self = this;
        self.sizer.textContent = self.input.value;
    };

    /**
     * Confirms the inputted value to be converted to a tag
     * @param  {Event} e
     * @return {Boolean}
     */
    Taggle.prototype.confirmValidTagEvent = function(e) {
        e = e || window.event;

        var self = this;

        self.add();

        //prevents from jumping out of textarea
        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            e.returnValue = false;
        }
    };

    /**
     * Approximates when the hidden input should break to the next line
     */
    Taggle.prototype.listenForEndOfContainer = function() {
        var self = this,
            width = self.sizer.getBoundingClientRect().width,
            max = self.measurements.container.rect.width - self.measurements.container.side_padding,
            size = parseInt(self.sizer.style.fontSize, 10);

        //1.5 just seems to be a good multiplier here
        if (width + (size * 1.5) > parseInt(self.input.style.width, 10)) {
            self.input.style.width = max + 'px';
        }
    };

    Taggle.prototype.createTag = function(text) {
        var self = this;
        var li = document.createElement('li');
        var close = document.createElement('a');
        var hidden = document.createElement('input');
        var span = document.createElement('span');

        text = text.toLowerCase();

        close.href = 'javascript:void(0)';
        close.innerHTML = '&times;';
        close.className = 'close';
        close.onclick = self.remove.bind(self, close);

        span.textContent = text;
        span.className = 'taggle_text';

        li.className = 'taggle ' + self.options.additionalTagClasses;

        hidden.type = 'hidden';
        hidden.value = text;
        hidden.name = self.options.hiddenInputName;

        li.appendChild(span);
        li.appendChild(close);
        li.appendChild(hidden);

        self.tag.values.push(text);
        self.tag.elements.push(li);

        return li;
    };

    /**
     * Removes tag from the tags collection
     * @param  {Event} e
     */
    Taggle.prototype.remove = function(e) {
        e = e || window.event;
        var self = this,
            targ = e.target || e.srcElement || e,
            li = targ;

        if (li.tagName.toLowerCase() !== 'li') {
            li = li.parentNode;
        }

        li.parentNode.removeChild(li);
        _removeFromTheTags(li, self.tag);

        self.focusInput();
    };

    Taggle.prototype.getTags = function() {
        return this.tag;
    };

    Taggle.prototype.getTagElements = function() {
        return this.tag.elements;
    };

    Taggle.prototype.getTagValues = function() {
        return this.tag.values;
    };

    Taggle.prototype.getInput = function() {
        return this.input;
    };

    Taggle.prototype.getContainer = function() {
        return this.container;
    };

    function _extend() {
        if (arguments.length < 2) {
            return;
        }
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

    /**
     * Grabs the text from the li item and removes it from global array
     * @param  {Element} el
     */
    function _removeFromTheTags(el, tag) {
        var elem = (el.tagName.toLowerCase() === 'a') ? el.parentNode : el,
            index = tag.elements.indexOf(elem);

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

    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
              // closest thing possible to the ECMAScript 5 internal IsCallable function
              throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {},
                fBound = function () {
                  return fToBind.apply(this instanceof fNOP && oThis ? this :
                    oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    window.Taggle = Taggle;

}(window, document));
