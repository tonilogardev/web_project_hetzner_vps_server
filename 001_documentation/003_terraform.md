# Terraform

## Index

1. [Install latest terraform version](#1-install-latest-terraform-version)
2. [Create private and public SSH key](#2-create-private-and-public-ssh-key)
3. [Load environment variables](#3-load-environment-variables)
4. [Terraform workflow](#4-terraform-workflow)
5. [Terraform project scaffold](#5-terraform-project-scaffold)



---

## 1 Install latest terraform version

[Install terraform→](https://developer.hashicorp.com/terraform/install) 


[←index](#terraform)

## 2 Create private and public SSH key  

Create ssh folder and generate a key pair for the Hetzner VPS and keep it outside version control.   

```bash
mkdir -p 002_terraform/ssh
ssh-keygen -t ed25519 \
  -f 002_terraform/ssh/id_ed25519_vps_hetzner \
  -C "tonilogardev@id_ed25519_vps_hetzner" \
  -N ""
```

```bash
Generating public/private ed25519 key pair.
Your identification has been saved in 002_terraform/ssh/id_ed25519_vps_hetzner
Your public key has been saved in 002_terraform/ssh/id_ed25519_vps_hetzner.pub
The key fingerprint is:
SHA256:alo/NiKniMWcTkK4oOKQJdqE9nOC2sPNgcFZDjMgzuI tonilogardev@id_ed25519_vps_hetzner
The key's randomart image is:
+--[ED25519 256]--+
|o.               |
|+ + .            |
|.+ B             |
|*X+..  .         |
|OoB* o+          |
|=Bo.B+o.+        |
|o.+.o+ o.o       |
+----[SHA256]-----+
```

Restrict permissions.

```bash
chmod 600 002_terraform/ssh/id_ed25519_vps_hetzner
```

Test permissions.

```bash
ls -l 002_terraform/ssh/id_ed25519_vps_hetzner
```
Output

```bash
-rw------- 1 tonilogar tonilogar 484 Apr 24 09:22 002_terraform/ssh/id_ed25519_vps_hetzner
```

[←Index](#index)


## 3 Load environment variables

Populate the `.env` files as documented in [002_hetzner_login_domain_API_tokens](./002_hetzner_login_domain_API_tokens.md).  
Load the values before running Terraform.

```bash
set -a
source .env.development   # or .env.production
set +a
terraform -chdir=002_terraform init
```

> Run the same block with `.env.production` whenever you need production values.

[←Index](#index)

## 4 Terraform workflow

Refresh providers and preview changes whenever you tweak variables or code.

```bash
set -a
source .env.development
set +a
rm -rf 002_terraform/.terraform
terraform -chdir=002_terraform init -upgrade
terraform -chdir=002_terraform plan
```

Execute plan to create server.
```bash
terraform -chdir=002_terraform apply
```

[←Index](#index)

## 5 Terraform project scaffold

Directory layout under `002_terraform/`.

```
002_terraform/
├── dns.tf                   # DNS records in Hetzner DNS
├── outputs.tf               # Exported values (IPs, zone info)
├── providers.tf             # hcloud and hetznerdns providers
├── scripts/
│   └── init_server.sh.tpl   # cloud-init bootstrap script
├── server.tf                # VPS + SSH key definition
├── variables.tf             # Definitions for all input variables
└── ssh/
    ├── id_ed25519_vps_hetzner
    └── id_ed25519_vps_hetzner.pub
```

The file `scripts/init_server.sh.tpl` is delivered as the cloud-init script that installs Docker, Certbot, and prepares the VPS on the first boot.

Next step:
- [004_check_server](./004_check_server.md)
