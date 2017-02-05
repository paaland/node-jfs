var request = require('request');
var fs = require('fs');
var md5 = require('md5');
var querystring = require('querystring');
var dateformat = require('dateformat');
const path = require('path');

function getAllFilesInFolder(dir) {

    var results = [];

    fs.readdirSync(dir).forEach(function(file) {
        file = dir + path.sep + file;
        var stat = undefined;;
        try
        {
            stat = fs.statSync(file);
        } catch (e)
        {
            stat = undefined;
        }
        if (stat) {
            if (stat.isDirectory()) 
                results = results.concat(getAllFilesInFolder(file))
            else 
                results.push(file);
        } 
    });

    return results;
};

module.exports = {
    uploadFolder: function (config, remotePath, localFolder) {
        console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': Scanning ' + localFolder);
        var files = getAllFilesInFolder(localFolder);

        files.forEach(function(file) {
            var fileName = path.basename(file);
            var folder = path.dirname(file);
            
            //Remove initial path, convert to web url
            folder = folder.replace(localFolder, '');
            folder = folder.replace('\\', '/');
            
            // console.log('fileName: ' + fileName);
            // console.log('folder: ' + folder);
            // console.log('remotePath: ' + remotePath + folder);
            // console.log('');

            this.uploadFile(config, remotePath + folder, file);
        }, this);
    },
    uploadFile: function (config, remotePath, localFile)
    {
        var fileName = path.basename(localFile);
        var url = '';
        var stats = fs.statSync(localFile);
        var options = {};

        fs.readFile(localFile, function(err, buf) {
            var md5hash = md5(buf);
            url = 'https://jfs.jottacloud.com/jfs/' + config.username + '/' + remotePath + '/' + fileName + '?cphash=' + md5hash;
            options = {
                url: url,
                headers: {
                    'User-Agent': 'node-jfs https://github.com/paaland/node-jfs',
                    'JMd5': md5hash,
                    'JCreated': stats.ctime,
                    'JModified': stats.mtime,
                    'JSize': buf.length
                }
            };
            
            //Check if file with same name, size, md5hash, modified date and created date exists
            request.post(options)
                .auth(config.username, config.password, true)
                .on('error', function(err) {
                    //Error means file does not exists, upload file
                    //Change to upload URL
                    options.url = 'https://up.jottacloud.com/jfs/' + config.username + '/' + remotePath + '/' + fileName + '?umode=nomultipart';
                    
                    //Upload file
                    fs.createReadStream(localFile)
                        .pipe(request.post(options))
                        .auth(config.username, config.password, true)
                        .on('error', function(err) {
                            console.error(err)
                        })
                        .on('response', function(response) {
                            console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') + ': File "' + localFile + '" uploaded, response ' + response.statusCode);
                        });
                 })
                .on('response', function(response) {
                    if (response.statusCode == '200') {
                        console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') + ': File "' +  localFile + '" already exists, skipping.');
                    }
                });
        });
    }
};