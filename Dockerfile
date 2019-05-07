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
# If you are building your code for production
# RUN npm install --only=production

CMD /wait && RUN npm run build 

CMD [ "npm", "start" ]