FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

COPY conf.d /etc/nginx/templates
COPY scripts/generate-config.sh /docker-entrypoint.d/50-generate-config.sh
