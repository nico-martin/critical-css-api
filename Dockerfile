FROM node:10

# Create app directory
RUN mkdir -p /usr/src/ccss/node_modules && chown -R node:node /usr/src/ccss

WORKDIR /usr/src/ccss

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN yarn install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "yarn start" ]

