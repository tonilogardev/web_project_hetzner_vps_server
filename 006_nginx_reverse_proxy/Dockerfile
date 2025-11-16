FROM nginx:alpine

RUN apk add --no-cache gettext

RUN mkdir -p /var/www/certbot \
  && mkdir -p /etc/nginx/conf.d/templates

COPY conf.d/*.template /etc/nginx/conf.d/templates/
COPY docker-entrypoint-custom.sh /docker-entrypoint-custom.sh

RUN sed -i 's/\r$//' /docker-entrypoint-custom.sh && chmod +x /docker-entrypoint-custom.sh

ENTRYPOINT ["/docker-entrypoint-custom.sh"]
CMD ["nginx", "-g", "daemon off;"]
