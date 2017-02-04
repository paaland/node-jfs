var request = require('request');
var et = require('elementtree');
var  prettyBytes = require('pretty-bytes');

module.exports = {    
    list: function (mountPoint) {
        console.log('Name: ' + mountPoint.findtext('name'));
        console.log('Size: ' + prettyBytes(parseInt(mountPoint.findtext('size'), 10)));
        console.log('');

        var folders = mountPoint.findall('folders/folder');

        folders.forEach(function(folder) {
            console.log('<DIR>' + '\t' + folder.get('name'));
        }, this);

        var files = mountPoint.findall('files/file');

        files.forEach(function(file) {
            var currentRevision = file.find('currentRevision');
            console.log(currentRevision.findtext('modified') + '\t' + prettyBytes(parseInt(currentRevision.findtext('size'), 10)) + '\t' + file.get('name'));
        }, this);

                   
    }
}