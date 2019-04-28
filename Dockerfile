FROM mhart/alpine-node:12

# Directory where the service will be installed
ARG API_DIR=/usr/src/events-api

# Prepare required directories
RUN mkdir -p ${API_DIR}

# Use app directory as current workdir
WORKDIR ${API_DIR}

# Copy package.json to workdir
COPY package*.json ${API_DIR}/

# Install dependencies
RUN npm install --production

# Copy application code
COPY . ${API_DIR}

# Expose Port
EXPOSE $PORT
