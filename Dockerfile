FROM node:19-buster-slim
LABEL maintainer="Enrico Zanotto"

EXPOSE 8080

WORKDIR /app
COPY . /app
RUN npm install
RUN npm run compile
RUN npm start
