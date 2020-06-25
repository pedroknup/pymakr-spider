FROM node:10.15.2

ENV NPM_CONFIG_LOGLEVEL warn

RUN mkdir -p /usr/src/spider
WORKDIR /usr/src/spider

COPY package.json package-lock.json /usr/src/ws/

RUN npm install

COPY . /usr/src/spider

CMD ["npm", "run", "start"]

EXPOSE 3001