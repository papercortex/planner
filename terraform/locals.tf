locals {
  app_name           = "planner"
  amplify_branch     = "main"
  amplify_repository = "https://github.com/papercortex/planner.git"
  common_tags = {
    Project        = var.project_name
    AppName        = local.app_name
    Environment    = var.environment
    ManagedBy      = "Terraform"
    awsApplication = var.application_arn
  }
}
