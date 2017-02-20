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
            jfsdb.run("CREATE TABLE jottafiles (filepath TEXT, md5hash TEXT, size INTERGER, modified INTEGER)");
            jfsdb.run("CREATE INDEX ix_jottafiles ON jottafiles (filepath)");
        });
     }
}

function isFileUploaded(filepath, callback) {

    jfsdb.serialize(function() {
        var stmt = jfsdb.prepare("select * from jottafiles where filepath=?");
        
        stmt.all(filepath, function(err, rows) {
            var exists = false;
            
            if (rows)
                rows.forEach(function (row) {
                    if (row) {
                        var stats = fs.statSync(filepath);        
                        var size = stats.size;
                        var modified = stats.mtime.getTime();
                        // console.log("size: db=" +  row.size + ", file=" + size);
                        // console.log("mod: db=" +  row.modified + ", file=" + modified);
                        // console.log("md5: db=" +  row.md5hash + ", file=" + md5hash);
                        // console.log("quick: " + quick);

                        if (row.size == size && row.modified == modified) // && (quick || row.md5hash === md5hash))
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

        var stats = fs.statSync(filepath);        

        var size = stats.size;
        var modified = stats.mtime;

        var insstmt = jfsdb.prepare("insert into jottafiles values(?,?,?,?)");
        insstmt.run(filepath, md5hash, size, modified);
        insstmt.finalize();                
    });
} 
