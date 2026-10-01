FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared packages/shared
COPY database database
COPY simulator simulator
COPY workers workers
COPY apps/api apps/api

RUN npm install
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=database
RUN npm run build --workspace=apps/api

EXPOSE 4000

CMD ["npm", "run", "dev:api"]
