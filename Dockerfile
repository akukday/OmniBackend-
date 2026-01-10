#### STAGE1 ####
FROM node:20.14.0-alpine3.19 AS build

# Create directpry if not present
RUN mkdir -p /usr/src/app

# Set work directory
WORKDIR /usr/src/app

# Install dependancies
COPY package.json package-lock.json ./

COPY .env.* ./

RUN npm install

COPY . .

RUN npm run build

#### STAGE2 ####
FROM node:20.14.0-alpine3.19 AS serve

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/.env.* ./

# Expose port
EXPOSE 8082

# Starts run command
CMD ["npm","start"]
