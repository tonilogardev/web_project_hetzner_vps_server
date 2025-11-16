FROM node:20-alpine AS base

ARG APP_PORT=3000

WORKDIR /app

ENV PORT=${APP_PORT}

COPY package.json ./

RUN npm install --production

COPY . .

EXPOSE ${PORT}

CMD ["sh", "-c", "npm run ${COMMAND:-start}"]
