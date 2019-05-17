FROM mhart/alpine-node:12

# Directory where the service will be installed
ARG API_DIR=/usr/src/clones-api

# Prepare required directories
RUN mkdir -p ${API_DIR} && \
    mkdir -p /root/.kube

# Use app directory as current workdir
WORKDIR ${API_DIR}

# Copy package.json to workdir
COPY . ${API_DIR}/
COPY ./config /root/.kube

# Install dependencies
RUN npm install --production

# Expose Port
EXPOSE $PORT
