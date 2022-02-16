FROM node:16-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache --virtual .build-deps make g++ unzip bash curl \
    && apk add --no-cache python3 \
    && npm ci \
    && ./Docker/download-plugins.sh \
    && mkdir -p ./Platform/My-Data-Storage ./Platform/My-Log-Files ./Platform/My-Workspaces ./Platform/My-Network-Nodes-Data ./Platform/My-Social-Trading-Data \
    && addgroup superalgos \
    && adduser --disabled-password --no-create-home --ingroup superalgos superalgos \
    && chown -R superalgos:superalgos /app \
    && apk del .build-deps
USER superalgos
EXPOSE 34248
EXPOSE 18041
VOLUME ["/app/Platform/My-Data-Storage", "/app/Platform/My-Log-Files", "/app/Platform/My-Workspaces", "/app/Platform/My-Network-Nodes-Data", "/app/Platform/My-Social-Trading-Data"]
ENTRYPOINT ["node", "platform", "noBrowser"]
