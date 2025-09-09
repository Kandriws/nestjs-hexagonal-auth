# Build stage
FROM node:20-alpine AS build

RUN apk add --no-cache bash

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npm run prisma:generate

COPY . .

# Final stage
FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /usr/src/app

COPY --from=build /usr/src/app /usr/src/app
COPY scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]
