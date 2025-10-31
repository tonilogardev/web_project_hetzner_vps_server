# Not everything is customizable...

## Index

1. [Create GitHub repository](#1-create-github-repository)  
2. [Clone repository in local machine](#2-clone-repository-in-local-machine)  
3. [Next steps](#3-next-steps)



---

## 1 Create GitHub repository

-***Create manual repository***:  
[Github](https://github.com/) →  
![Example](./img/005_git_gub_manual_repository.png)  
-***Create [README.md](../README.md)  file***.  
-***Create [.gitignore](../.gitignore) NODE***.  
-***Create [NOTICE](../NOTICE)***.  
-***Select license [LICENSE](../LICENSE)***.

[←Index](#index)


## 2 Clone repository in local machine

Now, clone the repository to your local machine using the HTTPS URL you find in your GitHub repository.


```bash
git clone https://github.com/tonilogardev/web_project_hetzner_vps_server.git
```

Create and move main_dev_pro branch.

```bash
git branch main_dev_pro
git checkout main_dev_pro
```

[←Index](#index)

## 3 Next steps

- [002_hetzner_login_domain_API_tokens](./002_hetzner_login_domain_API_tokens.md)
- [003_terraform](./003_terraform.md)
