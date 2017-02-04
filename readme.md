Jotta File System (JFS)for nodejs 
==============

Configure
--------------

Create the file config.json and insert your username and password:

{
    "username": "yourusername",
    "password": "yourpassword" 
}

Syntax
-------------

* Listing account info and devices:

node jsf --account

* Listing content

node jsf --ls <path>

For instance node jsf --ls SomeDevice/Folder/SubFolder/