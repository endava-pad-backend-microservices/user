FROM node:10


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# Bundle app source
COPY . .

EXPOSE 8084

COPY package*.json ./

ENV SERVER_URL=pad-b-users
ENV EUREKA_URL=pad-b-registry

RUN npm install

RUN npm install typescript ts-node -g

ENV DOCKERIZE_VERSION v0.6.0

RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

CMD dockerize -wait tcp://$EUREKA_URL:8761 -timeout 60m yarn start

RUN npm run build 

