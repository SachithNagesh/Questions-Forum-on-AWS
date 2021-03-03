#!/bin/bash
cp /home/ubuntu/.env /home/ubuntu/webapp
cd /home/ubuntu/webapp
sudo npm install n -g
sudo n stable
sudo npm install