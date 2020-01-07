/* eslint-env node */
'use strict';

module.exports = {
    plugins: [
        require('autoprefixer')(),
        // https://github.com/ben-eb/gulp-cssnano/issues/33#issuecomment-210518957
        require('cssnano')({
            zindex: false,
            autoprefixer: false,
            reduceIdents: false,
            discardUnused: false
        })
    ]
};
