locals {
  common_tags = {
    Project        = var.project_name
    Environment    = var.environment
    ManagedBy      = "Terraform"
    awsApplication = var.application_arn
  }
}
