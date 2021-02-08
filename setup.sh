#!/bin/bash

while true; do
    read -p "Have you prepeared certificate and private key for frontend and API calls ? Y/N: " yn
    case $yn in
        [Yy]* ) echo "Continueing setup..."; break;;
        [Nn]* ) echo "Please copy your private key in base64 format as private_key.pem and your certificate as public_cert.pem into otpapp/ssl folder before running setup.sh again"; exit;;
        * ) echo "Please answer Yes or No";;
    esac
done
echo "Installing packages..."
sudo yum update -y
sudo yum install git -y
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine -y
sudo yum install yum-utils -y
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo -y
sudo yum-config-manager --enable docker-ce-nightly -y
sudo yum install docker-ce docker-ce-cli containerd.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo yum install epel-release -y
sudo yum install python36 -y
sudo yum install python3-pip -y
sudo -H pip3 install --upgrade pip
sudo pip3 install docker-compose
echo "Opening firewall-ports..."
sudo firewall-cmd --add-port=9443/tcp --permanent
sudo firewall-cmd --add-port=1812/udp --permanent
sudo firewall-cmd --add-port=1813/udp --permanent
sudo firewall-cmd --add-port=443/tcp --permanent
sudo firewall-cmd --add-port=9443/tcp
sudo firewall-cmd --add-port=1812/udp
sudo firewall-cmd --add-port=1813/udp
sudo firewall-cmd --add-port=443/tcp
echo "Getting project files..."
sudo git clone https://github.com/epetyaks/otp-app.git
while true; do
    read -p "Do you want to generate Self-signed certificates for frontend and API calls ? Y/N: " yn
    case $yn in
        [Yy]* ) sudo openssl req -nodes -new -x509 -keyout otpapp/ssl/private_key.pem -out otpapp/ssl/public_cert.pem; break;;
        [Nn]* ) echo "Using default certificates..."; break;;
        * ) echo "Please answer Yes or No";;
    esac
done
echo "Copying certificate and key files..."
sudo chmod 755 otpapp/ssl/private_key.pem
sudo chmod 755 otpapp/ssl/publice_cert.pem
yes | sudo cp -rf otpapp/ssl/private_key.pem otpapp/api/ssl/private_key.pem
yes | sudo cp -rf otpapp/ssl/public_cert.pem otpapp/api/ssl/publice_cert.pem
yes | sudo cp -rf otpapp/ssl/private_key.pem otpapp/front/ssl/private_key.pem
yes | sudo cp -rf otpapp/ssl/public_cert.pem otpapp/front/ssl/publice_cert.pem
cd otpapp
read -p "Enter server address strictly as https://<host ip address> or https://<host domain name> for exapmle https://10.10.10.10 : " addrf
sed -i~ -e "s@var serverURI.*@var serverURI = ${addrf}@" front/html/script/vars.js
echo "If you did mistake in URL, please go to front/html/script/vars.js and change address appropriately"
sudo docker-compose up
;
























