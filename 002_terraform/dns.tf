locals {
  target_ipv4 = coalesce(var.existing_server_ipv4, hcloud_server.main.ipv4_address)
}

data "hetznerdns_zone" "domain" {
  name = var.domain_name
}

resource "hetznerdns_record" "root_a" {
  zone_id = data.hetznerdns_zone.domain.id
  name    = "@"
  type    = "A"
  value   = local.target_ipv4
  ttl     = 300
}

resource "hetznerdns_record" "subdomain_a" {
  for_each = toset(var.subdomains_to_register)

  zone_id = data.hetznerdns_zone.domain.id
  name    = each.key
  type    = "A"
  value   = local.target_ipv4
  ttl     = 300
}
