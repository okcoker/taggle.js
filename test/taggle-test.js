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

        it('should exist as a global', function() {
            expect(Taggle).to.exist;
        });

        describe('Initial values', function() {
            it('should throw if no container is supplied', function() {
                expect(function() {
                    new Taggle();
                }).to.throw();
            });
        });

        describe('Option callbacks', function() {

        });

        describe('Methods', function() {
            before(function() {
                this.instance = new Taggle(this.container, {
                    tags: ['zero', 'one', 'two', 'three']
                });
            });

            it('getTagValues() length should match passed tag array length', function() {
                expect(this.instance.getTagValues().length).to.equal(4);
            });

            it('getTagElements() length should match passed tag array length', function() {
                expect(this.instance.getTagElements().length).to.equal(4);
            });

            it('getTags() should return an object with 2 arrays that match getTagValues() and getTagElements()', function() {
                expect(getObjectLength(this.instance.getTags())).to.equal(2);
                expect(this.instance.getTags().values.length).to.equal(4);
                expect(this.instance.getTags().elements.length).to.equal(4);
            });

            it('getContainer() should return original selected DOM element', function() {
                expect(this.instance.getContainer().id).to.equal(this.container.id);
            });

            it('getInput() should return the container\'s text input', function() {
                expect(this.instance.getInput()).to.equal(this.instance.getContainer().querySelector('input[type="text"]'));
            });
        });
    });

}());
