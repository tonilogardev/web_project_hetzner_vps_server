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
  default     = "./ssh/id_ed25519_vps_hetzner.pub"
}

variable "ssh_key_name" {
  description = "Name assigned to the SSH key in Hetzner Cloud"
  type        = string
  default     = "id_ed25519_vps_hetzner"
}

variable "server_name" {
  description = "Hostname for the VPS"
  type        = string
  default     = "docker-server"
}

variable "server_image" {
  description = "Image slug for the VPS"
  type        = string
  default     = "ubuntu-24.04"
}

variable "server_type" {
  description = "Hetzner server type"
  type        = string
  default     = "cx22"
}

variable "server_location" {
  description = "Hetzner datacenter location"
  type        = string
  default     = "fsn1"
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
  default     = "v2.24.0"
}

variable "subdomains_to_register" {
  description = "Subdomains to provision DNS records for"
  type        = list(string)
  default     = ["www", "satellite", "portfolio"]
}

variable "existing_server_ipv4" {
  description = "Optional existing IPv4 address to reuse in DNS"
  type        = string
  default     = null
}

variable "existing_server_ipv6" {
  description = "Optional existing IPv6 address to reuse in DNS"
  type        = string
  default     = null
}
