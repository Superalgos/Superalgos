FROM mhart/alpine-node:12

# Directory where the service will be installed
ARG API_DIR=/usr/src/clonesapi

# Prepare required directories
RUN mkdir -p ${API_DIR} && \
    mkdir -p /root/.kube

# Use app directory as current workdir
WORKDIR ${API_DIR}
# ENV PATH /var/www/app/node_modules/.bin:$PATH

# Copy package.json to workdir
COPY package*.json ${API_DIR}/

# Install dependencies
RUN npm install --production

# Copy application code
COPY . ${API_DIR}
COPY ./config /root/.kube

# Expose Port
EXPOSE $PORT
