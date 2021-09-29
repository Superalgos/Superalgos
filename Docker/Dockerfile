FROM node:current-alpine
RUN apk add --no-cache git
WORKDIR /app
RUN mkdir -p Data-Storage Log-Files My-Workspaces \
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