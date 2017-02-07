var request = require('request');
var et = require('elementtree');
var fs = require('fs');
var prettyBytes = require('pretty-bytes');
var device = require('./device.js');
var mountpoint = require('./mountpoint.js');
var folder = require('./folder.js');
var uploader = require('./jfsuploader.js');

var config = {};

module.exports = {
    setConfig : function (settings) {
        config = settings;
    },
    list: list,
    listDevices: listDevices,
    getFile: getFile,
    putFile: putFile,
    putFolder: putFolder
}

function putFolder(remotePath, localFolder) {
    uploader.uploadFolder(config, remotePath, localFolder);
}

function putFile (remotePath, localFile) {
    uploader.uploadFile(config, remotePath, localFile);
}

function getFile(path) {
    var url = 'https://down.jottacloud.com/jfs/' + config.username + '/' + encodeURI(path) + '?mode=bin';
    var target = path.substring(path.lastIndexOf('/')+1).replace(/((\?|#).*)?$/,'');
    
    console.log('Downloading: ' + path);
    console.log('Saving to: ' + target);

    var options = {
        url: url,
        headers: {
            'User-Agent': 'node-jfs https://github.com/paaland/node-jfs'
        }
    };

    request
        .get(options)
        .auth(config.username, config.password, true)
        .on('error', function(err) {
            console.error(err)
        })
        .on('response', function(response) {
            console.log(response.statusCode) // 200
        })
        .pipe(fs.createWriteStream(target));
}

function listDevices () {
    var url = 'https://www.jottacloud.com/jfs/' + config.username;
    var options = {
        url: url,
        headers: {
            'User-Agent': 'node-jfs https://github.com/paaland/node-jfs'
        }
    };

    request.get(options, 
        function (error, response, body) {
            if (error) {
                console.error(error);
                return;
            }

            var user = et.parse(body);
            var devices = user.findall('devices/device');

            console.log('\n' + minLength('Type', 12) + '\t' + minLength('Size', 10) + '\tName');
            devices.forEach(function(device) {
                console.log(minLength(device.findtext('type'),12) + '\t' + minLength(prettyBytes(parseInt(device.findtext('size'), 10)), 10) + '\t' + device.findtext('name'));
            });
        }).auth(config.username, config.password, true);
}

function list(path) {
    var url = 'https://www.jottacloud.com/jfs/' + config.username + '/' + encodeURI(path);
    var options = {
        url: url,
        headers: {
            'User-Agent': 'node-jfs https://github.com/paaland/node-jfs'
        }
    };

    request.get(options, 
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
}

function minLength(text, minLen) {
    while (text.length < minLen)
    {
        text = text + ' ';
    }

    return text;
}
