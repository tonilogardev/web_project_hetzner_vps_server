resource "hcloud_ssh_key" "main" {
  name       = var.ssh_key_name
  public_key = file(var.ssh_public_key_path)
}

resource "hcloud_server" "main" {
  name        = var.server_name
  image       = var.server_image
  server_type = var.server_type
  location    = var.server_location
  ssh_keys    = [hcloud_ssh_key.main.id]
  user_data = templatefile(
    "${path.module}/scripts/init_server.sh.tpl",
    {
      domain_name     = var.domain_name
      admin_email     = var.admin_email
      dns_api_token   = var.dns_api_token
      compose_version = var.docker_compose_version
    }
  )

  labels = {
    project    = var.project_label
    managed_by = "terraform"
  }

  lifecycle {
    ignore_changes = [user_data]
  }
}
