# Not everything is customizable...

## Index

1. [Create Hetzner user](#1-create-hetzner-user)
2. [Buy domain](#2-buy-domain)
3. [Create GitHub repository](#3-create-github-repository)  
4. [Create a GitHub Personal Access Token (PAT)](#4-create-a-github-personal-access-token-pat)
5. [Clone repository in local machine](#5-clone-repository-in-local-machine)
6. [Commit and Push changes to GitHub](#6-commit-and-push-changes-to-github)


---

## 1 Create Hetzner user  

[Create user or login→](https://accounts.hetzner.com/login) 

![Pasos en Hetzner](./img/001_hetzner_user.png)

[←Index](#index)

## 2 Buy domain  
### Why buy "Real" domain?
We use **Let's Encrypt** to validate https  
Let's Encrypt does not work with IP address, it demands a register domain.  

A **real domain** give us:  
-**Security**: It guarantees you are the owner.  
-**Automatic update**: SSl certificates are vinculate with the domain, IPs can change.  
-**SSL Wildcard Certificate**: We use one SSL certificate in all subdomains.   
-**Unic identification**: Domain is unic, IPs can be shared and reused. 

- ❌ `https://5.75.244.206`  
- ✅ `https://tudominio.com`  

[Search and buy domain](https://www.hetzner.com/whois/) → 

![Steps in Hetzner](./img/001_buy_domain.png)
 
[Create DNS zone to domain](https://dns.hetzner.com/) →  
![DNS zone](./img/003_dns_zone.jpg)  
![DNS zone](./img/004_dns_zone.png)  

### Check
```bash
nslookup tonilogar.com  # Show IP
```

[←Index](#index)


## 3 Create GitHub repository

-***Create manual repository***:  
[Github](https://github.com/) →  
![Example](./img/005_git_gub_manual_repository.png)  
-***Create [README.md](../README.md)  file***.  
-***Create [.gitignore](../.gitignore) NODE***.  
-***Create [NOTICE](../NOTICE)***.  
-***Select license [LICENSE](../LICENSE)***.

[←Index](#index)



## 4 Create a GitHub Personal Access Token (PAT)

To interact with your repository from the command line (push, pull, etc.) securely, you will use a Personal Access Token (PAT) instead of your password.

1.  Go to your GitHub profile, then **Settings**.
2.  In the left menu, scroll down and click on **Developer settings**.
3.  Click on **Personal access tokens** and then on **Tokens (classic)**.
4.  Click on **Generate new token** and select **Generate new token (classic)**.
5.  Give your token a descriptive name (e.g., "Local Dev Machine").
6.  Set an expiration date (30 or 90 days is recommended).
7.  In the **Select scopes** section, check the **`repo`** box. This will give the token the necessary permissions to access and manage your repositories.
8.  Click **Generate token**.

> **Important!** Copy the token immediately and save it in a safe place (like a password manager). You will not be able to see it again after leaving the page.

!Generate PAT

←Index

## 5 Clone repository in local machine

Now, clone the repository to your local machine using the HTTPS URL you find in your GitHub repository.



```bash
git clone https://github.com/tonilogardev/web_project_hetzner_vps_server.git
```
Create SSH key to work with github without problems.  
Only generate these keys once, they work for all our GitHub repositories.

```bash
ssh-keygen -t ed25519 -a 100 -f "$env:USERPROFILE\.ssh\github\id_ed25519_github_tonilogardev" -C "tonilogardev@github.com"

```
```bash
Generating public/private ed25519 key pair.
Enter passphrase (empty for no passphrase): "contraseña"
Enter same passphrase again: "repetir contraseña"
Your identification has been saved in C:\Users\a.lopez.g\.ssh\github\id_ed25519_github_tonilogardev
Your public key has been saved in C:\Users\a.lopez.g\.ssh\github\id_ed25519_github_tonilogardev.pub
The key fingerprint is:
SHA256:/g7Xs16REGbD5nO1rF7ZTfDmJkP8w11jZ/8BSOFfULk tonilogardev@github.com
The key's randomart image is:
+--[ED25519 256]--+
|           o*....|
|          .+ooo..|
|          .+o..=o|
|           .+o=EB|
|        S    =B*X|
|       .   . .oBO|
|        o . + o++|
|         +   =  .|
|         .o.o    |
+----[SHA256]-----+

```

Active ssh-agent
[←Index](#index)
