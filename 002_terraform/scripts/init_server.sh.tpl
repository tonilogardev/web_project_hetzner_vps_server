#!/bin/bash
# Cloud-init setup for the Hetzner VPS.

set -euxo pipefail

echo "--- Updating packages ---"
apt-get update -y
apt-get upgrade -y

echo "--- Installing prerequisites ---"
apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  software-properties-common \
  python3-pip

echo "--- Installing Docker ---"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
OS_CODENAME=$(awk -F= '$1=="VERSION_CODENAME"{print $2}' /etc/os-release)
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $${OS_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

docker --version
docker compose version

echo "--- Requested Docker Compose version: ${compose_version} ---"

echo "--- Installing Certbot and Hetzner DNS plugin ---"
if ! apt-get install -y certbot python3-certbot-dns-hetzner; then
  pip install --break-system-packages certbot-dns-hetzner
fi

echo "--- Configuring Hetzner DNS credentials for Certbot ---"
HETZNER_CREDS_DIR="/root/.secrets"
HETZNER_CREDS_FILE="$HETZNER_CREDS_DIR/hetzner_credentials.ini"
mkdir -p "$HETZNER_CREDS_DIR"
chmod 700 "$HETZNER_CREDS_DIR"
cat <<EOF_CREDS > "$HETZNER_CREDS_FILE"
dns_hetzner_api_token = ${dns_api_token}
EOF_CREDS
chmod 600 "$HETZNER_CREDS_FILE"

echo "--- Requesting wildcard certificate (non-blocking) ---"
certbot certonly \
  --authenticator dns-hetzner \
  --dns-hetzner-credentials "$HETZNER_CREDS_FILE" \
  --non-interactive \
  --agree-tos \
  --email "${admin_email}" \
  -d "${domain_name}" \
  -d "*.${domain_name}" \
  --server https://acme-v02.api.letsencrypt.org/directory \
  || echo "Certbot did not issue a certificate yet; check /var/log/letsencrypt/letsencrypt.log"

echo "--- Scheduling certificate renewal ---"
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "--- Initialization completed ---"
