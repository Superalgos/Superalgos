FROM node:16-alpine as BASE

FROM BASE as BUILDER
RUN apk add --no-cache python3 make g++ curl \
    && curl -sf https://gobinaries.com/tj/node-prune | sh

WORKDIR /app
COPY . .
WORKDIR /app/Platform
RUN npm ci --only=production && node-prune
WORKDIR /app/Projects/Foundations/TS/Bot-Modules/Sensor-Bot/Exchange-Raw-Data
RUN npm ci --only=production && node-prune
WORKDIR /app/Projects/Foundations/TS/Bot-Modules/API-Data-Fetcher-Bot
RUN npm ci --only=production && node-prune
WORKDIR /app/Projects/Foundations/TS/Bot-Modules/Trading-Bot/Announcements
RUN npm ci --only=production && node-prune
WORKDIR /app/Projects/Foundations/TS/Bot-Modules/Trading-Bot/Low-Frequency-Trading/APIs
RUN npm ci --only=production && node-prune
WORKDIR /app/Projects/Foundations/TS/Task-Modules
RUN npm ci --only=production && node-prune
WORKDIR /app/Projects/TensorFlow/TS/Bot-Modules/Learning-Bot/Low-Frequency-Learning
RUN npm ci --only=production && node-prune

FROM BASE
ENV PYTHONUNBUFFERED 1
RUN apk add --no-cache python3
WORKDIR /app
COPY . .
COPY --from=BUILDER /app/Platform/node_modules /app/Platform/node_modules
COPY --from=BUILDER /app/Projects/Foundations/TS/Bot-Modules/Sensor-Bot/Exchange-Raw-Data/node_modules /app/Projects/Foundations/TS/Bot-Modules/Sensor-Bot/Exchange-Raw-Data/node_modules
COPY --from=BUILDER /app/Projects/Foundations/TS/Bot-Modules/API-Data-Fetcher-Bot/node_modules /app/Projects/Foundations/TS/Bot-Modules/API-Data-Fetcher-Bot/node_modules
COPY --from=BUILDER /app/Projects/Foundations/TS/Bot-Modules/Trading-Bot/Announcements/node_modules /app/Projects/Foundations/TS/Bot-Modules/Trading-Bot/Announcements/node_modules
COPY --from=BUILDER /app/Projects/Foundations/TS/Bot-Modules/Trading-Bot/Low-Frequency-Trading/APIs/node_modules /app/Projects/Foundations/TS/Bot-Modules/Trading-Bot/Low-Frequency-Trading/APIs/node_modules
COPY --from=BUILDER /app/Projects/Foundations/TS/Task-Modules/node_modules /app/Projects/Foundations/TS/Task-Modules/node_modules
COPY --from=BUILDER /app/Projects/TensorFlow/TS/Bot-Modules/Learning-Bot/Low-Frequency-Learning/node_modules /app/Projects/TensorFlow/TS/Bot-Modules/Learning-Bot/Low-Frequency-Learning/node_modules

RUN mkdir -p Data-Storage Log-Files My-Workspaces \
    && addgroup superalgos \
    && adduser --disabled-password --no-create-home --ingroup superalgos superalgos \
    && chown -R superalgos:superalgos /app

USER superalgos
EXPOSE 34248
EXPOSE 18041
VOLUME ["/app/Data-Storage", "/app/Log-Files", "/app/My-Workspaces"]
ENTRYPOINT ["node", "platform", "noBrowser"]

