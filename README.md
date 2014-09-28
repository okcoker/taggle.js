Taggle.js
=========

Form-ready dependency-less tagging.


## How it works

Taggle.js allows you to create tag fields within your forms, to allow for easy and optionally restricted, input from your users.

![](https://cloud.githubusercontent.com/assets/1030830/4432876/e5dbccd0-46b0-11e4-99cb-2578f4762256.gif)

Each tag contains an hidden input with a configurable name of `taggles[]` by default so when taggle is inserted in a form, your server can easily read each item and continue accordingly. Taggle is highly customizable with your own css, or you can optionally use the included assets to start your own project.

![](https://cloud.githubusercontent.com/assets/1030830/4432907/e001b336-46b2-11e4-966e-12b0648386c8.gif)

Taggle.js also contains a simple API for you to easily hook in to your favorite autocomplete libraries.


[How-To Demo](http://sean.is/poppin/tags/)


## Support for older IE

Taggle.js comes with optional polyfills in order to add support for IE8 and IE9. If you want to support IE8, add the scripts on your page in this order:

### IE8 Support
- taggle-ie8.js
- taggle-ie9.js
- taggle.js

or optionally the compressed taggle-ie8.min.js

### IE9 Support
- taggle-ie9.js
- taggle.js

or optionally the compressed taggle-ie9.min.js


## License

MIT © [Sean Coker](https://twitter.com/okcoker)
