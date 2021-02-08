FROM mariadb:latest

COPY schema.sql /docker-entrypoint-initdb.d/

ENV MYSQL_ROOT_PASSWORD testing123
ENV MYSQL_DATABASE radiususers
ENV MYSQL_USER admin
ENV MYSQL_PASSWORD testing123

EXPOSE 3306

