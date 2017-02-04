var request = require('request');
var et = require('elementtree');
var fs = require('fs');
var prettyBytes = require('pretty-bytes');
var device = require('./device.js');
var mountpoint = require('./mountpoint.js');
var folder = require('./folder.js');
var querystring = require('querystring');
var md5 = require('md5');

var config = {};

function minLength(text, minLen) {
    while (text.length < minLen)
    {
        text = text + ' ';
    }

    return text;
}

module.exports = {
    setConfig : function (settings) {
        config = settings;
    },
    list: function (path) {
        var url = 'https://www.jottacloud.com/jfs/' + config.username + '/' + path;
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
    },
    
    listDevices : function ()
    {
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

                console.log(minLength('Type', 12) + '\t' + minLength('Size', 10) + '\tName');
                devices.forEach(function(device) {
                    console.log(minLength(device.findtext('type'),12) + '\t' + minLength(prettyBytes(parseInt(device.findtext('size'), 10)), 10) + '\t' + device.findtext('name'));
                });
            }).auth(config.username, config.password, true);
    },

    getFile : function (path) {
        var url = 'https://down.jottacloud.com/jfs/' + config.username + '/' + querystring.escape(path) + '?revision=1&mode=bin';
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
    },
    
    putFile: function (remotePath, localFile) {
        var target = localFile.substring(localFile.lastIndexOf('/')+1).replace(/((\?|#).*)?$/,'');        
        var url = 'https://up.jottacloud.com/jfs/' + config.username + '/' + remotePath + '/' + target + '?umode=nomultipart';

        var stats = fs.statSync(localFile);
        fs.readFile(localFile, function(err, buf) {
            
            console.log('Uploading ' + target + ' ' + buf.length + ' bytes');

            var md5hash = md5(buf);
       
            var options = {
                url: url,
                headers: {
                    'User-Agent': 'node-jfs https://github.com/paaland/node-jfs',
                    'JMd5': md5hash,
                    'JCreated': stats.ctime,
                    'JModified': stats.mtime,
                    'JSize': buf.length
                }
            };

            fs.createReadStream(localFile)
                .pipe(request.post(options))
                .auth(config.username, config.password, true)
                .on('error', function(err) {
                    console.error(err)
                })
                .on('response', function(response) {
                    console.log(response.statusCode) // 200
                });
        });
    }
}