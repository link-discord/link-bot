FROM node:lts-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY ./src ./src

RUN npm ci

CMD ["npm", "run", "start"]
