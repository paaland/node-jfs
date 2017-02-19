var dbFile = 'jottafiles.db';
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var jfsdb = new sqlite3.Database(dbFile);

module.exports = {    
    isFileUploaded: isFileUploaded,
    addUploadedFile: addUploadedFile,
    createDB: createDB
};

function createDB() {
    if (!fs.existsSync(dbFile)) {
        jfsdb.serialize(function() {
            jfsdb.run("CREATE TABLE jottafiles (filepath TEXT, md5hash TEXT)");
        });
     }
}

function isFileUploaded(filepath, md5hash, callback) {
    jfsdb.serialize(function() {
        jfsdb.all("select * from jottafiles where filepath='" + filepath + "'", function(err, rows) {
            var exists = false;
            
            if (rows)
                rows.forEach(function (row) {
                    if (row && row.md5hash === md5hash) {
                        exists = true;
                    }
                });
            callback(exists);
        });
    });
} 

function addUploadedFile(filepath, md5hash) {
    jfsdb.serialize(function() {
        jfsdb.each("SELECT * from jottafiles WHERE filepath='" + filepath + "'", function(err, row) {
            if (row !== undefined) {
                if (row.md5hash != md5hash) {
                    jfsdb.run("DELETE FROM jottafiles WHERE filepath='" + filepath + "'");
                }
            }             
        });

        jfsdb.run("insert into jottafiles values ('" + filepath + "', '" + md5hash + "')");
    });
} 
