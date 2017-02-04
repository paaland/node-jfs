var argv = require('yargs').argv;
var jfs  = require('./src/jfs-lib.js');
var config = require('./config.json');

jfs.setConfig(config);

if (argv.ls) {
    if (argv.ls == true) {
        jfs.listDevices();
    }
    else {
        jfs.list(argv.ls);
    }
} else if (argv.put && argv.file) {
    jfs.putFile(argv.put, argv.file);
} else {
    console.log('Usage: ');
    console.log('   jfs --ls <device>/path');
    console.log('   jfs --get <device>/path/file');
    console.log('   jfs --put <device>/path/file --file <localfile>');
}