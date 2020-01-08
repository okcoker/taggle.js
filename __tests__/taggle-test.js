'use strict';

// var sinon = require('sinon');
// var Taggle = require('../src/taggle');

// Patch since PhantomJS does not implement click() on HTMLElement.
if (!HTMLElement.prototype.click) {
    HTMLElement.prototype.click = function() { // eslint-disable-line
        var ev = document.createEvent('MouseEvent');
        ev.initMouseEvent(
            'click',
            /* bubble */true, /* cancelable */true,
            window, null,
            0, 0, 0, 0, /* coordinates */
            false, false, false, false, /* modifier keys */
            0/* button=left */, null
        );
        this.dispatchEvent(ev);
    };
}

function simulateKeyboardEvent(evt, el, key) { // eslint-disable-line
    var e = new Event(evt);

    e.key = key || '';
    e.altKey = false;
    e.ctrlKey = true;
    e.shiftKey = false;
    e.metaKey = false;
    // e.bubbles = true;

    if (typeof key === 'number') {
        e.key = undefined;
        e.keyCode = key;
        e.which = key;
    }
    else {
        e.keyCode = e.key.charCodeAt(0);
        e.which = e.keyCode;
    }

    el.dispatchEvent(e);
}

function createContainer(width, height) {
    var container = document.createElement('div');

    container.style.width = width + 'px';
    container.style.height = height + 'px';

    return container;
}

function getObjectLength(obj) {
    var len = 0;
    var key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            len += 1;
        }
    }
    return len;
}

var BACKSPACE = 8;
var DELETE = 46;
var COMMA = 188;
var TAB = 9;
var ENTER = 13;
var ARROW_LEFT = 37;
var ARROW_RIGHT = 39;

describe('Taggle', function() {
    var container;
    var container2;

    beforeEach(function() {
        container = createContainer(500, 300);
        container2 = createContainer(500, 300);
        container.id = 'taggle';
        container2.id = 'taggle2';
        document.body.appendChild(container);
        document.body.appendChild(container2);
    });

    afterEach(function() {
        container.parentNode.removeChild(container);
        container2.parentNode.removeChild(container2);
    });

    describe('Options', function() {
        var inst;

        beforeEach(function() {
            inst = new Taggle(container);
        });

        afterEach(function() {
            inst = null;
        });

        xit('should throw if an unknown option is passed', function() {
            var self = this;

            function willThrow() {
                return new Taggle(self.container, {
                    maxTagssss: 1
                });
            }

            expect(willThrow).toThrow();
        });

        it('should limit tags if the limitTags option is passed', function() {
            var taggle = new Taggle(container, {
                maxTags: 1
            });
            taggle.add(['tag', 'tag1']);
            expect(taggle.getTags().values.length).toEqual(1);
        });

        it('should disallow duplicate tags to be added by default', function() {
            expect(inst.getTags().values.length).toEqual(0);
            inst.add(['tag', 'tag']);
            expect(inst.getTags().values.length).toEqual(1);
        });

        it('should allow duplicate tags to be added when allowDuplicates is true', function() {
            var taggle = new Taggle(container, {
                allowDuplicates: true
            });

            expect(taggle.getTags().values.length).toEqual(0);
            taggle.add(['tag', 'tag']);
            expect(taggle.getTags().values.length).toEqual(2);

        });

        it('should preserve case when preserveCase is true', function() {
            var taggle = new Taggle(container, {
                preserveCase: true
            });

            expect(taggle.getTags().values.length).toEqual(0);
            taggle.add(['tag', 'Tag']);
            expect(taggle.getTags().values).toEqual(['tag', 'Tag']);
            expect(taggle.getTags().values.length).toEqual(2);
        });

        it('should only allow tags provided in allowedTags', function() {
            var allowed = 'tag';
            var taggle = new Taggle(container, {
                allowedTags: [allowed]
            });

            taggle.add(allowed);
            taggle.add('another');

            expect(taggle.getTags().values).toEqual([allowed]);
            expect(taggle.getTags().values.length).toEqual(1);
        });

        it('should only disallow tags provided in disallowedTags', function() {
            var disallowed = 'tag';
            var another = 'anothertag';
            var taggle = new Taggle(container, {
                disallowedTags: [disallowed]
            });

            taggle.add(disallowed);
            taggle.add(another);

            expect(taggle.getTags().values).toEqual([another]);
            expect(taggle.getTags().values.length).toEqual(1);
        });

        it('should focus the input on container click when focusInputOnContainerClick is true (default)', function() {
            expect(document.activeElement).not.toEqual(inst.getInput());

            container.click();

            expect(document.activeElement).toEqual(inst.getInput());
        });

        it('should not focus the input on container click when focusInputOnContainerClick is false', function() {
            var taggle = new Taggle(container, {
                focusInputOnContainerClick: false
            });

            expect(document.activeElement).not.toEqual(taggle.getInput());

            container.click();

            expect(document.activeElement).not.toEqual(taggle.getInput());
        });

        // When a container is display none or being resized from something
        // small, we need to reset the internal measurements of the container
        it('should remeasure container on focus', function() {
            container.style.display = 'none';
            var instance = new Taggle(container);
            var input = instance.getInput();

            container.style.display = 'block';
            input.focus();

            // Kind of a shitty magic number but without remeasuring the container
            // within _fixInputWidth, the input stays at about ~14px. This makes
            // sure we are correctly resizing the input to about the width of
            // the container (assuming we have no tags added)
            expect(input.clientWidth).toBeGreaterThan(300);
        });

        it('should trim tags by default', function() {
            var taggle = new Taggle(container);
            var input = taggle.getInput();
            var tag = '   tag';
            var tag2 = ',   spaaace  ';

            input.value = tag;

            simulateKeyboardEvent('keydown', input, COMMA);

            input.value = tag2;

            simulateKeyboardEvent('keydown', input, COMMA);

            expect(taggle.getTags().values).toEqual(['tag', 'spaaace']);
            expect(taggle.getTags().values.length).toEqual(2);
        });

        it('should trim tags by default when delimiter is customized', function() {
            var taggle = new Taggle(container, { delimiter: '|' });
            var input = taggle.getInput();
            var tag = '   tag';
            var tag2 = '|   spaaace  ';

            input.value = tag;

            simulateKeyboardEvent('keydown', input, COMMA);

            input.value = tag2;

            simulateKeyboardEvent('keydown', input, COMMA);

            expect(taggle.getTags().values).toEqual(['tag', 'spaaace']);
            expect(taggle.getTags().values.length).toEqual(2);
        });

        it('should not trim tags when `trimTags` is `false`', function() {
            var taggle = new Taggle(container, {
                trimTags: false
            });
            var input = taggle.getInput();
            var tag = '   tag';
            var tag2 = '   another   ';
            var tag3 = '   one';

            input.value = tag;

            simulateKeyboardEvent('keydown', input, COMMA);

            input.value = tag2;

            simulateKeyboardEvent('keydown', input, COMMA);

            input.value = tag3;

            simulateKeyboardEvent('keydown', input, COMMA);

            expect(taggle.getTags().values).toEqual([tag, tag2, tag3]);
            expect(taggle.getTags().values.length).toEqual(3);
        });

        describe('submitKeys', function() {
            it('should have comma, tab, and enter as default keys', function() {
                var instance = new Taggle(container, {
                    inputFormatter: function(input) {

                    }
                });

                expect(instance.settings.submitKeys.indexOf(COMMA) !== -1).toBe(true);
                expect(instance.settings.submitKeys.indexOf(TAB) !== -1).toBe(true);
                expect(instance.settings.submitKeys.indexOf(ENTER) !== -1).toBe(true);
            });

            // Allows for programmatically adding and removing without
            // relying on keyboards
            it('should let you set an empty array', function() {
                var instance = new Taggle(container, {
                    submitKeys: []
                });

                expect(instance.settings.submitKeys.length).toEqual(0);
            });
        });

        describe('placeholder', function() {
            it('should reappear if the input doesnt have a value', function() {
                var instance = new Taggle(container);
                var input = instance.getInput();
                var tag = 'thing';

                input.focus();
                input.value = tag;
                input.blur();

                expect(instance.placeholder.style.opacity).toEqual('1');
            });

            it('should not reappear if the input has a value', function() {
                var instance = new Taggle(container, {
                    clearOnBlur: false
                });
                var input = instance.getInput();
                var tag = 'thing';

                input.focus();
                input.value = tag;
                input.blur();

                expect(instance.placeholder.style.opacity).toEqual('0');
            });
        });

        describe('#inputFormatter', function() {
            it('should let you format the input element', function() {
                var instance = new Taggle(container, {
                    inputFormatter: function(input) {
                        input.type = 'email';
                        return input;
                    }
                });

                expect(instance.getInput().type).toEqual('email');
            });

            it('should use the default input if no input is returned', function() {
                var instance = new Taggle(container, {
                    inputFormatter: function(input) {

                    }
                });

                expect(instance.getInput()).toBeTruthy();
            });
        });

        describe('#tagFormatter', function() {
            it('should throw if li element is not returned', function() {
                var instance = new Taggle(container, {
                    tagFormatter: function() {
                        return '';
                    }
                });

                expect(instance.add.bind(instance, 'tag')).toThrow();
            });

            it('should be called with an LI element', function() {
                var spy = sinon.spy();
                var instance = new Taggle(container, {
                    tagFormatter: spy
                });

                instance.add('tag');

                expect(spy.args[0][0].tagName).toBe('LI');
            });

            it('should allow you to format the LI element before it is added to the textarea', function() {
                var html = 'test';
                var instance = new Taggle(container, {
                    tagFormatter: function(li) {
                        li.innerHTML = html;
                        return li;
                    }
                });

                instance.add('tag');

                var li = instance.getContainer().querySelector('.taggle');

                expect(li.innerHTML).toBe(html);
            });
        });

        describe('#onBeforeTagAdd', function() {
            it('should not add the tag if the function returns false', function() {
                var localContainer = createContainer(300, 400);
                var tag = 'tag';

                document.body.appendChild(localContainer);

                var taggle = new Taggle(localContainer, {
                    tags: ['some', 'tags', tag],
                    onBeforeTagAdd: function() {
                        return false;
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.add(tag);

                expect(taggle.getTagValues().length).toBe(length);

                localContainer.parentNode.removeChild(localContainer);
            });

            it('should add the tag if the function returns something other than false', function() {
                var localContainer = createContainer(300, 400);
                var tag = 'tag';

                document.body.appendChild(localContainer);

                var taggle = new Taggle(localContainer, {
                    tags: ['some', 'tags'],
                    onBeforeTagAdd: function() {
                        return 'ads';
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.add(tag);

                expect(taggle.getTagValues().length).toBe(length + 1);

                localContainer.parentNode.removeChild(localContainer);
            });
        });

        describe('#onTagAdd', function() {
            it('should be called after a tag has been added', function() {
                var localContainer = createContainer(300, 400);
                var tag = 'one';
                var onTagAddSpy = sinon.spy();
                var taggle;

                document.body.appendChild(localContainer);

                taggle = new Taggle(localContainer, {
                    onTagAdd: onTagAddSpy
                });

                expect(onTagAddSpy.called).toBe(false);
                taggle.add(tag);
                expect(onTagAddSpy.calledOnce).toBe(true);

                expect(onTagAddSpy.args[0][0]).toBeFalsy();
                expect(onTagAddSpy.args[0][1]).toBe(tag);
            });

            it('should reflect one additional tag value when being called', function() {
                var tagsLength;
                var localContainer = createContainer(300, 400);
                var tag = 'tag';
                var cbLength;
                var taggle;

                document.body.appendChild(localContainer);

                taggle = new Taggle(localContainer, {
                    onTagAdd: function() {
                        cbLength = taggle.getTagElements().length;
                    }
                });

                tagsLength = taggle.getTagElements().length;

                taggle.add(tag);

                expect(cbLength).toBe(tagsLength + 1);

                localContainer.parentNode.removeChild(localContainer);
            });

            it('should be chainable', function() {
                var tagsLength;
                var localContainer = createContainer(300, 400);
                var tag = 'tag';
                var tag2 = 'tag2';
                var cbLength;
                var taggle;

                document.body.appendChild(localContainer);

                taggle = new Taggle(localContainer, {
                    onTagAdd: function() {
                        cbLength = taggle.getTagElements().length;
                    }
                });

                tagsLength = taggle.getTagElements().length;

                taggle.add(tag).add(tag2);

                expect(cbLength).toBe(tagsLength + 2);

                localContainer.parentNode.removeChild(localContainer);
            });

            it('should return the tag text and id when attachTagId is true', function() {
                var spy = sinon.spy();
                var instance = new Taggle(container, {
                    onTagAdd: spy,
                    attachTagId: true
                });
                var text = 'tag';
                var tag2 = 'tag2';
                var tag3 = 'tag3';

                instance.add(text);

                expect(spy.args[0][0]).toBe(null);
                expect(spy.args[0][1].text).toBe(text);
                expect(spy.args[0][1].id).toBe(1);

                instance.add(tag2);

                expect(spy.args[1][1].text).toBe(tag2);
                expect(spy.args[1][1].id).toBe(2);

                instance.remove(tag2);

                instance.add(tag3);

                expect(spy.args[2][1].text).toBe(tag3);
                expect(spy.args[2][1].id).toBe(3);
            });
        });

        describe('#onBeforeTagRemove', function() {
            it('should not remove the tag if the function returns false', function() {
                var localContainer = createContainer(300, 400);
                var tag = 'tag';

                document.body.appendChild(localContainer);

                var taggle = new Taggle(localContainer, {
                    tags: ['some', 'tags', tag],
                    onBeforeTagRemove: function() {
                        return false;
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.remove(tag);

                expect(taggle.getTagValues().length).toBe(length);

                localContainer.parentNode.removeChild(localContainer);
            });

            it('should be async and remove the tag if using the callback with no truthy value', function(done) {
                var localContainer = createContainer(300, 400);
                var tag = 'tag';
                var tags = ['some', 'tags', tag];
                var length = tags.length;

                document.body.appendChild(localContainer);

                var taggle = new Taggle(localContainer, {
                    tags: tags,
                    onBeforeTagRemove: function(e, text, callback) {
                        setTimeout(function() {
                            callback();

                            expect(taggle.getTagValues().length).toBe(length - 1);

                            localContainer.parentNode.removeChild(localContainer);
                            done();
                        }, 200);
                    }
                });

                taggle.remove(tag);
            });

            it('should be async and not remove the tag if using the callback a truthy value', function(done) {
                var localContainer = createContainer(300, 400);
                var tag = 'tag';
                var tags = ['some', 'tags', tag];
                var length = tags.length;

                document.body.appendChild(localContainer);

                var taggle = new Taggle(localContainer, {
                    tags: tags,
                    onBeforeTagRemove: function(e, text, callback) {
                        setTimeout(function() {
                            var error = 'someTruthyValue';
                            callback(error);

                            expect(taggle.getTagValues().length).toBe(length);

                            localContainer.parentNode.removeChild(localContainer);
                            done();
                        }, 200);
                    }
                });

                taggle.remove(tag);
            });

            it('should remove the tag if the function returns something other than false', function() {
                var localContainer = createContainer(300, 400);
                var tag = 'tag';

                document.body.appendChild(localContainer);

                var taggle = new Taggle(localContainer, {
                    tags: ['some', 'tags', tag],
                    onBeforeTagRemove: function() {
                        return 'ads';
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.remove(tag);

                expect(taggle.getTagValues().length).toBe(length - 1);

                localContainer.parentNode.removeChild(localContainer);
            });

            it('should call callback with tag text and id when attachTagId is true', function() {
                var spy = sinon.spy();
                var tag = 'tag';
                var instance = new Taggle(container, {
                    tags: ['some', 'tags', tag],
                    onBeforeTagRemove: spy,
                    attachTagId: true
                });

                instance.remove(tag);

                expect(spy.args[0][1].text).toBe(tag);
                expect(spy.args[0][1].id).toBe(3);
            });

            it('should be chainable', function() {
                var localContainer = createContainer(300, 400);
                var tag = 'tag';
                var tag2 = 'tag2';

                document.body.appendChild(localContainer);

                var taggle = new Taggle(localContainer, {
                    tags: ['some', 'tags', tag, tag2],
                    onBeforeTagRemove: function() {
                        return 'ads';
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.remove(tag).remove(tag2);

                expect(taggle.getTagValues().length).toBe(length - 2);

                localContainer.parentNode.removeChild(localContainer);
            });
        });

        describe('#onTagRemove', function() {
            it('should be called after a tag has been removed', function() {
                var localContainer = createContainer(300, 400);
                var tag = 'one';
                var onTagRemoveSpy = sinon.spy();
                var taggle;

                document.body.appendChild(localContainer);

                taggle = new Taggle(localContainer, {
                    onTagRemove: onTagRemoveSpy
                });

                expect(onTagRemoveSpy.called).toBe(false);
                taggle.remove(tag);
                expect(onTagRemoveSpy.called).toBe(false);

                taggle.add(tag);
                taggle.remove(tag);
                expect(onTagRemoveSpy.calledOnce).toBe(true);

                expect(onTagRemoveSpy.args[0][0]).toBeFalsy();
                expect(onTagRemoveSpy.args[0][1]).toBe(tag);
            });

            it('should be called with removed the tag text and id when attachTagId is true', function() {
                var spy = sinon.spy();
                var tag = 'tag';
                var instance = new Taggle(container, {
                    tags: ['some', 'tags', tag],
                    onTagRemove: spy,
                    attachTagId: true
                });

                instance.remove(tag);

                expect(spy.args[0][1].text).toBe(tag);
                expect(spy.args[0][1].id).toBe(3);
            });

            it('should reflect one less tag value when being called', function() {
                var tagsLength;
                var localContainer = createContainer(300, 400);
                var tag = 'tag';
                var cbLength;
                var taggle;

                document.body.appendChild(localContainer);

                taggle = new Taggle(localContainer, {
                    onTagRemove: function() {
                        cbLength = taggle.getTagElements().length;
                    }
                });

                taggle.add(tag);

                tagsLength = taggle.getTagElements().length;

                taggle.remove(tag);

                expect(cbLength).toBe(tagsLength - 1);
            });
        });
    });

    describe('Overall functionality', function() {
        var inst;

        beforeEach(function() {
            inst = new Taggle(container);
        });

        afterEach(function() {
            inst = null;
        });

        it('should allow for multiple instances to co-exist', function() {
            var localContainer = createContainer(500, 300);
            localContainer.id = 'taggle3';
            document.body.appendChild(localContainer);

            var first = ['these', 'tags', 'should'];
            var firstLength = first.length;
            var second = ['not', 'affect', 'each', 'other'];
            var secondLength = second.length;

            inst.add(first);

            var instance = new Taggle(localContainer, {
                tags: second
            });

            instance.remove('other');
            expect(inst.getTagValues().length).toEqual(firstLength);
            expect(instance.getTagValues().length).toEqual(secondLength - 1);

            localContainer.parentNode.removeChild(localContainer);
        });

        it('should lowercase tags to be added by default', function() {
            expect(inst.getTags().values.length).toEqual(0);
            inst.add(['Tag']);
            expect(inst.getTags().values[0]).toEqual('tag');
        });

        it('should clear any input when the input element is blurred', function() {
            var input = inst.getInput();
            var tag = 'thing';

            expect(inst.getTagValues().length).toEqual(0);

            input.focus();
            input.value = tag;
            input.blur();

            expect(inst.getTagValues().length).toEqual(0);
        });

        it('should remove tag when clicking on close button', function() {
            inst.add(['Tag']);

            var tag = inst.getTags().elements[0];
            var removeButton = tag.querySelector('.close');

            removeButton.click();

            expect(inst.getTags().elements.length).toEqual(0);
        });

        it('should move the input when using arrow keys while there is no text in the input', function() {
            var tags = ['one', 'two', 'three', 'four'];
            var input = inst.getInput();
            var el = inst.getContainer();

            inst.add(tags);

            input.focus();

            // Go to beginning of list no matter how many times we press left
            tags.concat(tags).forEach(function() {
                simulateKeyboardEvent('keyup', input, ARROW_LEFT);
            });

            var expectedInput = el.querySelector('.taggle_list').children[0].firstChild;

            expect(input).toEqual(expectedInput);
        });

        it('should not move the input when using arrow keys while there is text in the input', function() {
            var tags = ['one', 'two', 'three', 'four'];
            var input = inst.getInput();
            var el = inst.getContainer();

            inst.add(tags);

            input.value = 'test';

            simulateKeyboardEvent('keyup', input, ARROW_LEFT);

            var children = el.querySelector('.taggle_list').children;
            var expectedInput = children[children.length - 2].firstChild;

            expect(input).toEqual(expectedInput);
        });

        it('should allow for inserting a tag lower in the stack after arrowing left', function() {
            var tags = ['one', 'two', 'three', 'four'];
            var input = inst.getInput();
            var tagToInsert = 'test';

            inst.add(tags);

            input.focus();

            simulateKeyboardEvent('keyup', input, ARROW_LEFT);

            input.value = tagToInsert;

            simulateKeyboardEvent('keydown', input, ENTER);

            expect(inst.getTags().values).toEqual(['one', 'two', 'three', tagToInsert, 'four']);
        });

        it('should allow for inserting a tag higher in the stack after arrowing right', function() {
            var tags = ['one', 'two', 'three', 'four'];
            var input = inst.getInput();
            var tagToInsert = 'test';

            inst.add(tags);

            input.focus();

            simulateKeyboardEvent('keyup', input, ARROW_LEFT);
            simulateKeyboardEvent('keyup', input, ARROW_LEFT);
            simulateKeyboardEvent('keyup', input, ARROW_RIGHT);

            input.value = tagToInsert;

            simulateKeyboardEvent('keydown', input, ENTER);

            expect(inst.getTags().values).toEqual(['one', 'two', 'three', tagToInsert, 'four']);
        });

        it('should increase the size of the input while typing', function() {
            var input = inst.getInput();
            var originalSize = parseInt(input.style.width, 10) || 0;

            input.focus();

            var text = '2';
            var keyCode = text.charCodeAt(0);

            input.value = text;
            simulateKeyboardEvent('keyup', input, keyCode);

            var newSize = parseInt(input.style.width, 10);

            expect(newSize).toBeGreaterThan(originalSize);
        });

        it('should delete the previous tag based on input position', function() {
            var tags = ['one', 'two', 'three', 'four'];
            var input = inst.getInput();

            inst.add(tags);

            input.focus();

            simulateKeyboardEvent('keyup', input, ARROW_LEFT);
            simulateKeyboardEvent('keydown', input, BACKSPACE);
            simulateKeyboardEvent('keydown', input, BACKSPACE);

            expect(inst.getTags().values).toEqual(['one', 'two', 'four']);
        });

        it('should delete the next tag if the input position is before it and delete is pressed', function() {
            var tags = ['one', 'two', 'three', 'four'];
            var input = inst.getInput();

            inst.add(tags);

            input.focus();

            simulateKeyboardEvent('keyup', input, ARROW_LEFT);
            simulateKeyboardEvent('keydown', input, DELETE);
            simulateKeyboardEvent('keydown', input, DELETE);

            expect(inst.getTags().values).toEqual(['one', 'two', 'three']);
        });
    });

    describe('Public API', function() {
        var inst;

        beforeEach(function() {
            inst = new Taggle(container, {
                tags: ['zero', 'one', 'two', 'three']
            });
        });

        afterEach(function() {
            inst = null;
        });

        describe('#getTagValues', function() {
            it('should match length of tags passed in options', function() {
                expect(inst.getTagValues().length).toEqual(4);
            });

            it('should return a copy of the tag values', function() {
                var tags = inst.getTagValues();
                var tagsLength = tags.length;

                tags.pop();

                expect(inst.getTagValues().length).toEqual(tagsLength);
            });

            it('should return values with the tag text and id when attachTagId is true', function() {
                var instance = new Taggle(container, {
                    tags: ['zero', 'one', 'two', 'three'],
                    attachTagId: true
                });

                expect(instance.getTagValues()[0].text).toEqual('zero');
                expect(instance.getTagValues()[0].id).toEqual(1);

                expect(instance.getTagValues()[3].text).toEqual('three');
                expect(instance.getTagValues()[3].id).toEqual(4);
            });
        });

        describe('#getTagElements', function() {
            it('should match length of added tags', function() {
                expect(inst.getTagElements().length).toEqual(4);
            });

            it('should return a copy of the tag elements', function() {
                var tags = inst.getTagElements();
                var tagsLength = tags.length;

                tags.pop();

                expect(inst.getTagElements().length).toEqual(tagsLength);
            });
        });

        describe('#getTags', function() {
            it('should return an object with 2 arrays that match getTagValues() and getTagElements()', function() {
                expect(getObjectLength(inst.getTags())).toEqual(2);
                expect(inst.getTags().values.length).toEqual(4);
                expect(inst.getTags().elements.length).toEqual(4);
            });
        });

        describe('#getContainer', function() {
            it('should return original selected DOM element', function() {
                expect(inst.getContainer()).toEqual(container);
            });
        });

        describe('#getInput', function() {
            it('should return the container\'s text input', function() {
                expect(inst.getInput()).toEqual(inst.getContainer().querySelector('input[type="text"]'));
            });
        });

        describe('#add', function() {
            it('should add a new tag from a string argument', function() {
                expect(inst.getTagElements().length).toEqual(4);
                inst.add('four');
                inst.add(3);
                inst.add(true);
                inst.add(false);
                inst.add([]);
                inst.add([2]);
                inst.add('');
                expect(inst.getTagElements().length).toEqual(5);
            });

            it('should add new tags from an array of strings', function() {
                expect(inst.getTagElements().length).toEqual(4);
                inst.add(['four', 'five', 4, true, undefined]);
                inst.add(['', Array, false]);
                expect(inst.getTagElements().length).toEqual(6);
            });

            it('should add new tags from a comma delimited list', function() {
                expect(inst.getTagElements().length).toEqual(4);
                var tags = 'four, five, six, seven';
                var allTags = inst.getTagValues()
                    .concat(tags.split(','))
                    .map(function(tag) {
                        return tag.trim();
                    });
                inst.add(tags);
                expect(inst.getTagElements().length).toEqual(8);

                // Ensure added in same order
                inst.getTagValues().forEach(function(tag, i) {
                    expect(tag).toEqual(allTags[i]);
                });
            });

            it('should add new tags from a comma delimited list with specified delimiter', function() {
                var delimiter = '|';
                var instance = new Taggle(container, {
                    delimeter: delimiter
                });
                var tags = 'four| five| six| seven';
                var allTags = tags.split(delimiter).map(function(tag) {
                    return tag.trim();
                });
                instance.add(tags);
                expect(instance.getTagElements().length).toEqual(allTags.length);

                // Ensure added in same order
                instance.getTagValues().forEach(function(tag, i) {
                    expect(tag).toEqual(allTags[i]);
                });
            });

            it('should add new tags when spelling delimiter correctly :)', function() {
                var delimiter = '|';
                var instance = new Taggle(container, {
                    delimiter: delimiter
                });
                var tags = 'four| five| six| seven';
                var allTags = tags.split(delimiter).map(function(tag) {
                    return tag.trim();
                });
                instance.add(tags);
                expect(instance.getTagElements().length).toEqual(allTags.length);

                // Ensure added in same order
                instance.getTagValues().forEach(function(tag, i) {
                    expect(tag).toEqual(allTags[i]);
                });
            });


            it('should preserve spaces when trim is false', function() {
                var instance = new Taggle(container, {
                    trimTags: false
                });
                var tags = ['one ', '  two', '   three  '];

                instance.add(tags);

                expect(instance.getTagElements().length).toEqual(tags.length);

                // Ensure added in same order
                instance.getTagValues().forEach(function(tag, i) {
                    expect(tag).toEqual(tags[i]);
                });
            });

            it('should add a tag at a specified index', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two', 'four']
                });
                var three = 'three';

                instance.add(three, 2);

                expect(instance.getTagElements().length).toEqual(4);
                expect(instance.getTagValues()).toEqual(['one', 'two', 'three', 'four']);
            });

            it('should add a tag mutliple tags starting at a specified index', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two', 'five']
                });
                var tags = ['three', 'four'];

                instance.add(tags, 2);

                expect(instance.getTagElements().length).toEqual(5);
                expect(instance.getTagValues()).toEqual(['one', 'two', 'three', 'four', 'five']);
            });

            it('should add a tag at the end if the index is higher than the tag length', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two', 'three']
                });
                var tag = 'four';

                instance.add(tag, 99);

                expect(instance.getTagElements().length).toEqual(4);
                expect(instance.getTagValues()).toEqual(['one', 'two', 'three', 'four']);
            });

            it('should add a tag at the end if the index is higher than the tag length', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two', 'three']
                });
                var tags = ['four', 'five'];

                instance.add(tags, 99);

                expect(instance.getTagElements().length).toEqual(5);
                expect(instance.getTagValues()).toEqual(['one', 'two', 'three', 'four', 'five']);
            });

            it('should be chainable', function() {
                var instance = new Taggle(container);
                var localContainer = instance.add('text').getContainer();

                expect(container).toEqual(localContainer);
            });
        });

        describe('#edit', function() {
            it('should be chainable', function() {
                var instance = new Taggle(container, {
                    tags: ['test']
                });
                var localContainer = instance.edit('text', 0).getContainer();

                expect(container).toEqual(localContainer);
            });

            it('should throw if first argument is not a string', function() {
                var instance = new Taggle(container, {
                    tags: ['one']
                });

                expect(instance.edit.bind(instance, null)).toThrow();
            });

            it('should throw if second argument is not a number', function() {
                var instance = new Taggle(container, {
                    tags: ['one']
                });

                expect(instance.edit.bind(instance, 'two', null)).toThrow();
            });

            it('should throw if second argument is greater than tag length', function() {
                var instance = new Taggle(container, {
                    tags: ['one']
                });

                expect(instance.edit.bind(instance, 'two', 3)).toThrow();
            });

            it('should throw if second argument is less than 0', function() {
                var instance = new Taggle(container, {
                    tags: ['one']
                });

                expect(instance.edit.bind(instance, 'two', -1)).toThrow();
            });

            it('should edit tag indicies appropriately', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two']
                });

                instance.edit('three', 0).edit('four', 1);

                expect(instance.getTagValues()).toEqual(['three', 'four']);
            });

            it('should edit leave tag ids intact', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two'],
                    attachTagId: true
                });

                instance.edit('three', 0).edit('four', 1);

                expect(instance.getTagValues()).toEqual([{ text: 'three', id: 1 }, { text: 'four', id: 2 }]);
            });

            it('should edit leave element references intact', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two'],
                    attachTagId: true
                });
                var elements = instance.getTagElements();

                instance.edit('three', 0).edit('four', 1);

                expect(instance.getTagElements()[0]).toEqual(elements[0]);
                expect(instance.getTagElements()[1]).toEqual(elements[1]);
            });
        });

        describe('#move', function() {
            it('should be chainable', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two']
                });
                var localContainer = instance.move(0, 1).getContainer();

                expect(container).toEqual(localContainer);
            });

            it('should throw if first argument is not a number', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two']
                });

                expect(instance.move.bind(instance, null)).toThrow();
            });

            it('should throw if second argument is not a number', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two']
                });

                expect(instance.move.bind(instance, 0, null)).toThrow();
            });

            it('should throw if either argument is greater than tag length', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two']
                });

                expect(instance.move.bind(instance, 0, 3)).toThrow();
                expect(instance.move.bind(instance, 3, 0)).toThrow();
            });

            it('should throw if either argument is less than 0', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two']
                });

                expect(instance.move.bind(instance, 0, -1)).toThrow();
                expect(instance.move.bind(instance, -1, 1)).toThrow();
            });

            it('should move tags appropriately', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two']
                });

                instance.move(0, 1);

                expect(instance.getTagValues()).toEqual(['two', 'one']);
            });

            it('should edit leave tag ids intact', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two'],
                    attachTagId: true
                });

                instance.move(0, 1);

                expect(instance.getTagValues()).toEqual([{ text: 'two', id: 2 }, { text: 'one', id: 1 }]);
            });

            it('should edit leave element references intact', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two']
                });
                var elements = instance.getTagElements();
                var fromIndex = 0;
                var destinationIndex = 1;


                instance.move(fromIndex, destinationIndex);

                expect(instance.getTagElements()[destinationIndex]).toEqual(elements[fromIndex]);
            });

            it('should edit leave element references intact with attached tag ids', function() {
                var instance = new Taggle(container, {
                    tags: ['one', 'two'],
                    attachTagId: true
                });
                var elements = instance.getTagElements();
                var fromIndex = 0;
                var destinationIndex = 1;


                instance.move(fromIndex, destinationIndex);

                expect(instance.getTagElements()[destinationIndex]).toEqual(elements[fromIndex]);
            });
        });

        describe('#remove', function() {
            var localInst;

            beforeEach(function() {
                localInst = new Taggle(container, {
                    tags: ['zero', 'one', 'two', 'three', 'four', 'three'],
                    allowDuplicates: true
                });
            });

            it('should remove the most recent occurance of the tag if it exists', function() {
                expect(localInst.getTagElements().length).toEqual(6);
                localInst.remove('four');
                localInst.remove('five');
                localInst.remove(3);
                localInst.remove(false, true);
                localInst.remove('');
                expect(localInst.getTagElements().length).toEqual(5);
                expect(localInst.getTagValues().length).toEqual(5);
                expect(localInst._closeEvents.length).toEqual(5);
                expect(localInst._closeButtons.length).toEqual(5);
                expect(localInst.getTagValues()[4]).toEqual(localInst.getTagValues()[3]);
            });

            it('should remove all occurances of a string if the second argument is true', function() {
                expect(localInst.getTagElements().length).toEqual(6);
                localInst.remove('three', true);
                localInst.remove('five', true);
                localInst.remove(2, true);
                localInst.remove('', true);
                expect(localInst.getTagElements().length).toEqual(4);
                expect(localInst.getTagValues().length).toEqual(4);
                expect(localInst.getTagValues()[3]).toEqual('four');
            });
        });

        describe('#saveOnBlur', function() {
            var localInst;

            beforeEach(function() {
                localInst = new Taggle(container, {
                    saveOnBlur: true
                });
            });

            it('should save remaining text as a tag when input is blurred', function() {
                var input = localInst.getInput();
                var tag = 'thing';

                expect(localInst.getTagValues().length).toEqual(0);

                input.focus();
                input.value = tag;
                input.blur();

                expect(localInst.getTagValues().length).toEqual(1);
                expect(localInst.getTagValues()[0]).toEqual(tag);
            });

            it('should not prevent the container from losing focus class when input is blurred', function() {
                var input = localInst.getInput();

                input.focus();

                expect(localInst.getContainer().classList.contains(localInst.settings.containerFocusClass)).toBe(true);

                input.blur();

                expect(localInst.getContainer().classList.contains(localInst.settings.containerFocusClass)).toBe(false);
            });
        });

        describe('#clearOnBlur', function() {
            it('setting to false should not clear the remaining text when input is blurred', function() {
                var instance = new Taggle(container, {
                    clearOnBlur: false
                });
                var input = instance.getInput();
                var tag = 'thing';

                expect(instance.getTagValues().length).toEqual(0);

                input.focus();
                input.value = tag;
                input.blur();

                expect(input.value).toEqual(tag);
            });

            it('setting to true should clear the remaining text when input is blurred', function() {
                var instance = new Taggle(container, {
                    clearOnBlur: true
                });
                var input = instance.getInput();
                var tag = 'thing';

                expect(instance.getTagValues().length).toEqual(0);

                input.focus();
                input.value = tag;
                input.blur();

                expect(input.value).toEqual('');
            });

            it('default should clear the remaining text when input is blurred', function() {
                var instance = new Taggle(container);
                var input = instance.getInput();
                var tag = 'thing';

                expect(instance.getTagValues().length).toEqual(0);

                input.focus();
                input.value = tag;
                input.blur();

                expect(input.value).toEqual('');
            });
        });

        describe('#setOptions', function() {
            it('should be chainable', function() {
                function chain() {
                    inst.setOptions().add('tag');
                }
                expect(chain.bind(this)).not.toThrow();
            });

            it('should set options', function() {
                var initial = inst.settings.allowDuplicates;
                var opposite = !initial;

                inst.setOptions({
                    allowDuplicates: opposite
                });

                expect(inst.settings.allowDuplicates).toEqual(opposite);
            });
        });

        describe('#removeAll', function() {
            var localInst;

            beforeEach(function() {
                localInst = new Taggle(container, {
                    tags: ['zero', 'one', 'two', 'three', 'four', 'three']
                });
            });

            it('should remove all existent tags', function() {
                expect(localInst.getTagElements().length).toEqual(6);
                localInst.removeAll();
                expect(localInst.getTagElements().length).toEqual(0);
                expect(localInst.getTagValues().length).toEqual(0);
            });

            it('should be chainable', function() {
                expect(localInst.getTagElements().length).toEqual(6);
                localInst.removeAll().add('tag');
                expect(localInst.getTagElements().length).toEqual(1);
                expect(localInst.getTagValues().length).toEqual(1);
            });

            it('should cause the placeholder to reappear', function() {
                localInst.removeAll();

                expect(localInst.placeholder.style.opacity).toEqual('1');
            });
        });

        describe('#disable', function() {
            var localInst;

            beforeEach(function() {
                localInst = new Taggle(container, {
                    tags: ['zero', 'one', 'two', 'three', 'four', 'three']
                });
            });

            it('should add a disabled attribute to any buttons or inputs', function() {
                localInst.disable();
                var inputs = [].slice.call(container.querySelectorAll('input'));
                var buttons = [].slice.call(container.querySelectorAll('button'));

                inputs.concat(buttons).forEach(function(el) {
                    expect(typeof el.getAttribute('disabled') !== 'undefined').toBe(true);
                });
            });

            it('should be chainable', function() {
                var localContainer = localInst.disable().getContainer();

                expect(container).toEqual(localContainer);
            });

        });

        describe('#enable', function() {
            beforeEach(function() {
                inst = new Taggle(container, {
                    tags: ['zero', 'one', 'two', 'three', 'four', 'three']
                });
            });

            it('should remove the disabled attribute from any buttons or inputs', function() {
                inst.disable();
                inst.enable();
                var inputs = [].slice.call(container.querySelectorAll('input'));
                var buttons = [].slice.call(container.querySelectorAll('button'));

                inputs.concat(buttons).forEach(function(el) {
                    expect(el.getAttribute('disabled') === null).toBe(true);
                });
            });

            it('should be chainable', function() {
                var localContainer = inst.enable().getContainer();

                expect(container).toEqual(localContainer);
            });
        });

        describe('#setData/#getData', function() {
            var localInst;
            var localInst2;

            beforeEach(function() {
                localInst = new Taggle(container);
                localInst2 = new Taggle(container2);
            });

            it('set and get abitrary data', function() {
                var data = localInst.getData();
                var data2 = localInst2.getData();

                expect(data).toEqual(null);
                expect(data2).toEqual(null);

                var someData = { test: 1 };
                var someMoreData = { test: 2 };

                localInst.setData(someData);
                localInst2.setData(someMoreData);

                data = localInst.getData();
                data2 = localInst2.getData();

                expect(data.test).toEqual(1);
                expect(data2.test).toEqual(2);
            });
        });

        describe('#checkCloseButtonType', function() {
            var localInst;

            beforeEach(function() {
                localInst = new Taggle(container, {
                    tags: ['zero', 'one', 'two']
                });
            });

            it('should have type equal to button', function() {
                var elements = localInst.getTagElements();
                for (var i = 0; i < elements.length; ++i) {
                    var closeButton = elements[i].querySelector('button.close');
                    expect(closeButton).toEqual(jasmine.objectContaining({ 'type': 'button' }));
                }
            });
        });

        describe('#attachEvents/#removeEvents', function() {
            var localInst;

            beforeEach(function() {
                localInst = new Taggle(container, {
                    tags: ['zero', 'one', 'two']
                });
            });

            it('should remove and reattach events appropriately', function() {
                var elements = localInst.getTags().elements;
                var length = elements.length;
                var tag = elements[elements.length - 1];
                var removeButton = tag.querySelector('.close');

                localInst.removeEvents();

                removeButton.click();

                expect(localInst.getTags().elements.length).toEqual(length);


                localInst.attachEvents();

                removeButton.click();

                expect(localInst.getTags().elements.length).toEqual(length - 1);
            });

            it('should be chainable', function() {
                localInst.removeEvents().attachEvents().removeEvents();

                expect(true).toBe(true);
            });
        });
    });
});
