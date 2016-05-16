Taggle [![Build Status](https://travis-ci.org/okcoker/taggle.js.svg?branch=master)](https://travis-ci.org/okcoker/taggle.js) [![Coverage Status](https://img.shields.io/coveralls/okcoker/taggle.js.svg)](https://coveralls.io/r/okcoker/taggle.js)
=========

Form-ready dependency-less tagging.

## Install

NPM:

    npm install taggle --save

Bower:

    bower install taggle --save


## How it works

Taggle allows you to create tag fields within your forms, to allow for easy and optionally restricted, input from your users.

![](https://cloud.githubusercontent.com/assets/1030830/4432876/e5dbccd0-46b0-11e4-99cb-2578f4762256.gif)

Each tag contains an hidden input with a configurable name of `taggles[]` by default so when taggle is inserted in a form, your server can easily read each item and continue accordingly. Taggle is highly customizable with your own css, or you can optionally use the included assets to start your own project.

![](https://cloud.githubusercontent.com/assets/1030830/4432907/e001b336-46b2-11e4-966e-12b0648386c8.gif)

Taggle also contains a simple API for you to easily hook in to your favorite autocomplete libraries.


[How-To Demo](http://sean.is/poppin/tags/)


## Support for older IE

Taggle comes with optional polyfills in order to add support for IE8 and IE9. If you want to support IE8, add the scripts on your page in this order:

### IE8 Support
- taggle-ie8.js
- taggle-ie9.js
- taggle.js

### IE9 Support
- taggle-ie9.js
- taggle.js

### Building minified version

After cloning the repo you can build minified versions of the library by:

- npm install
- grunt build


## License

MIT © [Sean Coker](https://twitter.com/okcoker)
