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
 * Taggle is a simple delicious style tagging plugin for jQuery
 *
 * @author Sean Coker <sean@seancoker.com>
 * @url http://seancoker.com/projects/tagglejs
 *
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
        tags:                   null,

        /**
         * Approximate font size (px) of the tags. Used to estimate where
         * to break when typing
         * @type {Number}
         */
        fontSize:               11,

        /**
         * If within a form, you can specify the tab index flow
         * @type {Number}
         */
        tabIndex:               1,

        /**
         * Placeholder string to be placed in an empty taggle field
         * @type {String}
         */
        placeholder:            ''
    },

    measurements = {
        container: {
            rect: null,
            style: null,
            side_padding: null
        }
    };

    function on(element, eventName, handler) {
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

    function off(element, eventName, handler) {
        if (element.addEventListener) {
            element.removeEventListener(eventName, handler, false);
        }
        else if (element.detachEvent) {
            element.detachEvent('on' + eventName, handler);
        }
        else {
            element['on' + eventName] = null;
        }
    }

    function one(element, eventName, handler) {
        on(element, eventName, function() {
            handler();
            off(element, eventName, handler);
        });
    }

    function trim(str) {
        return str.replace(/^\s+|\s+$/g, '');
    }

    function bind(object, method, args) {
        return function() {
            return method.apply(object, args);
        };
    }

    var Taggle = function(el, options) {
        var self = this;
        self.container = el;
        self.options = self.extend(defaults, options);
        self.the_tags = [];
        self.tag_list = document.createElement('ul');
        self.tag_input_li = document.createElement('li');
        self.tag_input = document.createElement('input');
        self.placeholder = document.createElement('span');

        if (typeof el === 'string') {
            self.container = document.getElementById(el);
        }

        // Bang bang bang skeet skeet
        self.getMeasurements();
        self.setupTextarea();
        self.attachEvents();
    };

    Taggle.prototype.extend = function() {
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
    };

    /**
     * Gets all the layout measurements up front
     */
    Taggle.prototype.getMeasurements = function() {
        var self = this,
            style;

        measurements.container.rect = self.container.getBoundingClientRect();
        measurements.container.style = window.getComputedStyle(self.container);

        style = measurements.container.style;
        measurements.container.side_padding = parseInt(style['padding-left'], 10) + parseInt(style['padding-right'], 10);
    };

    /**
     * Setup the div container for tags to be entered
     */
    Taggle.prototype.setupTextarea = function() {
        var self = this;
        self.tag_list.className = 'taggle_list';
        self.tag_input.type = 'text';
        self.tag_input.className = 'taggle_input';
        self.tag_input.tabIndex = self.options.tabIndex;
        self.placeholder.style.display = 'none';
        self.placeholder.classList.add('taggle_placeholder');
        self.container.appendChild(self.placeholder);

        if (self.options.tags !== null) {
            for (var i = 0; i < self.options.tags.length; i++) {
                self.tag_list.innerHTML += '<li class="taggle ' +
                self.options.additionalTagClasses + '">' +
                self.options.tags[i] +
                '<a href="javascript:void(0)" class="close">&times;</a>' +
                '<input type="hidden" value="' +
                self.options.tags[i] + '" name="' +
                self.options.hiddenInputName +'"></li>';
                self.the_tags.push(self.options.tags[i].toLowerCase());
            }
        }

        if (!!self.options.placeholder) {
            self.placeholder.textContent = self.options.placeholder;
            if (!self.options.tags.length) {
                self.placeholder.style.opacity = 1;
            }
        }

        self.tag_input_li.appendChild(self.tag_input);
        self.tag_list.appendChild(self.tag_input_li);
        self.container.appendChild(self.tag_list);
    };

    /**
     * Attaches events, duh
     * @return {void}
     */
    Taggle.prototype.attachEvents = function() {
        var self = this,
            closes;

        on(self.container, 'click', function() {
            self.tag_input.focus();
        });

        self.tag_input.onfocus = bind(self, self.inputFocused);
        self.tag_input.onblur = bind(self, self.inputBlurred);

        on(self.tag_input, 'keydown', bind(self, self.keydownEvents));
        on(self.tag_input, 'keyup', bind(self, self.keyupEvents));

        closes = self.container.querySelectorAll('.close');

        for (var i = 0, len = closes.length; i < len; i++) {
            one(closes[i], 'click', bind(self, self.removeTag, [closes[i]]));
        }
    };

    /**
     * Resizes the hidden input where user types to fill in the
     * width of the div
     * @return {void}
     */
    Taggle.prototype.fixInputWidth = function() {
        var self = this,
            width,
            input_rect,
            left_pos,
            padding;
        //reset width incase we've broken to the next line on a backspace erase
        self.setInputWidth();

        input_rect = self.tag_input.getBoundingClientRect();
        width = ~~measurements.container.rect.width;
        left_pos = ~~input_rect.left - ~~measurements.container.rect.left;
        padding = measurements.container.side_padding;

        self.setInputWidth(width - left_pos - padding);
    };

    /**
     * Appends tag with its corresponding input to the list
     * @param  {String} tag
     * @return {void}
     */
    Taggle.prototype.confirmTag = function(tag) {
        var self = this,
            li = document.createElement('li'),
            a = document.createElement('a'),
            hidden = document.createElement('input'),
            val = self.tag_input.value,
            tag_input_value = tag ? tag.toLowerCase() : trim(val.toLowerCase()),
            last_li, close;

        a.href = 'javascript:void(0)';
        a.innerHTML = '&times;';
        a.className = 'close';
        a.onclick = bind(self, self.removeTag, [a]);

        li.innerHTML = tag_input_value;
        li.className = 'taggle ' + self.options.additionalTagClasses;

        hidden.type = 'hidden';
        hidden.value = tag_input_value;
        hidden.name = self.options.hiddenInputName;

        self.the_tags.push(tag_input_value);

        li.appendChild(a);
        li.appendChild(hidden);

        last_li = self.tag_list.querySelector('li:last-child');
        self.tag_list.insertBefore(li, last_li);
        close = li.querySelector('.close');

        one(close, 'click', bind(self, self.removeTag, [close]));

        self.tag_input.value = '';
        self.setInputWidth();
        self.fixInputWidth();
    };

    /**
     * Removes last tag if it has already been probed
     * @param  {Event}  e
     * @return {void}
     */
    Taggle.prototype.chargeLastTag = function(e) {
        e = e || window.event;

        var self = this,
            taggles = self.container.querySelectorAll('.taggle'),
            last_taggle = taggles[taggles.length - 1],
            hot_class = 'hot';

        //8 - backspace
        if (self.tag_input.value === '' && e.keyCode === 8) {
            if (last_taggle.classList.contains(hot_class)) {
                self.removeFromTheTags(last_taggle);
                last_taggle.remove();
                self.fixInputWidth();
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
     * Grabs the text from the li item and removes it from global array
     * @param  {Element} el
     * @return {void}
     */
    Taggle.prototype.removeFromTheTags = function(el) {
        var self = this,
            elem = (el.tagName.toLowerCase() === 'a') ? el.parentNode : el,
            text = elem.textContent || elem.innerText;

        text = text.slice(0, -1);

        self.the_tags.splice(self.the_tags.indexOf(text), 1);
    };

    /**
     * Setter for the hidden input.
     * @param {Number} width
     * @return {void}
     */
    Taggle.prototype.setInputWidth = function(width) {
        this.tag_input.style.width = (width || 10) + 'px';
    };

    /**
     * Checks global tags array if provided tag exists
     * @param  {String} tag
     * @return {void}
     */
    Taggle.prototype.checkForDupes = function(tag) {
        var self = this,
            val = self.tag_input.value,
            tag_input_value = tag ? tag.toLowerCase() : trim(val.toLowerCase()),
            needle = self.the_tags.indexOf(tag_input_value),
            taggle_list = self.container.querySelector('.taggle_list'),
            dupes = taggle_list.querySelectorAll('.' + self.options.duplicateTagClass);

        if (!!self.options.duplicateTagClass && dupes.length) {
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
        // comma or tab or enter
        if (code === 188 || code === 9 || code === 13) {
            confirm_key = true;
        }

        return confirm_key;
    };

    //event handlers

    /**
     * Handles focus state of div container.
     * @return {void}
     */
    Taggle.prototype.inputFocused = function() {
        var self = this;

        self.fixInputWidth();

        if (!self.container.classList.contains(self.options.containerFocusClass)) {
            self.container.classList.add(self.options.containerFocusClass);
        }

        if (!!self.options.placeholder) {
            self.placeholder.style.opacity = 0;
        }
    };

    /**
     * Sets state of container when blurred
     * @return {void}
     */
    Taggle.prototype.inputBlurred = function() {
        var self = this;

        self.tag_input.value = '';
        self.setInputWidth();

        if (self.container.classList.contains(self.options.containerFocusClass)) {
            self.container.classList.remove(self.options.containerFocusClass);
        }

        if (!self.the_tags.length && self.options.placeholder) {
            self.placeholder.style.opacity = 1;
        }
    };

    /**
     * Runs all the events that need to run on keydown
     * @param  {Event} e
     * @return {void}
     */
    Taggle.prototype.keydownEvents = function(e) {
        e = e || window.event;

        var self = this;

        self.listenForEndOfContainer();

        if (self.isConfirmKey(e) && self.tag_input.value !== '') {
            self.listenForTagConfirm(e);
        }

        self.chargeLastTag(e);
    };

    /**
     * Runs all the events that need to run on keyup
     * @param  {Event} e
     * @return {void}
     */
    Taggle.prototype.keyupEvents = function(e) {
        e = e || window.event;
    };

    /**
     * Confirms the inputted value to be converted to a tag
     * @param  {Event} e
     * @return {Boolean}
     */
    Taggle.prototype.listenForTagConfirm = function(e) {
        e = e || window.event;

        var self = this,
            code = e.keyCode,
            dupes;


        //tab, enter
        if (code === 9 || code === 13) {
            dupes = self.checkForDupes();
        }

        if (!dupes || self.options.allowDuplicates) {
            self.confirmTag();
        }

        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            e.returnValue = false;
        }
    };

    /**
     * Approximates when the hidden input should break to the next line
     * @return {void}
     */
    Taggle.prototype.listenForEndOfContainer = function() {
        // apx_width: 32px wide input = 5chars = 11px font
        // alternative would be to make an invisible div and measure its width
        // eh. maybe eventually.
        var self = this,
            apx_width = (self.options.fontSize / 8) * 4.5 * self.tag_input.value.length,
            max = measurements.container.width - measurements.container.side_padding;

        if (apx_width + 5 > parseInt(self.tag_input.style.width, 10)) {
            self.tag_input.style.width = max + 'px';
        }
    };

    /**
     * Removes tag from the list and global tags array
     * @param  {Event} e
     * @return {void}
     */
    Taggle.prototype.removeTag = function(e) {
        e = e || window.event;
        var self = this,
            targ = e.target || e,
            li = targ.parentNode;

        li.parentNode.removeChild(li);
        self.inputFocused();
        self.removeFromTheTags(targ);
    };

    window.Taggle = Taggle;

}(window, document));
