#!/bin/bash

cd /var/www/cd-shell.asdap.africa/public_html/
# git config --global --add safe.directory /var/www/cd-user.asdap.africa/public_html
# git reset --hard
sudo git pull
sudo chown -R www-data /var/www/cd-shell.asdap.africa/
