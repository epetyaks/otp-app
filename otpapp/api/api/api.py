from flask import Flask, request
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import exists
import paramiko
import pymysql
import json
import re
import datetime
import jwt
import functools

# Variables
baseURI = '/api/v1/'
QRCodePath = ''
QRCodeURI = ''

with open('vars.json', 'r') as f:
    vars = json.load(f)
linuxGroup = vars['linuxGroup']
linuxIP = vars['linuxIP']
linuxCred = vars['linuxCred']
DBIP = vars['DBIP']
DBCreds = vars['DBCreds']
DBName = vars['DBName']
usersPerPage = vars['usersPerPage']



app = Flask(__name__)
CORS(app)
app.config['TOKEN_EXPIRE_HOURS'] = 1
app.config['KEY'] = 'token'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://{0}:{1}@{2}/{3}'.format(DBCreds['user'],
                                                                                 DBCreds['password'],
                                                                                 DBIP, DBName)
api = Api(app)
db = SQLAlchemy(app)

def login_required(method):
    @functools.wraps(method)
    def wrapper(self):
        header = request.headers.get('Authorization')
        try:
            _, token = header.split()
        except:
            return 'No Token provided.', 400
        try:
            decoded = jwt.decode(token, app.config['KEY'], algorithms='HS256')
        except jwt.DecodeError:
            return 'Token is not valid.', 400
        except jwt.ExpiredSignatureError:
            return 'Token is expired.', 400
        return method(self)
    return wrapper

class userDBTable(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}
    username = db.Column(db.String(255), primary_key=True, unique=True, nullable=False)
    md5pass = db.Column(db.String(255), nullable=False)
    enabled = db.Column(db.Boolean(), nullable=False)
    qrlink = db.Column(db.String(255))
    email = db.Column(db.String(255))
    qrviewed = db.Column(db.Boolean(), nullable=False)
    def __repr__(self):
        return "<{}:{}>".format(self.username,  self.enabled)

    def userexist(user):
        return db.session.query(exists().where(userDBTable.username == user)).scalar()

class getUserQR(Resource):
	# URL for user to get OTP token. Works without authentication only once. 
	# DB user column 'qrviewed: true/false' allows or denies user to get his QR code
	# after first GET 'qrviewed' resets to true
	# API GET ?username=var1
	def get(self):
		parser = reqparse.RequestParser()
		parser.add_argument('username', type=str)
		uname = parser.parse_args()['username']
		if uname == 'null':
			return 'No username provided', 400
		try:
			if not userDBTable.userexist(uname):
				return 'User {0} is not found.'.format(uname), 400
			viewed = db.session.query(userDBTable).filter(userDBTable.username.contains(uname)).all()[0].qrviewed
			if not viewed:
				qrlink = db.session.query(userDBTable).filter(userDBTable.username.contains(uname)).all()[0].qrlink
				db.session.query(userDBTable).filter(userDBTable.username == uname).update({'qrviewed': True})
				db.session.commit()
				return {'qrlink':qrlink}, 200
			else:
				return 'Sorry, QR code provided only once. Contact your manager', 400
		except:
			return 'Can not connect to Database', 400


class getToken(Resource):
    # Authenticates admin user with password from DB
    # curl -X POST -H "Content-Type: application/json" -d '{"password":"xxxxxx"}' http://<api url>/api/v1/getToken
    # returns token for API authorization
    # API shold be called with additional header curl -H "Authorization: Bearer <token> -X GET/POST ..."
    def post(self):
        try:
            password = request.json['password']
        except:
            return 'No valid json data provided', 400
        try:
            if not userDBTable.userexist('admin'):
                return 'User is not found.', 400
            psw = db.session.query(userDBTable).filter(userDBTable.username.contains('admin')).all()[0].md5pass
            if not check_password_hash(psw, password):
                return 'Password is incorrect.', 400
            exp = datetime.datetime.utcnow() + datetime.timedelta(hours=app.config['TOKEN_EXPIRE_HOURS'])
            encoded = jwt.encode({'username': 'admin', 'exp': exp}, app.config['KEY'], algorithm='HS256')
            return {'token': encoded.decode('utf-8')}, 200
        except:
            return 'Can not conect to Database', 400



class NADAction(Resource):

    @login_required
    def get(self):
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(linuxIP, username=linuxCred['user'], password=linuxCred['password'], look_for_keys=False)
            cmd = "sed '0,/^####OTPAUTHCLIENTS$/d' /etc/raddb/clients.conf"
            stdin, stdout, stderr = client.exec_command(cmd)
            stdout = stdout.readlines()
            client.close()
            return {'output':stdout}, 200
        except:
            return 'Can not connect to Linux host', 500



    @login_required
    def put(self):
        # sed -i '1,/####OTPAUTHCLIENTS/!d' /etc/raddb/clients.conf
        # sed '/^####OTPAUTHCLIENTS$/r'<(
        # echo 'client tgc1ISE03 {'
        # echo '        ipaddr = 172.20.19.160'
        # echo '        secret = tgc2ISE'
        # echo '}') -i -- /etc/raddb/clients.conf
        #
        try:
            dt = request.json['nad']
            ds = "sed -i '1,/####OTPAUTHCLIENTS/!d' /etc/raddb/clients.conf; "
            ds = ds + "sed '/^####OTPAUTHCLIENTS$/r'<(\n"
            cmd = ds+''.join(["echo '"+d+"'\n" for d in dt.split('\n')])+") -i -- /etc/raddb/clients.conf"
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(linuxIP, username=linuxCred['user'], password=linuxCred['password'], look_for_keys=False)
            stdin, stdout, stderr = client.exec_command(cmd)
            stdout = stdout.readlines()
            client.close()
            return {'output':'Ok'}, 200
        except:
            return 'Can not connect to Linux host', 500
        
        return cmd, 200
        



class ChangeAdminPassword(Resource):
    # Changes admin password
    # API usage: curl -X put -H "Content-Type: application/json" -H "Authorization: Bearer <token>"
    #                        -d '{"oldpass":"<oldpassword>", "newpass":"<newpassword>"}' 'http://<api url>/changePsw'

    @login_required
    def put(self):
        try:
            oldpass = request.json['oldpass']
            newpass = request.json['newpass']
            newpass = generate_password_hash(newpass)
        except:
            return 'No valid json data provided'
        if not userDBTable.userexist('admin'):
            return 'User is not found.', 400
        
        try:
        	psw = db.session.query(userDBTable).filter(userDBTable.username.contains('admin')).all()[0].md5pass
        	if not check_password_hash(psw, oldpass):
        		return 'Old password invalid ', 400
        	else:
        		db.session.query(userDBTable).filter(userDBTable.username == 'admin').update({'md5pass': newpass})
        		db.session.commit()
        except:
            return 'Can not connect to DB host', 500

        return 'admin password changed', 200
    
class Hello(Resource):
	# For external requests to check Token validity
	@login_required
	def get(self):
		return 'Ok', 200

class CreateTable(Resource):
    # Connects to external MariaDB database and creates table 'users'
    # API GET - checks if table exist
    # API POST - creates table; does nothing if table exists
    @login_required
    def get(self):
        if db.engine.has_table('users'):
            return {'table':'exist'}, 200
        else:
            return {'table':'not exist'}, 202
        
    @login_required
    def post(self):
        db.create_all()
        return {'table':'users'}, 201

class GetUsersNumber(Resource):
    # Connects to external MariaDB database and retrieves number of entries and additional info for pagination
    @login_required
    def get(self):
        try:
            usnum = db.session.query(userDBTable).count() - 1
            pages = usnum//usersPerPage + 1
            uslastpage = usnum%usersPerPage
            return {'users':usnum, 'usersperpage':usersPerPage, 'pages':pages, 'usersleft':uslastpage}, 200
        except:
            return 'Can not connect to Database', 400

class GetUsersNumberPattern(Resource):
    # Connects to external MariaDB database and retrieves number of entries containing username pattern
    # and additional info for pagination
    # parameters ?username=val1
    @login_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str)
        uname = parser.parse_args()['username']
        if not uname:
            return 'No parameters specified', 400
        try:
            usnum = db.session.query(userDBTable).filter(userDBTable.username.contains(uname)).count() - 1
            pages = usnum//usersPerPage + 1
            uslastpage = usnum%usersPerPage
            return {'users':usnum, 'usersperpage':usersPerPage, 'pages':pages, 'usersleft':uslastpage}, 200
        except:
            return 'Can not connect to Database', 400


class GetUsers(Resource):
    # Connects to external MariaDB database and retrieves username fields as dictionary
    # keyword 'all' returns all users
    # keyword 'contains' returns usernames containing characters
    # API GET; parameters ?user=val1 -> returns users with val1 string in username;
    # parameters ?username=val1&limit=n&offset=m -> returns n users starting from m's user matching val1
    # ?all=true -> returns all users; ?all=true&limit=n&offset=m -> returns n users starting from m's user
    @login_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('all', type=bool)
        parser.add_argument('username', type=str)
        parser.add_argument('limit', type=int)
        parser.add_argument('offset', type=int)
        args = parser.parse_args()
        
        if ( not args['all'] and args['username']):
            if (args['limit'] and args['offset']):
                query = db.session.query(userDBTable).filter((userDBTable.username.contains(args['username'])) & (userDBTable.username != 'admin')).all()[args['offset']:(args['limit']+args['offset'])]
            else:
                query = db.session.query(userDBTable).filter((userDBTable.username.contains(args['username'])) & (userDBTable.username != 'admin')).all()
                
            reslt = [{'username':q.username, 'md5pass':q.md5pass,
                     'enabled':q.enabled, 'email':q.email, 'qrlink':q.qrlink} for q in query]
            if len(reslt) == 0:
            	return 'No users found', 400
            else:
            	return reslt, 200
        
        elif ( args['all'] and not args['username']):
            if (args['limit'] and args['offset']):
                query = db.session.query(userDBTable).filter(userDBTable.username != 'admin').all()[args['offset']:(args['limit']+args['offset'])]
            else:
                query = db.session.query(userDBTable).filter(userDBTable.username != 'admin').all() 


            reslt = [{'username':q.username, 'md5pass':q.md5pass,
                     'enabled':q.enabled, 'email':q.email, 'qrlink':q.qrlink} for q in query]
            if len(reslt) == 0:
            	return 'No users found', 400
            else:
            	return reslt, 200

        else:
            return 'Bad request', 400

class CheckUser(Resource):
    # Connects to DB and Linux and checks if user allready exist
    # returns user existence in DB and Linux users
    # API GET
    # parameters ?username=val1; checks username val1
    @login_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str)
        uname = parser.parse_args()['username']
        if not uname:
            return 'No parameters specified', 400

        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(linuxIP, username=linuxCred['user'], password=linuxCred['password'], look_for_keys=False)
        cmd = 'lid -g -n tokenusers'
        stdin, stdout, stderr = client.exec_command(cmd)
        stdout = [s.rstrip().lstrip() for s in stdout.readlines()]
        client.close()

        return {uname:{'existsInDB':userDBTable.userexist(uname), 'existsInLinux':uname in stdout}}

class AddUser(Resource):
    # Connects to Linux server with root priviliges {{ linuxCred }} 
    # Creates user on external Linux server with FreeRadius and Google Authenticator
    # belonging to {{ linuxGroup }} group and generates Google Authenticator token and
    # QR code path (otpauth://) for user; 
    # puts generated information to user DB on external MariaDB server
    # API POST
    # parameters ?username=val1&email=val2; creates user with username as password; doesn't matter for OTP authentication
    @login_required
    def post(self):
        qrpath = ''
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str)
        parser.add_argument('email', type=str)
        uname = parser.parse_args()['username']
        uemail = parser.parse_args()['email']
        if not uemail: uemail = 'none@none'
        if not uname:
            return 'No parameters specified', 400
        if len(uname) < 4:
            return 'Please specify correct username', 400
        
        if userDBTable.userexist(uname):
            return '{0} allready exists in database'.format(uname), 400
        
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(linuxIP, username=linuxCred['user'], password=linuxCred['password'], look_for_keys=False)
            cmd = '/home/useradd.sh {0}'.format(uname)
            stdin, stdout, stderr = client.exec_command(cmd)
            stdout = stdout.readlines()
            client.close()
            if 'false' in str(stdout):
                return '{0} allready exists in Linux users'.format(uname), 400
        except:
            return 'Can not connect to Linux host', 500
        
        qrpath = 'None'
        for s in stdout:
            qr = re.search(r'otpauth://.*',s)
            if qr is not None:
                qrpath = qr[0].replace('%3F','?').replace('%3D','=').replace('%26','&')
        if qrpath == 'None':
            return 'User have no QR Code generated', 400

        try:
            user = userDBTable(username = uname, md5pass = generate_password_hash(uname), enabled = True, qrlink = qrpath, 
            	email=uemail, qrviewed = False)
            db.session.add(user)
            db.session.commit()
        except:
            return 'Can not create user entry in DB', 500

        return {'qrcode':qrpath}, 200

        
class AddNewQR(Resource):
	# Connects to Linux server with root priviliges {{ linuxCred }} 
    # generates new Google Authenticator token and
    # QR code, Generates QR URI as otpauth://; puts generated information to user DB on external MariaDB server
    # API PUT
    # parameters ?username=val1
    @login_required
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str)
        uname = parser.parse_args()['username']
        if not uname:
            return 'No parameters specified', 400
        if len(uname) < 4:
            return 'Please specify correct username', 400

        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(linuxIP, username=linuxCred['user'], password=linuxCred['password'], look_for_keys=False)
            cmd = 'sudo -u {0} google-authenticator -t -d -w 3 -f -r 3 -R 30; '.format(uname)
            stdin, stdout, stderr = client.exec_command(cmd)
            stdout = stdout.readlines()
            client.close()
            if 'unknown user' in str(stdout):
                return '{0} not exist in Linux'.format(uname), 400
        except:
            return 'Can not connect to Linux host', 500
        
        qrpath = 'None'
        for s in stdout:
            qr = re.search(r'otpauth://.*',s)
            if qr is not None:
                qrpath = qr[0].replace('%3F','?').replace('%3D','=').replace('%26','&')
        if qrpath == 'None':
            return 'QR Code is not generated', 400

        try:
            uemail = db.session.query(userDBTable).filter(userDBTable.username == uname).all()[0].email
            db.session.query(userDBTable).filter(userDBTable.username == uname).update({'qrviewed': False})
            db.session.query(userDBTable).filter(userDBTable.username == uname).update({'qrlink': qrpath})
            db.session.commit()
        except:
            return 'Can not update user entry in DB', 500

        return [{'username':uname,'email':uemail,'qrlink':qrpath}], 200




        

class DeleteUser(Resource):
    # Connects to Linux server with root privileges {{ linuxCred }} 
    # Deletes user from linux server
    # Connects to external MAriaDB server with {{ DBCreds }} and deletes user
    # API POST
    # parameters ?username=val1; deletes user with username from DB and Linux
    
    @login_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str)
        uname = parser.parse_args()['username']
        if not uname:
            return 'No parameters specified', 400
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(linuxIP, username=linuxCred['user'], password=linuxCred['password'], look_for_keys=False)
            cmd = 'rm -rf /home/{0} ; userdel {0}'.format(uname)
            client.exec_command(cmd)
            client.close()
        except:
            return 'Can not connect to Linux host', 500

        try:
            if not userDBTable.userexist(uname):
                return 'User is not found.', 400
            else:
                db.session.query(userDBTable).filter(userDBTable.username == uname).delete()
                db.session.commit()
        except:
            return 'Can not connect to DB host', 500

        return 'User {0} deleted'.format(uname), 200

class DisableUser(Resource):
    # Connects to Linux server with root privileges {{ linuxCred }} 
    # locks user from linux server with passwd -l; chage -E0; usermod -s /sbin/nologin
    # Connects to external MAriaDB server with {{ DBCreds }} and sets field Enabled to True
    # API PUT
    @login_required
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str)
        uname = parser.parse_args()['username']
        if not uname:
            return 'No parameters specified', 400
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(linuxIP, username=linuxCred['user'], password=linuxCred['password'], look_for_keys=False)
            cmd = 'passwd -l {0}; chage -E0 {0}; usermod -s /sbin/nologin {0}'.format(uname)
            client.exec_command(cmd)
            client.close()
        except:
            return 'Can not connect to Linux host', 500
        try:
            if not userDBTable.userexist(uname):
                return 'User is not found.', 400
            else:
                db.session.query(userDBTable).filter(userDBTable.username == uname).update({'enabled': False})
                db.session.commit()
        except:
            return 'Can not connect to DB host', 500

        return {uname:'disabled'}, 200
    
class EnableUser(Resource):
    # Connects to Linux server with root privileges {{ linuxCred }} 
    # unlocks linux server user with passwd -u; chage -E -1 -M -1; usermod -s /bin/bash
    # Connects to external MAriaDB server with {{ DBCreds }} and sets user field Enabled to True
    # API PUT
    @login_required
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str)
        uname = parser.parse_args()['username']
        if not uname:
            return 'No parameters specified', 400
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(linuxIP, username=linuxCred['user'], password=linuxCred['password'], look_for_keys=False)
            cmd = 'passwd -u {0}; chage -E -1 -M -1 {0}; usermod -s /bin/bash {0}'.format(uname)
            client.exec_command(cmd)
            client.close()
        except:
            return 'Can not connect to Linux host', 500
        try:
            if not userDBTable.userexist(uname):
                return 'User is not found.', 400
            else:
                db.session.query(userDBTable).filter(userDBTable.username == uname).update({'enabled': True})
                db.session.commit()
        except:
            return 'Can not connect to DB host', 500

        return {uname:'enabled'}, 200


api.add_resource(Hello, baseURI+'hello')
api.add_resource(CreateTable, baseURI+'DBtable')
api.add_resource(getUserQR, '/qr/get')
api.add_resource(AddNewQR, baseURI+'qr/update')
api.add_resource(GetUsers, baseURI+'users/get')
api.add_resource(GetUsersNumber, baseURI+'users/number')
api.add_resource(GetUsersNumberPattern, baseURI+'users/pnumber')
api.add_resource(AddUser, baseURI+'users/add')
api.add_resource(CheckUser, baseURI+'users/check')
api.add_resource(DeleteUser, baseURI+'users/delete')
api.add_resource(DisableUser, baseURI+'users/disable')
api.add_resource(EnableUser, baseURI+'users/enable')
api.add_resource(getToken, baseURI+'getToken')
api.add_resource(ChangeAdminPassword, baseURI+'changePsw')
api.add_resource(NADAction, baseURI+'nad')
 

if __name__ == '__main__':
    app.run()
