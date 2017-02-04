Jotta File System (JFS)for nodejs 
==============

Install
--------------

Install nodejs and npm (node package manager).
Download the code, easiest is to use git and simply clone this repository.

    git clone https://github.com/paaland/node-jfs 

Then download the required dependencies:

    npm install 

Configure
--------------

Create the file config.json and insert your username and password:

    {
        "username": "yourusername",
        "password": "yourpassword" 
    }

Syntax
-------------

**Listing account info and devices:**

    node jsf --account

**Listing content**

    node jsf --ls Device/MountPoint/Folder
