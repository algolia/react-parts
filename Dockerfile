FROM ubuntu:14.04

# Install deps
RUN apt-get update && apt-get install -y \
  curl 
RUN curl --silent --location https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y \
  nodejs

# Copy needed files
COPY ./assets/ /usr/local/src/assets
COPY ./components/ /usr/local/src/components
COPY ./src/ /usr/local/src/src
COPY ./views/ /usr/local/src/views
COPY ./keys.json /usr/local/src/
COPY ./server.js /usr/local/src/
COPY ./package.json /usr/local/src/

WORKDIR /usr/local/src

RUN npm install
EXPOSE 8080

CMD npm run start
