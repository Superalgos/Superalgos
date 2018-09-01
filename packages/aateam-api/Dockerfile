FROM mhart/alpine-node:8

ARG PORT=4000
ARG APP_PATH=/usr/src/app

RUN mkdir -p /usr && \
    mkdir -p $APP_PATH && \
    mkdir -p $APP_PATH /node_modules

# Use app directory as current workdir
WORKDIR $APP_PATH

# Copy package.json to workdir
COPY package.json .

# Install dependencies
RUN npm install

# Copy application code
COPY . .

RUN NODE_ENV=production npm run start

# Expose Port
EXPOSE $PORT
