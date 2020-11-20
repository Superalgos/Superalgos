FROM mhart/alpine-node

ENV PORT=3001
ENV NODE_ENV=development
ENV APP_PATH=/var/www/application

RUN apk update && apk upgrade && \
    apk add --no-cache bash git

# Create app directory
RUN mkdir -p $APP_PATH

# Use app directory as current workdir
WORKDIR $APP_PATH

# Copy package.json to workdir
COPY package.json .

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose Port
EXPOSE $PORT

# Run command
CMD npm run dev
