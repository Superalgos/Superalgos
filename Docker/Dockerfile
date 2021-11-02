FROM node:16-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache --virtual .build-deps make g++ \
    && apk add --no-cache python3 \
    && if [ "$(uname -m)" = "x86_64" ]; then node setup noShortcuts tensorflow; else node setup noShortcuts; fi \
    && mkdir -p ./Platform/My-Data-Storage ./Platform/My-Log-Files ./Platform/My-Workspaces \
    && addgroup superalgos \
    && adduser --disabled-password --no-create-home --ingroup superalgos superalgos \
    && chown -R superalgos:superalgos /app \
    && apk del .build-deps
USER superalgos
EXPOSE 34248
EXPOSE 18041
VOLUME ["/app/Platform/My-Data-Storage", "/app/Platform/My-Log-Files", "/app/Platform/My-Workspaces"]
ENTRYPOINT ["node", "platform", "noBrowser"]
