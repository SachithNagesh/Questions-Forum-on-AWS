#!/bin/bash
cd /home/ubuntu/webapp
sudo npm i -g npx
sudo npm install pm2 -g
npx sequelize-cli db:migrate
pm2 stop ./bin/www
aws logs delete-log-group --log-group-name my-logs
pm2 start ./bin/www
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl     -a fetch-config     -m ec2     -c file:/home/ubuntu/webapp/amazon-cloudwatch-agent.json     -s
pm2 startup
sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo mkdir -p /etc/systemd/system/pm2-ubuntu.service.d
sudo touch /etc/systemd/system/pm2-ubuntu.service.d/10_auto_restart_pm2.conf
sudo echo "[Service]" >> /etc/systemd/system/pm2-ubuntu.service.d/10_auto_restart_pm2.conf
sudo echo "Restart=always" >> /etc/systemd/system/pm2-ubuntu.service.d/10_auto_restart_pm2.conf
sudo echo "RestartSec=3" >> /etc/systemd/system/pm2-ubuntu.service.d/10_auto_restart_pm2.conf
sudo systemctl daemon-reload
pm2 save 