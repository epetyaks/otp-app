WEB UI for graphical user management, including OTP QR codes.
Consists of 4 Docker containers:
- freeradius server with google-authenticator PAM module on centOS
- API for making calls to radius server and user database, based on flask-restfull
- MariaDB server with user's and their OTP tokens
- WEB Frontend JS, httpd on centOS

