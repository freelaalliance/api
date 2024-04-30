FROM node:20

COPY . /app
WORKDIR /app

RUN npx prisma generate

CMD ["npm", "start"]