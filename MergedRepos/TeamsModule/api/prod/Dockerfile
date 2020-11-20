# ---- Base Node ----
FROM node:carbon AS base
# Create app directory
WORKDIR /usr/src/app

# ---- Dependencies ----
FROM base AS dependencies
WORKDIR /usr/src/app
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
# install app dependencies including 'devDependencies'
RUN npm install --only=production

# ---- Copy Files/Build ----
FROM dependencies AS build
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm run build

# --- Release with Alpine ----
FROM mhart/alpine-node:8 AS release
# Create app directory
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./
COPY --from=build /usr/src/app/node_modules ./node_modules
#CMD ["serve", "-s", "dist", "-p", "8080"]
CMD ["node", "dist/index.js"]
