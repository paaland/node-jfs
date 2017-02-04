var argv = require('yargs').argv;
var jfs  = require('./src/jfs-lib.js');
var config = require('./config.json');

jfs.setConfig(config);

if (argv.account) {
    jfs.getAccount();
}
else if (argv.ls) {
    jfs.list(argv.ls);
}
else
{
    console.log('Usage: ');
    console.log('   jfs --account');
    console.log('   jfs --ls <device>/path');
    console.log('   jfs --get <device>/path/file');
}