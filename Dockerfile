FROM node:10
RUN mkdir -p /usr/src/ccss/node_modules && chown -R node:node /usr/src/ccss && /usr/src/ccss/public
WORKDIR /usr/src/ccss
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 8080
CMD [ "node", "yarn start" ]

