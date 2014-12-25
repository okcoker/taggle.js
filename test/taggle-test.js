/*global Taggle, it, chai, sinon, before, beforeEach, describe, after, afterEach */
/*jshint expr: true, es5: true, unused: false */
(function() {

    var expect = chai.expect;

    function createContainer(width, height) {
        var container = document.createElement('div');

        container.style.width = width + 'px';
        container.style.height = height + 'px';

        return container;
    }

    function getObjectLength(obj) {
        var len = 0, key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                len += 1;
            }
        }
        return len;
    }

    describe('Taggle', function() {

        beforeEach(function() {
            this.container = createContainer(500, 300);
            this.container.id = 'taggle';
            document.body.appendChild(this.container);
        });

        afterEach(function() {
            this.container.parentNode.removeChild(this.container);
        });

        describe('Initialization', function() {
            it('should exist as a global', function() {
                expect(Taggle).to.exist;
            });
        });

        describe('Options', function() {
            var onTagAddSpy = sinon.spy();
            var onTagRemoveSpy = sinon.spy();

            before(function() {
                this.instance = new Taggle(this.container, {
                    onTagAdd: onTagAddSpy,
                    onTagRemove: onTagRemoveSpy
                });
            });

            it('should disallow duplicate tags to be added by default', function() {
                var taggle = new Taggle(this.container);

                expect(taggle.getTags().values.length).to.equal(0);
                taggle.add(['tag', 'tag']);
                expect(taggle.getTags().values.length).to.equal(1);

            });

            it('should allow duplicate tags to be added when allowDuplicates is true', function() {
                var taggle = new Taggle(this.container, {
                        allowDuplicates: true
                    });

                expect(taggle.getTags().values.length).to.equal(0);
                taggle.add(['tag', 'tag']);
                expect(taggle.getTags().values.length).to.equal(2);

            });

            it('should call onTagAdd() after a tag has been added', function() {
                expect(onTagAddSpy).to.not.have.been.called;
                this.instance.add('one');
                expect(onTagAddSpy).to.have.been.called;
                expect(onTagAddSpy.getCall(0).args[0]).to.not.be.ok;
                expect(onTagAddSpy.getCall(0).args[1]).to.equal('one');
            });

            it('should be call onTagRemove() after a tag has been added', function() {
                expect(onTagRemoveSpy).to.not.have.been.called;
                this.instance.remove('one');
                expect(onTagRemoveSpy).to.have.been.called;
                expect(onTagRemoveSpy.getCall(0).args[0]).to.not.be.ok;
                expect(onTagRemoveSpy.getCall(0).args[1]).to.equal('one');
            });
        });

        describe('Public API', function() {
            beforeEach(function() {
                this.instance = new Taggle(this.container, {
                    tags: ['zero', 'one', 'two', 'three']
                });
            });

            describe('#getTagValues', function() {
                it('should match length of tags passed in options', function() {
                    expect(this.instance.getTagValues().length).to.equal(4);
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
        });
    });

}());
