FROM nginx:1.15.0-alpine
RUN rm -rf /usr/share/nginx/html
COPY --chown=nginx:nginx . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80