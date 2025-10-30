terraform {
  required_version = ">= 1.13.4"

  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = ">= 1.0.0"
    }

    hetznerdns = {
      source  = "timohirt/hetznerdns"
      version = ">= 1.0.0"
    }
  }
}

provider "hcloud" {
  token = var.cloud_api_token
}

provider "hetznerdns" {
  apitoken = var.dns_api_token
}
