FROM python:3

MAINTAINER Evgeny Petyakshev version:0.1

ADD api/ /api
COPY ssl/public_cert.pem /api/
COPY ssl/private_key.pem /api/
WORKDIR /api
RUN apt-get update
RUN pip install -r requirements.txt
CMD ["gunicorn", "--certfile=public_cert.pem", "--keyfile=private_key.pem", "--bind", "0.0.0.0:9443", "wsgi:app"]
