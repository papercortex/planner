resource "mongodbatlas_project" "papercortex" {
  name   = "papercortex"
  org_id = var.mongodbatlas_org_id
}

resource "mongodbatlas_cluster" "papercortex" {
  project_id = mongodbatlas_project.papercortex.id

  name                        = "papercortex_planner"
  provider_name               = "TENANT"
  backing_provider_name       = "AWS"
  provider_region_name        = var.mongodbatlas_region
  provider_instance_size_name = "M0"

  tags {
    key   = "Environment"
    value = var.environment
  }

  tags {
    key   = "Project"
    value = var.project_name
  }

  tags {
    key   = "ManagedBy"
    value = "Terraform"
  }
}

resource "mongodbatlas_database_user" "papercortex_user" {
  project_id         = mongodbatlas_project.papercortex.id
  username           = var.mongodbatlas_username
  password           = var.mongodbatlas_password
  auth_database_name = "admin"

  roles {
    role_name     = var.mongodbatlas_user_role_name
    database_name = "papercortex_planner"
  }
}

resource "mongodbatlas_project_ip_access_list" "all" {
  project_id = mongodbatlas_project.papercortex.id
  cidr_block = "0.0.0.0/0"
  comment    = "Whitelist access from ALL IPs."
}
