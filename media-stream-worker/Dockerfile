FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm ci
COPY src/ src/
RUN npx tsc

FROM node:22-alpine

WORKDIR /app
COPY package.json ./
RUN npm ci --production
COPY --from=builder /app/dist/ dist/
COPY .env ./

EXPOSE 9090

CMD ["node", "dist/index.js"]
