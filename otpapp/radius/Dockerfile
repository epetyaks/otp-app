FROM centos/systemd

MAINTAINER Evgeny Petyakshev version:0.1

RUN yum install freeradius freeradius-utils -y \
   && yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm -y \
   && yum update -y \
   && yum install gcc pam pam-devel qrencode google-authenticator -y \
   && yum install -y sudo passwd openssh-server openssh-clients \
   && yum clean all

# Enable SSH access, change root password
RUN sed -i 's/UsePAM yes/#UsePAM yes/g' /etc/ssh/sshd_config
RUN sed -i 's/#UsePAM no/UsePAM no/g' /etc/ssh/sshd_config
RUN sed -i 's/#PermitRootLogin yes/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN mkdir -p /root/.ssh/
RUN rm -f /var/lib/rpm/.rpm.lock
RUN echo "StrictHostKeyChecking=no" > /root/.ssh/config
RUN echo "UserKnownHostsFile=/dev/null" >> /root/.ssh/config
RUN echo "root:testing123" | chpasswd

# Radius+Goole Authenticator post-install tasks
RUN sed -i 's/user = radiusd/user = root/g' /etc/raddb/radiusd.conf
RUN sed -i 's/group = radiusd/group = root/g' /etc/raddb/radiusd.conf
RUN echo 'DEFAULT Group == "disabled", Auth-Type := Reject' >> /etc/raddb/users
RUN echo ' Reply-Message = "Your account has been disabled."' >> /etc/raddb/users
RUN echo 'DEFAULT Auth-Type := PAM' >> /etc/raddb/users
RUN sed -i '1!d' /etc/pam.d/radiusd
RUN echo 'auth required pam_google_authenticator.so' >> /etc/pam.d/radiusd
RUN echo 'account required pam_unix.so audit' >> /etc/pam.d/radiusd
RUN echo 'account required pam_permit.so' >> /etc/pam.d/radiusd
RUN sed -i '/pam/s/^#//g' /etc/raddb/sites-enabled/default
RUN ln -s /etc/raddb/mods-available/pam /etc/raddb/mods-enabled/pam
RUN ln -s /bin/google-authenticator google-authenticator
RUN systemctl enable radiusd
RUN systemctl enable sshd
RUN touch /home/useradd.sh
RUN chmod 777 /home/useradd.sh
RUN echo '#!/bin/bash' >> /home/useradd.sh
RUN echo 'if id "$1" >/dev/null 2>&1; then' >> /home/useradd.sh
RUN echo ' echo "-false-"' >> /home/useradd.sh
RUN echo 'else' >> /home/useradd.sh
RUN echo ' useradd $1 -g tokenusers -s /bin/bash' >> /home/useradd.sh
RUN echo ' echo $1 | passwd $1 --stdin' >> /home/useradd.sh
RUN echo ' cd /home/$1/' >> /home/useradd.sh
RUN echo ' sudo -u $1 google-authenticator -t -d -w 3 -f -r 3 -R 30;' >> /home/useradd.sh
RUN echo 'fi' >> /home/useradd.sh
RUN echo '####OTPAUTHCLIENTS' >> /etc/raddb/clients.conf
RUN groupadd tokenusers

EXPOSE 22/tcp 1812/udp 1813/udp 1812/tcp 1813/tcp
CMD ["/usr/sbin/init"]
