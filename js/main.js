require.config({
    paths: {
        underscore: 'libs/underscore/underscore',
        JSZip: 'libs/jszip/jszip'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'JSZip': {
            exports: 'JSZip'
        }
    }
});