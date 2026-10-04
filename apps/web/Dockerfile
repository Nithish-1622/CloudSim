FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared packages/shared
COPY apps/web apps/web

RUN npm install
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

EXPOSE 3000

CMD ["npm", "run", "dev:web"]
