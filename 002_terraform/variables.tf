variable "cloud_api_token" {
  description = "Hetzner Cloud API token"
  type        = string
  sensitive   = true
}

variable "dns_api_token" {
  description = "Hetzner DNS API token"
  type        = string
  sensitive   = true
}

variable "ssh_public_key_path" {
  description = "Path to the local SSH public key (.pub) uploaded to Hetzner"
  type        = string
}

variable "ssh_key_name" {
  description = "Name assigned to the SSH key in Hetzner Cloud"
  type        = string
}

variable "server_name" {
  description = "Hostname for the VPS"
  type        = string
}

variable "server_image" {
  description = "Image slug for the VPS"
  type        = string
}

variable "server_type" {
  description = "Hetzner server type"
  type        = string
}

variable "server_location" {
  description = "Hetzner datacenter location"
  type        = string
}

variable "domain_name" {
  description = "Primary domain managed for SSL and DNS"
  type        = string
}

variable "admin_email" {
  description = "Admin email for Let's Encrypt notifications"
  type        = string
}

variable "docker_compose_version" {
  description = "Version of Docker Compose to install"
  type        = string
}

variable "subdomains_to_register" {
  description = "Subdomains to provision DNS records for"
  type        = list(string)
}

variable "existing_server_ipv4" {
  description = "Optional existing IPv4 address to reuse in DNS"
  type        = string
  default     = null
}

variable "project_label" {
  description = "Label applied to Hetzner resources for identification"
  type        = string
}
