FROM node:20-alpine3.20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN apk update && \
    apk add --no-cache bash openssl curl

EXPOSE 8080

CMD ["npm", "start"]
