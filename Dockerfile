FROM node:10

# Create app directory
WORKDIR /usr/src/app



# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# Bundle app source
COPY . .

EXPOSE 8084

COPY package*.json ./

ENV server.url=pad_b_registry

RUN npm install

RUN npm install typescript ts-node -g
# If you are building your code for production
# RUN npm install --only=production

CMD /wait && RUN npm run build 

CMD [ "npm", "start" ]