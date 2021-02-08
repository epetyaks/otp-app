FROM centos:7

RUN yum -y update
RUN yum -y install httpd httpd-tools mod_ssl

COPY html/ /var/www/html/
COPY /ssl/public_cert.pem /etc/pki/tls/certs/
COPY /ssl/private_key.pem /etc/pki/tls/private/
RUN chmod 700 /etc/pki/tls/private/private_key.pem
RUN chmod -R 755 /var/www/html
RUN sed -i '/DocumentRoot/s/^#//g' /etc/httpd/conf.d/ssl.conf
RUN sed -i 's,^SSLCertificateFile.*,SSLCertificateFile /etc/pki/tls/certs/public_cert.pem,' /etc/httpd/conf.d/ssl.conf
RUN sed -i 's,^SSLCertificateKeyFile.*,SSLCertificateKeyFile /etc/pki/tls/private/private_key.pem,' /etc/httpd/conf.d/ssl.conf

EXPOSE 443

# Start Apache
CMD ["/usr/sbin/httpd","-D","FOREGROUND"]

