FROM mhart/alpine-node:12

# Directory where the service will be installed
ARG API_DIR=/usr/src/users-api

# Prepare required directories
RUN mkdir -p ${API_DIR}

# Use app directory as current workdir
WORKDIR ${API_DIR}

# Copy package.json to workdir
COPY . ${API_DIR}/

# Install dependencies
RUN npm install --production

# Expose Port
EXPOSE $PORT
