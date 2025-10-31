# Check server

## Index

1. [Load environment variables](#1-load-environment-variables)
2. [Fetch server IP](#2-fetch-server-ip)
3. [Connect over SSH](#3-connect-over-ssh)
4. [Verify Docker and Certbot](#4-verify-docker-and-certbot)
5. [Troubleshooting](#5-troubleshooting)



---

## 1 Load environment variables

Pick the environment you want to inspect.

```bash
set -a
source .env.development   # or .env.production
set +a
```

[←Index](#index)

## 2 Fetch server IP

Use Terraform outputs to confirm the public IPv4 address.

```bash
terraform -chdir=002_terraform output server_ipv4
```

[←Index](#index)

## 3 Connect over SSH

Connect as root using the key provisioned by Terraform.

```bash
ssh -i 002_terraform/ssh/id_ed25519_vps_hetzner root@<server_ipv4>
```

Accept the fingerprint with `yes` the first time the prompt appears.

[←Index](#index)

## 4 Verify Docker and Certbot

Confirm the provisioning script installed Docker, Docker Compose, and Certbot.

```bash
docker --version
docker compose version
certbot --version
```

Inspect the certificate directory and show the certificate.

```bash
ls -l /etc/letsencrypt/live/<domain>
openssl x509 -in /etc/letsencrypt/live/<domain>/cert.pem -noout -text
```

Ensure `DNS:<domain>` and `DNS:*.<domain>` appear under `Subject Alternative Name`.

```bash
X509v3 Subject Alternative Name: 
                DNS:*.tonilogar.com, DNS:tonilogar.com
```

[←Index](#index)

## 5 Troubleshooting

### Host key changed

Recreating the VPS (even if it keeps the same IP) generates a new host key, triggering:

```
WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!
```

Remove the stale entry and reconnect:

```bash
ssh-keygen -R <server_ipv4>
```
```bash
ssh -i 002_terraform/ssh/id_ed25519_vps_hetzner root@<server_ipv4>
```

[←Index](#index)
```
