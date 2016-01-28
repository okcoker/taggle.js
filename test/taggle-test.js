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
            expect(document.activeElement).to.not.equal(this.instance.getInput())

            this.container.click()

            expect(document.activeElement).to.equal(this.instance.getInput())
        });

        it('should not focus the input on container click when focusInputOnContainerClick is false', function() {
            var taggle = new Taggle(this.container, {
                focusInputOnContainerClick: false
            });

            expect(document.activeElement).to.not.equal(taggle.getInput())

            this.container.click()

            expect(document.activeElement).to.not.equal(taggle.getInput())
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

                expect(this.instance.getContainer().classList.contains(this.instance.settings.containerFocusClass)).to.be.true

                input.blur();

                expect(this.instance.getContainer().classList.contains(this.instance.settings.containerFocusClass)).to.be.false
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
        });
    });
});
