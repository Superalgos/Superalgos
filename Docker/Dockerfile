FROM node:current-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && mkdir -p Data-Storage Log-Files My-Workspaces \
    && addgroup -S superalgos \
    && adduser -S superalgos -G superalgos \
    && chown -R superalgos:superalgos /app
USER superalgos
COPY . .
RUN node setup noShortcuts
EXPOSE 34248
EXPOSE 18041
VOLUME ["/app/Data-Storage", "/app/Log-Files", "/app/My-Workspaces"]
ENTRYPOINT ["node", "platform", "noBrowser"]