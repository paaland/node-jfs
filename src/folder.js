var request = require('request');
var et = require('elementtree');
var  prettyBytes = require('pretty-bytes');

module.exports = {    
    list: function (folder) {
        console.log('Listing files in folder');
        var files = folder.findall('files/file');

        files.forEach(function(file) {
            var currentRevision = file.find('currentRevision');
            console.log(currentRevision.findtext('modified') + '\t' + prettyBytes(parseInt(currentRevision.findtext('size'), 10)) + '\t' + file.get('name'));
        }, this);
                
    }
}