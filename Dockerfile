FROM node:10
RUN mkdir -p /usr/src/critical-css-api/node_modules && chown -R node:node /usr/src/critical-css-api && mkdir -p /usr/src/critical-css-api/public
WORKDIR /usr/src/critical-css-api
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 8080
CMD [ "node", "yarn build:prod" ]

