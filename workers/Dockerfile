FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared packages/shared
COPY database database
COPY simulator simulator
COPY workers workers

RUN npm install
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=database
RUN npm run build --workspace=simulator
RUN npm run build --workspace=workers

CMD ["npm", "run", "dev:worker"]
