var request = require('request');
var et = require('elementtree');
var  prettyBytes = require('pretty-bytes');

var device = require('./device.js');
var mountpoint = require('./mountpoint.js');
var folder = require('./folder.js');

var config = {};

module.exports = {
    setConfig : function (settings) {
        config = settings;
    },
    list: function (path) {
        request.get('https://www.jottacloud.com/jfs/' + config.username + '/' + path, 
            function (error, response, body) {
                if (error) {
                    console.error(error);
                    return;
                }

                var xml = et.parse(body);
                var root = xml.getroot().tag;

                if (root == 'device')
                    device.list(xml);
                else if (root == 'mountPoint')
                    mountpoint.list(xml);
                else if (root == 'folder')
                    folder.list(xml);
                else
                    console.error('Element type ' + root + ' not implemented');

                //console.log(xml);

            }).auth(config.username, config.password, true);
    },
    getAccount : function ()
    {
        request.get('https://www.jottacloud.com/jfs/' + config.username, 
            function (error, response, body) {
                if (error) {
                    console.error(error);
                    return;
                }

                var user = et.parse(body);
                console.log('Username: ' + user.findtext('username'));
                console.log('Account-Type: ' + user.findtext('account-type'));
                console.log('Devices: ');

                var devices = user.findall('devices/device');

                devices.forEach(function(device) {
                    console.log('   Name: ' + device.findtext('name'));
                    console.log('   Type: ' + device.findtext('type'));
                    console.log('   Size: ' + prettyBytes(parseInt(device.findtext('size'), 10)));
                    console.log('');
                });
            }).auth(config.username, config.password, true);
    }
}