#!/bin/bash

rm -f /var/www/asdap.net/.htaccess
# PROJ_NAME="cd-shell"
cd /var/www/asdap.net/
# git config --global --add safe.directory /var/www/asdap.net/
git reset --hard
git pull
# sudo chown -R www-data /var/www/$PROJ_NAME.asdap.africa/
cp /home/ubuntu/.htaccess /var/www/asdap.net/
chmod 644 /var/www/asdap.net/.htaccess
