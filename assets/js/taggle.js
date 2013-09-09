/*global $, jQuery */
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

(function($) {

    $.fn.taggle = function(options) {

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
        };

        var settings = $.extend({}, defaults, options);

        return this.each(function() {
            var container = $(this),

                the_tags = [],
                tag_list = document.createElement('ul'),
                tag_input_li = document.createElement('li'),
                tag_input = document.createElement('input'),
                placeholder = $('<span>');


            /**
             * Fire off initializers
             */
            function init() {
                setupEl();
                attachEvents();
            }

            /**
             * Setup the div container for tags to be entered
             * @return {[type]}
             */
            function setupEl() {
                tag_list.className = 'taggle_list';
                tag_input.type = 'text';
                tag_input.className = 'taggle_input';
                tag_input.tabIndex = settings.tabIndex;
                placeholder.css('display', 'none').addClass('taggle_placeholder');
                container.append(placeholder);

                if (settings.tags !== null) {
                    for (var i = 0; i < settings.tags.length; i++) {
                        tag_list.innerHTML += '<li class="taggle ' +
                        settings.additionalTagClasses + '">' +
                        settings.tags[i] +
                        '<a href="javascript:void(0)" class="close">&times;</a>' +
                        '<input type="hidden" value="' +
                        settings.tags[i] + '" name="' +
                        settings.hiddenInputName +'"></li>';
                        the_tags.push(settings.tags[i].toLowerCase());
                    }
                }
                if (!!settings.placeholder) {
                    placeholder.text(settings.placeholder);
                    if (!settings.tags.length) {
                        placeholder.fadeIn('fast');
                    }
                }

                tag_input_li.appendChild(tag_input);
                tag_list.appendChild(tag_input_li);
                container.append(tag_list);
            }

            /**
             * Attaches events, duh
             * @return {void}
             */
            function attachEvents() {
                container.on('click', function() {
                    tag_input.focus();
                });

                tag_input.onfocus = inputFocused;
                tag_input.onblur = inputBlurred;

                if (tag_input.addEventListener) {
                    tag_input.addEventListener('keydown', keydownEvents, false);
                    tag_input.addEventListener('keyup', keyupEvents, false);
                } else if (tag_input.attachEvent) {
                    tag_input.attachEvent('onkeydown', keydownEvents);
                    tag_input.attachEvent('onkeyup', keyupEvents);
                }

                container.find('.close').one('click', removeTag);
            }

            /**
             * Resizes the hidden input where user types to fill in the
             * width of the div
             * @return {void}
             */
            function fixInputWidth() {
                //reset width incase we've broken to the next line on a backspace erase
                setInputWidth();

                var width = ~~container.width(),
                    left_pos = ~~container.find('.taggle_input').offset().left - ~~container.offset().left,
                    padding = container.outerWidth() - width;

                    setInputWidth(width - left_pos - padding);
            }

            /**
             * Appends tag with its corresponding input to the list
             * @param  {String} tag
             * @return {void}
             */
            function confirmTag(tag) {
                var li = document.createElement('li'),
                    a = document.createElement('a'),
                    hidden = document.createElement('input'),
                    tag_input_value = tag ? tag.toLowerCase() : $.trim(tag_input.value.toLowerCase());

                a.href = 'javascript:void(0)';
                a.innerHTML = '&times;';
                a.className = 'close';
                a.onclick = removeTag;
                li.innerHTML = tag_input_value;
                li.className = 'taggle ' + settings.additionalTagClasses;
                hidden.type = 'hidden';
                hidden.value = tag_input_value;
                if (settings.hiddenInputName) {
                    hidden.name = settings.hiddenInputName;
                }

                the_tags.push(tag_input_value);

                li.appendChild(a);
                li.appendChild(hidden);

                $(tag_list).find('li:last').before(li);
                $(li).find('.close:last').on('click', removeTag);

                tag_input.value = '';
                setInputWidth();
                fixInputWidth();
            }

            /**
             * Removes last tag if it has already been probed
             * @param  {Event}  e
             * @return {void}
             */
            function chargeLastTag(e) {
                e = e || window.event;

                var last_taggle = container.find('.taggle:last'),
                    hot_class = 'hot';

                //8 - backspace
                if (tag_input.value === '' && e.keyCode === 8) {
                    if (last_taggle.hasClass(hot_class)) {
                        removeFromTheTags(last_taggle[0]);
                        last_taggle.remove();
                        fixInputWidth();
                    }
                    else {
                        last_taggle.addClass(hot_class);
                    }
                } else if (last_taggle.hasClass(hot_class)) {
                    last_taggle.removeClass(hot_class);
                }
            }

            /**
             * Grabs the text from the li item and removes it from global array
             * @param  {Element} el
             * @return {void}
             */
            function removeFromTheTags(el) {
                var elm = el.tagName === 'A' ? el.parentNode : el;
                    text = elm.textContent || elm.innerText;

                text = text.slice(0, -1);

                the_tags.splice(the_tags.indexOf(text), 1);
            }

            /**
             * Setter for the hidden input.
             * @param {Number} width
             * @return {void}
             */
            function setInputWidth(width) {
                tag_input.style.width = (width || 10) + 'px';
            }

            /**
             * Checks global tags array if provided tag exists
             * @param  {String} tag
             * @return {void}
             */
            function checkForDupes(tag) {
                var tag_input_value = tag ? tag.toLowerCase() : $.trim(tag_input.value.toLowerCase()),
                    needle = $.inArray(tag_input_value.toLowerCase(), the_tags),
                    taggle_list = container.find('.taggle_list');

                if (!!settings.duplicateTagClass && taggle_list.find('.' + settings.duplicateTagClass).length) {
                    taggle_list.find('.' + settings.duplicateTagClass).removeClass(settings.duplicateTagClass);
                }

                //if found
                if (needle > -1) {
                    taggle_list.children()[needle].className += ' ' + settings.duplicateTagClass;
                    return true;
                }
                return false;
            }

            /**
             * Checks whether or not the key pressed is acceptable
             * @param  {Event}  e
             * @return {Boolean}
             */
            function isConfirmKey(e) {
                var code = e.keyCode,
                    isConfirm = false;
                // comma or tab or enter
                if (code === 188 || code === 9 || code === 13) {
                    isConfirm = true;
                }

                return isConfirm;
            }

            //event handlers

            /**
             * Handles focus state of div container.
             * @return {void}
             */
            function inputFocused() {
                fixInputWidth();
                if (!container.hasClass(settings.containerFocusClass)) {
                    container.addClass(settings.containerFocusClass);
                }
                if (!!settings.placeholder) {
                    placeholder.fadeOut('fast');
                }
            }

            /**
             * Sets state of container when blurred
             * @return {void}
             */
            function inputBlurred() {
                tag_input.value = '';
                setInputWidth();
                if (container.hasClass(settings.containerFocusClass)) {
                    container.removeClass(settings.containerFocusClass);
                }
                if (!the_tags.length && settings.placeholder) {
                    placeholder.fadeIn('fast');
                }
            }

            /**
             * Runs all the events that need to run on keydown
             * @param  {Event} e
             * @return {void}
             */
            function keydownEvents(e) {
                e = e || window.event;

                listenForEndOfContainer();
                // comma or tab or enter
                if (isConfirmKey(e) && tag_input.value !== '') {
                    listenForTagConfirm(e);
                }
                chargeLastTag(e);
            }

            /**
             * Runs all the events that need to run on keyup
             * @param  {Event} e
             * @return {void}
             */
            function keyupEvents(e) {
                e = e || window.event;
            }

            /**
             * Confirms the inputted value to be converted to a tag
             * @param  {Event} e
             * @return {Boolean}
             */
            function listenForTagConfirm(e) {
                e = e || window.event;

                var code = e.keyCode,
                    last_taggle = container.find('.taggle:last'),
                    dupes;


                //tab, enter
                if (code === 9 || code === 13) {
                    dupes = checkForDupes();
                }
                if (!dupes || settings.allowDuplicates) {
                    confirmTag();
                }
                e.preventDefault();
                return false;

            }

            /**
             * Approximates when the hidden input should break to the next line
             * @return {void}
             */
            function listenForEndOfContainer() {
                var apx_width = (settings.fontSize / 8) * 4.5 * tag_input.value.length, //32px wide input = 5chars = 11px font
                    padding = container.outerWidth() - container.width(),
                    max = container.outerWidth() - padding;

                if (apx_width + 5 > parseInt(tag_input.style.width, 10)) {
                    tag_input.style.width = max + 'px';
                }
            }

            /**
             * Removes tag from the list and global tags array
             * @param  {Event} e
             * @return {void}
             */
            function removeTag(e) {
                e = e || window.event;
                var li = $(e.target).parent('li');

                li.remove();
                inputFocused();
                removeFromTheTags(e.target);
            }


            // Bang bang bang skeet skeet
            init();
        });
    };
})(jQuery);