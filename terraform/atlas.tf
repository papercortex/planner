resource "mongodbatlas_cluster" "pc_planner" {
  project_id = var.mongodbatlas_project_id

  name                        = "${var.project_name}-${var.environment}-${local.app_name}"
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
    key   = "AppName"
    value = local.app_name
  }

  tags {
    key   = "ManagedBy"
    value = "Terraform"
  }
}

resource "mongodbatlas_database_user" "pc_planner_user" {
  project_id         = var.mongodbatlas_project_id
  username           = var.mongodbatlas_planner_username
  password           = var.mongodbatlas_planner_password
  auth_database_name = "admin"

  roles {
    role_name     = var.mongodbatlas_planner_user_role_name
    database_name = "${var.project_name}-${var.environment}-${local.app_name}"
  }
}

resource "mongodbatlas_project_ip_access_list" "all" {
  project_id = var.mongodbatlas_project_id
  cidr_block = "0.0.0.0/0"
  comment    = "Whitelist access from ALL IPs."
}
