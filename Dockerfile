FROM node:alpine

WORKDIR /app

COPY package.json .

RUN npm cache clear --force
RUN npm install

COPY . .

ENV NODE_ENV=dev



RUN npm run prisma:generate

RUN npm run build
RUN npx prisma migrate


CMD ["sh","-c","npx prisma migrate deploy && npm run start:prod"]