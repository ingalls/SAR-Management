FROM ubuntu:22.04

EXPOSE 5000

ENV HOME=/home/sar
WORKDIR $HOME

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends apt-utils tzdata \
    && apt-get install -y nginx curl python3 build-essential postgresql-client-common postgresql-client-14

RUN export NODEV='22.9.0' \
    && curl "https://nodejs.org/dist/v${NODEV}/node-v${NODEV}-linux-x64.tar.gz" | tar -xzv > /dev/null \
    && cp ./node-v${NODEV}-linux-x64/bin/node /usr/bin/ \
    && ./node-v${NODEV}-linux-x64/bin/npm install -g npm

COPY ./ $HOME/api
WORKDIR $HOME/api

RUN cp ./nginx.conf /etc/nginx/sites-enabled/default

RUN npm install \
    && npm run doc

RUN cd web \
    && npm install \
    && npm install -g yarn \
    && yarn prod \
    && cd ..

CMD service nginx restart \
    && npm run prod
