FROM node:20

WORKDIR /src

COPY package*.json package-lock.json ./

RUN npm install --build-from-source

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]