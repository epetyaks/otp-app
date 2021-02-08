WEB UI for graphical user management, including OTP QR codes.
This is radius Token server, which can be used standalone or together with other radius servers, like Cisco ISE, as an additional external source of user authentication with one time passwords based on Google Authenticator tokens. Google Authentacator app for mobile devices can be found at App Store or Google Play.
Consists of 4 Docker containers:
- freeradius server with google-authenticator PAM module on centOS7
- API for making calls to radius server and user database, based on flask-restfull
- MariaDB server with user's and their OTP tokens
- WEB Frontend; JS, httpd on centOS7

CentOS7 users can just download setup.sh script and run.
All needed packages will be installed, firewall ports wil be opened.

For every other linux:
install docker, docker-compose for sure.
sudo git clone https://github.com/epetyaks/otp-app.git
make some changes:
0) if you are just for checking stuff, skip step (1)
1) generate new private and public keys for web ui and api
   go to otp-app/otpapp folder, run
   
    openssl req -nodes -new -x509 -keyout ssl/private_key.pem -out ssl/public_cert.pem
    
   also you can use your existant private key(no password!) and certificate files. save private key as private_key.pem, certificate as public_cert.pem
   run some copy commands:
   
    yes | sudo cp -rf ssl/private_key.pem api/ssl/private_key.pem
    
    yes | sudo cp -rf ssl/public_cert.pem api/ssl/publice_cert.pem
    
    yes | sudo cp -rf ssl/private_key.pem front/ssl/private_key.pem
    
    yes | sudo cp -rf ssl/public_cert.pem front/ssl/publice_cert.pem
    
2) go to front/html/script/ folder
   change var serverURI = 'https://10.134.197.50' to your host IP or domain name, like https://example.com or https://1.1.1.1
   web UI and API will point there.
   Also you can change domain name to your domain, this needs for generating user email's with one-time link to get their QR codes.
3) open you linux host ports to access from your network. ports that need to be opened: 443/tcp (web ui), 9443/tcp (api access), 1812/udp, 1813/udp (radius stuff)
4) go back to otpapp folder and run docker-compose up; wait for Docker hosts to come-up.
5) go to https://<your linux host ip>; authenticate with admin/admin. admin password can be changed.

