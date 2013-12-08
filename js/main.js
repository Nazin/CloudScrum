require.config({
    paths: {
        underscore: 'libs/underscore/underscore',
        JSZip: 'libs/jszip/jszip',
        xlsx: 'libs/xlsx/xlsx'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'JSZip': {
            exports: 'JSZip'
        },
        'xlsx': {
            deps: ['JSZip'],
            exports: 'XLSX'
        }
    }
});