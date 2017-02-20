var argv = require('yargs').argv;
var jfs  = require('./src/jfs-lib.js');
var config = require('./config.json');
var dateformat = require('dateformat');

console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': JFS client started');

jfs.setConfig(config);

console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': Loaded config.json');

if (argv.ls) {
    if (argv.ls == true) {
        jfs.listDevices();
    }
    else {
        jfs.list(argv.ls);
    }
} else if (argv.put && argv.file) {
    jfs.putFile(argv.put, argv.file);
} else if (argv.put && argv.folder) {
    jfs.putFolder(argv.put, argv.folder, argv.ignore);
} else {
    console.log('Usage: ');
    console.log('   jfs --ls <device>/path');
    console.log('   jfs --get <device>/path/file');
    console.log('   jfs --put <device>/path/file --file <localfile>');
    console.log('   jfs --put <device>/path/file --folder <localfolder> --ignore pattern');
}