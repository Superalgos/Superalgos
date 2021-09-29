FROM node:16-alpine as BASE

FROM BASE as BUILDER
RUN apk add --no-cache python3 make g++ curl \
    && curl -sf https://gobinaries.com/tj/node-prune | sh
WORKDIR /app
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
RUN npm ci --only=production && node-prune

FROM BASE
WORKDIR /app
COPY . .
COPY --from=BUILDER /app/node_modules /app/node_modules
RUN mkdir -p Data-Storage Log-Files My-Workspaces \
    && addgroup superalgos \
    && adduser --disabled-password --no-create-home --home /app --ingroup superalgos superalgos \
    && chown -R superalgos:superalgos /app
USER superalgos
EXPOSE 34248
EXPOSE 18041
VOLUME ["/app/Data-Storage", "/app/Log-Files", "/app/My-Workspaces"]
ENTRYPOINT ["node", "platform", "noBrowser"]

