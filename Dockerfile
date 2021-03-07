FROM node:lts-alpine3.10

WORKDIR app

COPY . .

EXPOSE 18041
EXPOSE 34248

CMD ["node", "run", "noBrowser"]


