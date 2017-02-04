var request = require('request');
var et = require('elementtree');
var  prettyBytes = require('pretty-bytes');

module.exports = {    
    list: function (device) {
        console.log('Name: ' + device.findtext('name'));
        console.log('Type: ' + device.findtext('type'));
        console.log('Size: ' + prettyBytes(parseInt(device.findtext('size'), 10)));
        console.log('');
        console.log('Mount points:');

        var mountPoints = device.findall('mountPoints/mountPoint');

        mountPoints.forEach(function(mp) {
            console.log(mp.findtext('modified') + '\t' + prettyBytes(parseInt(mp.findtext('size'), 10)) + '\t' + mp.findtext('name'));
        }, this);
                
    }
}