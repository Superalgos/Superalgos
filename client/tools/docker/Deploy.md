# Deploying Algo Community Portal to Linux VM

Using Docker reverse-proxied by Docker-NGINX-LetsEncrypt [base setup](https://github.com/evertramos/docker-compose-letsencrypt-nginx-proxy-companion)

In project root:
```
mkdir build
cp tools/docker/deploy.yml build/deploy.yml && \
  tools/docker/Dockerfile build/Dockerfile && \
  tools/docker/nginx.conf build/nginx.conf && \

npm run build
cd build

docker-compose -f deploy.yml up -d
```