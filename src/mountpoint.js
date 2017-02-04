var request = require('request');
var et = require('elementtree');
var  prettyBytes = require('pretty-bytes');

module.exports = {    
    list: function (mountPoint) {        
        var folders = mountPoint.findall('folders/folder');

        folders.forEach(function(folder) {
            if (!folder.get('deleted'))
                console.log('<DIR>' + '\t' + folder.get('name'));
        }, this);

        var files = mountPoint.findall('files/file');

        files.forEach(function(file) {
            if (!file.get('deleted')) {
                var currentRevision = file.find('currentRevision');
                if (currentRevision)
                    console.log(currentRevision.findtext('modified') + '\t' + prettyBytes(parseInt(currentRevision.findtext('size'), 10)) + '\t' + file.get('name'));
            }
        }, this);

                   
    }
}