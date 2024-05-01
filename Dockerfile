FROM node:lts

COPY . /app
WORKDIR /app

CMD ["npm", "start"]