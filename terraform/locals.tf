locals {
  app_name = "planner"
  common_tags = {
    Project        = var.project_name
    AppName        = local.app_name
    Environment    = var.environment
    ManagedBy      = "Terraform"
    awsApplication = var.application_arn
  }
}
