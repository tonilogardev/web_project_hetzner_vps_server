#!/bin/sh
set -e

echo "Configurando Nginx para el entorno: ${ENVIRONMENT}"

TEMPLATE_DIR="/etc/nginx/conf.d/templates"
OUTPUT_FILE="/etc/nginx/conf.d/default.conf"

if [ "$ENVIRONMENT" = "production" ]; then
  TEMPLATE="${TEMPLATE_DIR}/production.conf.template"
  envsubst '${NGINX_HTTP_PORT} ${NGINX_HTTPS_PORT} ${NGINX_SERVER_NAME} ${BACKEND_SERVICE_NAME} ${PORT_BACKEND_AUTH0} ${VOL_CERTBOT_CONTAINER} ${VOL_LETSENCRYPT_CONTAINER} ${NGINX_SSL_PROTOCOLS} ${NGINX_SSL_CIPHERS} ${NGINX_SSL_SESSION_TIMEOUT} ${NGINX_SSL_SESSION_CACHE} ${NGINX_DNS_RESOLVERS} ${NGINX_DNS_RESOLVER_TIMEOUT} ${NGINX_DNS_RESOLVER_VALID}' \
    < "$TEMPLATE" > "$OUTPUT_FILE"
else
  TEMPLATE="${TEMPLATE_DIR}/development.conf.template"
  envsubst '${NGINX_HTTP_PORT} ${NGINX_SERVER_NAME} ${BACKEND_SERVICE_NAME} ${PORT_BACKEND_AUTH0} ${VOL_CERTBOT_CONTAINER}' \
    < "$TEMPLATE" > "$OUTPUT_FILE"
fi

echo "Configuración final de Nginx:"
cat "$OUTPUT_FILE"

exec nginx -g "daemon off;"
