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
            jfsdb.run("CREATE INDEX ix_jottafiles ON jottafiles (filepath)");
        });
     }
}

function isFileUploaded(filepath, md5hash, callback) {
    jfsdb.serialize(function() {
        var stmt = jfsdb.prepare("select * from jottafiles where filepath=?");
        
        stmt.all(filepath, function(err, rows) {
            var exists = false;
            
            if (rows)
                rows.forEach(function (row) {
                    if (row && row.md5hash === md5hash) {
                        exists = true;
                    }
                });

            callback(exists);
        });

        stmt.finalize();
    });
} 

function addUploadedFile(filepath, md5hash) {
    jfsdb.serialize(function() {
        var stmt = jfsdb.prepare("select * from jottafiles where filepath=?");

        stmt.all(filepath, function(err, row) {
            if (row !== undefined) {
                if (row.md5hash != md5hash) {
                    var delstmt = jfsdb.prepare("delete from jottafiles where filepath=?");
                    delstmt.run(filepath);
                    delstmt.finalize();
                }
            }             
        });

        stmt.finalize();        

        var insstmt = jfsdb.prepare("insert into jottafiles values(?,?)");
        insstmt.run(filepath, md5hash);
        insstmt.finalize();                
    });
} 
