var request = require('request');
var fs = require('fs');
var md5 = require('md5');
var querystring = require('querystring');
var dateformat = require('dateformat');
var async = require('async');
const path = require('path');

//For debug, accept self signed ssl 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = {
    uploadFolder: uploadFolder,
    uploadFile: uploadFile
};

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

function uploadFolder (config, remotePath, localFolder) {
    console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': Scanning ' + localFolder);
    var files = getAllFilesInFolder(localFolder);

    console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': Uploading ' + files.length + ' files');

    async.eachLimit(files, 4, function(file, done) {
        var fileName = path.basename(file);
        var folder = path.dirname(file);
        
        //Remove initial path, convert to web url
        folder = folder.replace(localFolder, '');
        folder = folder.replace('\\', '/');
        
        try
        {
            uploadFile(config, remotePath + folder, file, function (err) {
                if (err)
                    done(err);
                else 
                    done();
            });
        } catch (e) {            
            done(e);
        }
    },
    function error(err) {
        console.error(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': ERROR: ' + err);
    });

    // files.forEach(function(file) {
    //     var fileName = path.basename(file);
    //     var folder = path.dirname(file);
        
    //     //Remove initial path, convert to web url
    //     folder = folder.replace(localFolder, '');
    //     folder = folder.replace('\\', '/');
        
    //     this.uploadFile(config, remotePath + folder, file);
    // }, this);
}
    
function uploadFile(config, remotePath, localFile)
{
    var fileName = path.basename(localFile);
    var url = '';
    var stats = fs.statSync(localFile);        
    var md5hash = md5(fs.readFileSync(localFile));
    
    console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': MD5 hash ' + md5hash);        
    url = 'https://jfs.jottacloud.com/jfs/' + config.username + '/' + remotePath + '/' + fileName + '?cphash=' + md5hash;

    var options = {
        url: url,
        headers: {
            'User-Agent': 'node-jfs https://github.com/paaland/node-jfs',
            'JMd5': md5hash,
            'JCreated': stats.ctime,
            'JModified': stats.mtime,
            'JSize': stats.size
        }
    };
        
    console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': Checking if file exists');
    //Check if file with same name, size, md5hash, modified date and created date exists
    request.post(options)
        .auth(config.username, config.password, true)
        .on('error', function(error) {
            //Error means file does not exists, upload file                
            console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') + ': Uploading "' +  localFile + '"');
        });
        
            //     //Change to upload URL
            //     options.url = 'https://up.jottacloud.com/jfs/' + config.username + '/' + remotePath + '/' + fileName + '?umode=nomultipart';
                
            //     //Upload file
            //     fs.createReadStream(localFile)
            //         .pipe(request.post(options))
            //         .auth(config.username, config.password, true)
            //         .on('error', function(error) {
            //             console.error(error)                        
            //         })
            //         .on('response', function(response) {
            //             console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') + ': File "' + localFile + '" uploaded, response ' + response.statusCode);                        
            //         });
            //     })
            // .on('response', function(response) {
            //     if (response.statusCode == '200') {
            //         console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') + ': File "' +  localFile + '" already exists, skipping.');                                       
            //     }
            // });
}
