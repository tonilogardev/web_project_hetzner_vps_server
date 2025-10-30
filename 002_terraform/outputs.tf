output "server_ipv4" {
  description = "IPv4 address assigned to the Hetzner server"
  value       = hcloud_server.main.ipv4_address
}

output "server_ipv6" {
  description = "IPv6 address assigned to the Hetzner server"
  value       = hcloud_server.main.ipv6_address
}

output "dns_zone_id" {
  description = "ID of the Hetzner DNS zone managed by Terraform"
  value       = data.hetznerdns_zone.domain.id
}

output "configured_subdomains" {
  description = "Subdomains with DNS records managed by Terraform"
  value       = var.subdomains_to_register
}
