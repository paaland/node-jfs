var dbFile = 'jottafiles.db';
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var jfsdb = new sqlite3.Database(dbFile);

module.exports = {    
    isFileUploaded: isFileUploaded,
    addUploadedFile: addUploadedFile
};

function isFileUploaded(filepath, md5hash) {
    var create = false;
    var exists = false;

    if (!fs.existsSync(dbFile)) {
        create = true;
    }
    
    return jfsdb.serialize(function() {
        if(create) {
            jfsdb.run("CREATE TABLE jottafiles (filepath TEXT, md5hash TEXT)");
        }

        return jfsdb.each("SELECT * from jottafiles where filepath='" + filepath + "'", function(err, row) {
            if (row && row.md5hash === md5hash) {
                return true;
            }
            return false;
        });
    });
} 

function addUploadedFile(filepath, md5hash) {
    var create = false;
    if (!fs.existsSync(dbFile)) {
        create = true;
    }

    jfsdb.serialize(function() {
        if(create) {
            jfsdb.run("CREATE TABLE jottafiles (filepath TEXT, md5hash TEXT)");
        }

        jfsdb.each("SELECT * from jottafiles where filepath='" + filepath + "'", function(err, row) {
            if (row) {
                if (row.md5hash != md5hash) {
                    jfsdb.run("UPDATE jottafiles SET md5hash='" + md5hash + "' where filepath='" + filepath + "'");
                }
            } else {
                jfsdb.run("insert into jottafiles(filepath, md5hash) values ('" + filepath + "', '" + md5hash + "')");
            }
        });
    });

} 
