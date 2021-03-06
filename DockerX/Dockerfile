FROM node:15-alpine
WORKDIR /app
COPY . .
RUN adduser --disabled-password --no-create-home superalgos
RUN chown -R superalgos:superalgos /app
USER superalgos
EXPOSE 34248
EXPOSE 18041
ENTRYPOINT ["node", "run", "noBrowser"]
