var expect = chai.expect;

// Patch since PhantomJS does not implement click() on HTMLElement.
if (!HTMLElement.prototype.click) {
    HTMLElement.prototype.click = function() {
        var ev = document.createEvent('MouseEvent');
        ev.initMouseEvent(
            'click',
            /*bubble*/true, /*cancelable*/true,
            window, null,
            0, 0, 0, 0, /*coordinates*/
            false, false, false, false, /*modifier keys*/
            0/*button=left*/, null
        );
        this.dispatchEvent(ev);
    };
}

function createContainer(width, height) {
    'use strict';
    var container = document.createElement('div');

    container.style.width = width + 'px';
    container.style.height = height + 'px';

    return container;
}

function getObjectLength(obj) {
    'use strict';
    var len = 0;
    var key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            len += 1;
        }
    }
    return len;
}

describe('Taggle', function() {
    'use strict';

    beforeEach(function() {
        this.container = createContainer(500, 300);
        this.container.id = 'taggle';
        document.body.appendChild(this.container);
    });

    afterEach(function() {
        this.container.parentNode.removeChild(this.container);
    });

    describe('Options', function() {

        beforeEach(function() {
            this.instance = new Taggle(this.container);
        });

        afterEach(function() {
            this.instance = null;
        });

        it('should limit tags if the limitTags option is passed', function() {
            var taggle = new Taggle(this.container, {
                maxTags: 1
            });
            taggle.add(['tag', 'tag1']);
            expect(taggle.getTags().values.length).to.equal(1);
        });

        it('should disallow duplicate tags to be added by default', function() {
            expect(this.instance.getTags().values.length).to.equal(0);
            this.instance.add(['tag', 'tag']);
            expect(this.instance.getTags().values.length).to.equal(1);
        });

        it('should allow duplicate tags to be added when allowDuplicates is true', function() {
            var taggle = new Taggle(this.container, {
                allowDuplicates: true
            });

            expect(taggle.getTags().values.length).to.equal(0);
            taggle.add(['tag', 'tag']);
            expect(taggle.getTags().values.length).to.equal(2);

        });

        it('should preserve case when preserveCase is true', function() {
            var taggle = new Taggle(this.container, {
                preserveCase: true
            });

            expect(taggle.getTags().values.length).to.equal(0);
            taggle.add(['tag', 'Tag']);
            expect(taggle.getTags().values).to.eql(['tag', 'Tag']);
            expect(taggle.getTags().values.length).to.equal(2);
        });

        it('should only allow tags provided in allowedTags', function() {
            var allowed = 'tag';
            var taggle = new Taggle(this.container, {
                allowedTags: [allowed]
            });

            taggle.add(allowed);
            taggle.add('another');

            expect(taggle.getTags().values).to.eql([allowed]);
            expect(taggle.getTags().values.length).to.equal(1);
        });

        it('should only disallow tags provided in disallowedTags', function() {
            var disallowed = 'tag';
            var another = 'anothertag';
            var taggle = new Taggle(this.container, {
                disallowedTags: [disallowed]
            });

            taggle.add(disallowed);
            taggle.add(another);

            expect(taggle.getTags().values).to.eql([another]);
            expect(taggle.getTags().values.length).to.equal(1);
        });

        it('should focus the input on container click when focusInputOnContainerClick is true (default)', function() {
            expect(document.activeElement).to.not.equal(this.instance.getInput());

            this.container.click();

            expect(document.activeElement).to.equal(this.instance.getInput());
        });

        it('should not focus the input on container click when focusInputOnContainerClick is false', function() {
            var taggle = new Taggle(this.container, {
                focusInputOnContainerClick: false
            });

            expect(document.activeElement).to.not.equal(taggle.getInput());

            this.container.click();

            expect(document.activeElement).to.not.equal(taggle.getInput());
        });

        // When a container is display none or being resized from something
        // small, we need to reset the internal measurements of the container
        it('should remeasure container on focus', function() {
            this.container.style.display = 'none';
            var instance = new Taggle(this.container);
            var input = instance.getInput();

            this.container.style.display = 'block';
            input.focus();

            // Kind of a shitty magic number but without remeasuring the container
            // within _fixInputWidth, the input stays at about ~14px. This makes
            // sure we are correctly resizing the input to about the width of
            // the container (assuming we have no tags added)
            expect(input.clientWidth > 300).to.be.true;
        });

        describe('submitKeys', function() {
            it('should have comma, tab, and enter as default keys', function() {
                var COMMA = 188;
                var TAB = 9;
                var ENTER = 13;
                var instance = new Taggle(this.container, {
                    inputFormatter: function(input) {

                    }
                });

                expect(instance.settings.submitKeys.indexOf(COMMA) !== -1).to.be.true;
                expect(instance.settings.submitKeys.indexOf(TAB) !== -1).to.be.true;
                expect(instance.settings.submitKeys.indexOf(ENTER) !== -1).to.be.true;
            });

            // Allows for programmatically adding and removing without
            // relying on keyboards
            it('should let you set an empty array', function() {
                var instance = new Taggle(this.container, {
                    submitKeys: []
                });

                expect(instance.settings.submitKeys.length).to.equal(0);
            });
        });

        describe('placeholder', function() {
            it('should reappear if the input doesnt have a value', function() {
                var instance = new Taggle(this.container);
                var input = instance.getInput();
                var tag = 'thing';

                input.focus();
                input.value = tag;
                input.blur();

                expect(instance.placeholder.style.opacity).to.equal('1');
            });

            it('should not reappear if the input has a value', function() {
                var instance = new Taggle(this.container, {
                    clearOnBlur: false
                });
                var input = instance.getInput();
                var tag = 'thing';

                input.focus();
                input.value = tag;
                input.blur();

                expect(instance.placeholder.style.opacity).to.equal('0');
            });
        });

        describe('#inputFormatter', function() {
            it('should let you format the input element', function() {
                var instance = new Taggle(this.container, {
                    inputFormatter: function(input) {
                        input.type = 'email';
                        return input;
                    }
                });

                expect(instance.getInput().type).to.equal('email');
            });

            it('should use the default input if no input is returned', function() {
                var instance = new Taggle(this.container, {
                    inputFormatter: function(input) {

                    }
                });

                expect(instance.getInput()).to.exist;
            });
        });

        describe('#tagFormatter', function() {
            it('should throw if li element is not returned', function() {
                var instance = new Taggle(this.container, {
                    tagFormatter: function() {
                        return '';
                    }
                });

                expect(instance.add.bind(instance, 'tag')).to.throw();
            });

            it('should be called with an LI element', function() {
                var spy = sinon.spy();
                var instance = new Taggle(this.container, {
                    tagFormatter: spy
                });

                instance.add('tag');

                expect(spy.args[0][0].tagName).to.eq('LI');
            });

            it('should allow you to format the LI element before it is added to the textarea', function() {
                var html = 'test';
                var instance = new Taggle(this.container, {
                    tagFormatter: function(li) {
                        li.innerHTML = html;
                        return li;
                    }
                });

                instance.add('tag');

                var li = instance.getContainer().querySelector('.taggle');

                expect(li.innerHTML).to.eq(html);
            });
        });

        describe('#onBeforeTagAdd', function() {
            it('should not add the tag if the function returns false', function() {
                var container = createContainer(300, 400);
                var tag = 'tag';

                document.body.appendChild(container);

                var taggle = new Taggle(container, {
                    tags: ['some', 'tags', tag],
                    onBeforeTagAdd: function() {
                        return false;
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.add(tag);

                expect(taggle.getTagValues().length).to.eq(length);

                container.parentNode.removeChild(container);
            });

            it('should add the tag if the function returns something other than false', function() {
                var container = createContainer(300, 400);
                var tag = 'tag';

                document.body.appendChild(container);

                var taggle = new Taggle(container, {
                    tags: ['some', 'tags'],
                    onBeforeTagAdd: function() {
                        return 'ads';
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.add(tag);

                expect(taggle.getTagValues().length).to.eq(length + 1);

                container.parentNode.removeChild(container);
            });
        });

        describe('#onTagAdd', function() {
            it('should be called after a tag has been added', function() {
                var container = createContainer(300, 400);
                var tag = 'one';
                var onTagAddSpy = sinon.spy();
                var taggle;

                document.body.appendChild(container);

                taggle = new Taggle(container, {
                    onTagAdd: onTagAddSpy
                });

                expect(onTagAddSpy).to.not.have.been.called;
                taggle.add(tag);
                expect(onTagAddSpy).to.have.been.calledOnce;

                expect(onTagAddSpy.args[0][0]).to.not.be.ok;
                expect(onTagAddSpy.args[0][1]).to.eq(tag);
            });

            it('should reflect one additional tag value when being called', function() {
                var tagsLength;
                var container = createContainer(300, 400);
                var tag = 'tag';
                var cbLength;
                var taggle;

                document.body.appendChild(container);

                taggle = new Taggle(container, {
                    onTagAdd: function() {
                        cbLength = taggle.getTagElements().length;
                    }
                });

                tagsLength = taggle.getTagElements().length;

                taggle.add(tag);

                expect(cbLength).to.eq(tagsLength + 1);

                container.parentNode.removeChild(container);
            });

            it('should be chainable', function() {
                var tagsLength;
                var container = createContainer(300, 400);
                var tag = 'tag';
                var tag2 = 'tag2';
                var cbLength;
                var taggle;

                document.body.appendChild(container);

                taggle = new Taggle(container, {
                    onTagAdd: function() {
                        cbLength = taggle.getTagElements().length;
                    }
                });

                tagsLength = taggle.getTagElements().length;

                taggle.add(tag).add(tag2);

                expect(cbLength).to.eq(tagsLength + 2);

                container.parentNode.removeChild(container);
            });

            it('should return the tag text and id when attachTagId is true', function() {
                var spy = sinon.spy();
                var instance = new Taggle(this.container, {
                    onTagAdd: spy,
                    attachTagId: true
                });
                var text = 'tag';
                var tag2 = 'tag2';
                var tag3 = 'tag3';

                instance.add(text);

                expect(spy.args[0][0]).to.eq(null);
                expect(spy.args[0][1].text).to.eq(text);
                expect(spy.args[0][1].id).to.eq(1);

                spy.reset();

                instance.add(tag2);

                expect(spy.args[0][1].text).to.eq(tag2);
                expect(spy.args[0][1].id).to.eq(2);
                spy.reset();

                instance.remove(tag2);

                instance.add(tag3);

                expect(spy.args[0][1].text).to.eq(tag3);
                expect(spy.args[0][1].id).to.eq(3);
                spy.reset();
            });
        });

        describe('#onBeforeTagRemove', function() {
            it('should not remove the tag if the function returns false', function() {
                var container = createContainer(300, 400);
                var tag = 'tag';

                document.body.appendChild(container);

                var taggle = new Taggle(container, {
                    tags: ['some', 'tags', tag],
                    onBeforeTagRemove: function() {
                        return false;
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.remove(tag);

                expect(taggle.getTagValues().length).to.eq(length);

                container.parentNode.removeChild(container);
            });

            it('should be async and remove the tag if using the callback with no truthy value', function(done) {
                var container = createContainer(300, 400);
                var tag = 'tag';
                var tags = ['some', 'tags', tag];
                var length = tags.length;

                document.body.appendChild(container);

                var taggle = new Taggle(container, {
                    tags: tags,
                    onBeforeTagRemove: function(e, text, callback) {
                        setTimeout(function() {
                            callback();

                            expect(taggle.getTagValues().length).to.eq(length - 1);

                            container.parentNode.removeChild(container);
                            done();
                        }, 200);
                    }
                });

                taggle.remove(tag);
            });

            it('should be async and not remove the tag if using the callback a truthy value', function(done) {
                var container = createContainer(300, 400);
                var tag = 'tag';
                var tags = ['some', 'tags', tag];
                var length = tags.length;

                document.body.appendChild(container);

                var taggle = new Taggle(container, {
                    tags: tags,
                    onBeforeTagRemove: function(e, text, callback) {
                        setTimeout(function() {
                            var error = 'someTruthyValue';
                            callback(error);

                            expect(taggle.getTagValues().length).to.eq(length);

                            container.parentNode.removeChild(container);
                            done();
                        }, 200);
                    }
                });

                taggle.remove(tag);
            });

            it('should remove the tag if the function returns something other than false', function() {
                var container = createContainer(300, 400);
                var tag = 'tag';

                document.body.appendChild(container);

                var taggle = new Taggle(container, {
                    tags: ['some', 'tags', tag],
                    onBeforeTagRemove: function() {
                        return 'ads';
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.remove(tag);

                expect(taggle.getTagValues().length).to.eq(length - 1);

                container.parentNode.removeChild(container);
            });

            it('should call callback with tag text and id when attachTagId is true', function() {
                var spy = sinon.spy();
                var tag = 'tag';
                var instance = new Taggle(this.container, {
                    tags: ['some', 'tags', tag],
                    onBeforeTagRemove: spy,
                    attachTagId: true
                });

                instance.remove(tag);

                expect(spy.args[0][1].text).to.eq(tag);
                expect(spy.args[0][1].id).to.eq(3);
            });

            it('should be chainable', function() {
                var container = createContainer(300, 400);
                var tag = 'tag';
                var tag2 = 'tag2';

                document.body.appendChild(container);

                var taggle = new Taggle(container, {
                    tags: ['some', 'tags', tag, tag2],
                    onBeforeTagRemove: function() {
                        return 'ads';
                    }
                });

                var length = taggle.getTagValues().length;
                taggle.remove(tag).remove(tag2);

                expect(taggle.getTagValues().length).to.eq(length - 2);

                container.parentNode.removeChild(container);
            });
        });

        describe('#onTagRemove', function() {
            it('should be called after a tag has been removed', function() {
                var container = createContainer(300, 400);
                var tag = 'one';
                var onTagRemoveSpy = sinon.spy();
                var taggle;

                document.body.appendChild(container);

                taggle = new Taggle(container, {
                    onTagRemove: onTagRemoveSpy
                });

                expect(onTagRemoveSpy).to.not.have.been.called;
                taggle.remove(tag);
                expect(onTagRemoveSpy).to.not.have.been.called;

                taggle.add(tag);
                taggle.remove(tag);
                expect(onTagRemoveSpy).to.have.been.calledOnce;

                expect(onTagRemoveSpy.args[0][0]).to.not.be.ok;
                expect(onTagRemoveSpy.args[0][1]).to.eq(tag);
            });

            it('should be called with removed the tag text and id when attachTagId is true', function() {
                var spy = sinon.spy();
                var tag = 'tag';
                var instance = new Taggle(this.container, {
                    tags: ['some', 'tags', tag],
                    onTagRemove: spy,
                    attachTagId: true
                });

                instance.remove(tag);

                expect(spy.args[0][1].text).to.eq(tag);
                expect(spy.args[0][1].id).to.eq(3);
            });

            it('should reflect one less tag value when being called', function() {
                var tagsLength;
                var container = createContainer(300, 400);
                var tag = 'tag';
                var cbLength;
                var taggle;

                document.body.appendChild(container);

                taggle = new Taggle(container, {
                    onTagRemove: function() {
                        cbLength = taggle.getTagElements().length;
                    }
                });

                taggle.add(tag);

                tagsLength = taggle.getTagElements().length;

                taggle.remove(tag);

                expect(cbLength).to.eq(tagsLength - 1);
            });
        });
    });

    describe('Overall functionality', function() {
        beforeEach(function() {
            this.instance = new Taggle(this.container);
        });

        afterEach(function() {
            this.instance = null;
        });

        it('should allow for multiple instances to co-exist', function() {
            var container = createContainer(500, 300);
            container.id = 'taggle2';
            document.body.appendChild(container);

            var first = ['these', 'tags', 'should'];
            var firstLength = first.length;
            var second = ['not', 'affect', 'each', 'other'];
            var secondLength = second.length;

            this.instance.add(first);

            var instance = new Taggle(container, {
                tags: second
            });

            instance.remove('other');
            expect(this.instance.getTagValues().length).to.equal(firstLength);
            expect(instance.getTagValues().length).to.equal(secondLength - 1);

            container.parentNode.removeChild(container);
        });

        it('should lowercase tags to be added by default', function() {
            expect(this.instance.getTags().values.length).to.equal(0);
            this.instance.add(['Tag']);
            expect(this.instance.getTags().values[0]).to.equal('tag');
        });

        it('should clear any input when the input element is blurred', function() {
            var input = this.instance.getInput();
            var tag = 'thing';

            expect(this.instance.getTagValues().length).to.equal(0);

            input.focus();
            input.value = tag;
            input.blur();

            expect(this.instance.getTagValues().length).to.equal(0);
        });
    });

    describe('Public API', function() {
        beforeEach(function() {
            this.instance = new Taggle(this.container, {
                tags: ['zero', 'one', 'two', 'three']
            });
        });

        afterEach(function() {
            this.instance = null;
        });

        describe('#getTagValues', function() {
            it('should match length of tags passed in options', function() {
                expect(this.instance.getTagValues().length).to.equal(4);
            });

            it('should return a copy of the tag values', function() {
                var tags = this.instance.getTagValues();
                var tagsLength = tags.length;

                tags.pop();

                expect(this.instance.getTagValues().length).to.equal(tagsLength);
            });

            it('should return values with the tag text and id when attachTagId is true', function() {
                var instance = new Taggle(this.container, {
                    tags: ['zero', 'one', 'two', 'three'],
                    attachTagId: true
                });

                expect(instance.getTagValues()[0].text).to.equal('zero');
                expect(instance.getTagValues()[0].id).to.equal(1);

                expect(instance.getTagValues()[3].text).to.equal('three');
                expect(instance.getTagValues()[3].id).to.equal(4);
            });
        });

        describe('#getTagElements', function() {
            it('should match length of added tags', function() {
                expect(this.instance.getTagElements().length).to.equal(4);
            });
        });

        describe('#getTags', function() {
            it('should return an object with 2 arrays that match getTagValues() and getTagElements()', function() {
                expect(getObjectLength(this.instance.getTags())).to.equal(2);
                expect(this.instance.getTags().values.length).to.equal(4);
                expect(this.instance.getTags().elements.length).to.equal(4);
            });
        });

        describe('#getContainer', function() {
            it('should return original selected DOM element', function() {
                expect(this.instance.getContainer()).to.equal(this.container);
            });
        });

        describe('#getInput', function() {
            it('should return the container\'s text input', function() {
                expect(this.instance.getInput()).to.equal(this.instance.getContainer().querySelector('input[type="text"]'));
            });
        });

        describe('#add', function() {
            it('should add a new tag from a string argument', function() {
                expect(this.instance.getTagElements().length).to.equal(4);
                this.instance.add('four');
                this.instance.add(3);
                this.instance.add(true);
                this.instance.add(false);
                this.instance.add([]);
                this.instance.add([2]);
                this.instance.add('');
                expect(this.instance.getTagElements().length).to.equal(5);
            });

            it('should add new tags from an array of strings', function() {
                expect(this.instance.getTagElements().length).to.equal(4);
                this.instance.add(['four', 'five', 4, true, undefined]);
                this.instance.add(['', Array, false]);
                expect(this.instance.getTagElements().length).to.equal(6);
            });

            it('should add new tags from a comma delimited list', function() {
                expect(this.instance.getTagElements().length).to.equal(4);
                var tags = 'four, five, six, seven';
                var allTags = this.instance.getTagValues().concat(tags.split(','));
                this.instance.add(tags);
                expect(this.instance.getTagElements().length).to.equal(8);

                // Ensure added in same order
                this.instance.getTagValues().forEach(function(tag, i) {
                    expect(tag).to.equal(allTags[i]);
                });
            });

            it('should add new tags from a comma delimited list with specified delimeter', function() {
                var delimeter = '|';
                var instance = new Taggle(this.container, {
                    delimeter: delimeter
                });
                var tags = 'four| five| six| seven';
                var allTags = tags.split(delimeter);
                instance.add(tags);
                expect(instance.getTagElements().length).to.equal(allTags.length);

                // Ensure added in same order
                instance.getTagValues().forEach(function(tag, i) {
                    expect(tag).to.equal(allTags[i]);
                });
            });
        });

        describe('#remove', function() {
            beforeEach(function() {
                this.instance = new Taggle(this.container, {
                    tags: ['zero', 'one', 'two', 'three', 'four', 'three']
                });
            });

            it('should remove the most recent occurance of the tag if it exists', function() {
                expect(this.instance.getTagElements().length).to.equal(6);
                this.instance.remove('four');
                this.instance.remove('five');
                this.instance.remove(3);
                this.instance.remove(false, true);
                this.instance.remove('');
                expect(this.instance.getTagElements().length).to.equal(5);
                expect(this.instance.getTagValues().length).to.equal(5);
                expect(this.instance.getTagValues()[4]).to.equal(this.instance.getTagValues()[3]);
            });

            it('should remove all occurances of a string if the second argument is true', function() {
                expect(this.instance.getTagElements().length).to.equal(6);
                this.instance.remove('three', true);
                this.instance.remove('five', true);
                this.instance.remove(2, true);
                this.instance.remove('', true);
                expect(this.instance.getTagElements().length).to.equal(4);
                expect(this.instance.getTagValues().length).to.equal(4);
                expect(this.instance.getTagValues()[3]).to.equal('four');
            });
        });

        describe('#saveOnBlur', function() {
            beforeEach(function() {
                this.instance = new Taggle(this.container, {
                    saveOnBlur: true
                });
            });

            it('should save remaining text as a tag when input is blurred', function() {
                var input = this.instance.getInput();
                var tag = 'thing';

                expect(this.instance.getTagValues().length).to.equal(0);

                input.focus();
                input.value = tag;
                input.blur();

                expect(this.instance.getTagValues().length).to.equal(1);
                expect(this.instance.getTagValues()[0]).to.equal(tag);
            });

            it('should not prevent the container from losing focus class when input is blurred', function() {
                var input = this.instance.getInput();

                input.focus();

                expect(this.instance.getContainer().classList.contains(this.instance.settings.containerFocusClass)).to.be.true;

                input.blur();

                expect(this.instance.getContainer().classList.contains(this.instance.settings.containerFocusClass)).to.be.false;
            });
        });

        describe('#clearOnBlur', function() {
            it('setting to false should not clear the remaining text when input is blurred', function() {
                var instance = new Taggle(this.container, {
                    clearOnBlur: false
                });
                var input = instance.getInput();
                var tag = 'thing';

                expect(instance.getTagValues().length).to.equal(0);

                input.focus();
                input.value = tag;
                input.blur();

                expect(input.value).to.equal(tag);
            });

            it('setting to true should clear the remaining text when input is blurred', function() {
                var instance = new Taggle(this.container, {
                    clearOnBlur: true
                });
                var input = instance.getInput();
                var tag = 'thing';

                expect(instance.getTagValues().length).to.equal(0);

                input.focus();
                input.value = tag;
                input.blur();

                expect(input.value).to.equal('');
            });

            it('default should clear the remaining text when input is blurred', function() {
                var instance = new Taggle(this.container);
                var input = instance.getInput();
                var tag = 'thing';

                expect(instance.getTagValues().length).to.equal(0);

                input.focus();
                input.value = tag;
                input.blur();

                expect(input.value).to.equal('');
            });
        });

        describe('#setOptions', function() {
            it('should be chainable', function() {
                function chain() {
                    this.instance.setOptions().add('tag');
                }
                expect(chain.bind(this)).to.not.throw();
            });

            it('should set options', function() {
                var initial = this.instance.settings.allowDuplicates;
                var opposite = !initial;

                this.instance.setOptions({
                    allowDuplicates: opposite
                });

                expect(this.instance.settings.allowDuplicates).to.equal(opposite);
            });
        });

        describe('#removeAll', function() {
            beforeEach(function() {
                this.instance = new Taggle(this.container, {
                    tags: ['zero', 'one', 'two', 'three', 'four', 'three']
                });
            });

            it('should remove all existent tags', function() {
                expect(this.instance.getTagElements().length).to.equal(6);
                this.instance.removeAll();
                expect(this.instance.getTagElements().length).to.equal(0);
                expect(this.instance.getTagValues().length).to.equal(0);
            });

            it('should be chainable', function() {
                expect(this.instance.getTagElements().length).to.equal(6);
                this.instance.removeAll().add('tag');
                expect(this.instance.getTagElements().length).to.equal(1);
                expect(this.instance.getTagValues().length).to.equal(1);
            });

            it('should cause the placeholder to reappear', function() {
                this.instance.removeAll();

                expect(this.instance.placeholder.style.opacity).to.equal('1');
            });
        });

        describe('#checkCloseButtonType', function() {
            beforeEach(function() {
                this.instance = new Taggle(this.container, {
                    tags: ['zero', 'one', 'two']
                });
            });

            it('should have type equal to button', function() {
                var elements = this.instance.getTagElements();
                for (var i = 0; i < elements.length; ++i) {
                    var closeButton = elements[i].querySelector('button.close');
                    expect(closeButton).to.have.property('type').and.equal('button');
                }
            });
        });
    });
});
