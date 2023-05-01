# Build stage
FROM node:18.16.0-alpine as build

WORKDIR /app/nestjs

COPY . .

RUN npm install
RUN npm run build

# Production stage
FROM node:18.16.0-alpine

WORKDIR /app/nestjs

COPY --from=build /app/nestjs/dist ./dist
COPY package*.json ./

RUN npm install --only=production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
