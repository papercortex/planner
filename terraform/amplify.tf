data "aws_iam_policy_document" "amplify_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["amplify.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "amplify" {
  name                = "${var.project_name}-${var.environment}-${local.app_name}-amplify-assume-role"
  assume_role_policy  = join("", data.aws_iam_policy_document.amplify_assume_role.*.json)
  managed_policy_arns = ["arn:aws:iam::aws:policy/AdministratorAccess"]
  tags                = local.common_tags
}

resource "aws_amplify_app" "planner" {
  name                     = "${var.project_name}-${var.environment}-${local.app_name}"
  repository               = local.amplify_repository
  access_token             = var.github_token
  enable_branch_auto_build = true

  build_spec = <<-EOT
  version: 1
  frontend:
    phases:
      preBuild:
        commands:
          - npm ci
      build:
        commands:
          - npm run build
    artifacts:
      baseDirectory: .next
      files:
        - '**/*'
    cache:
      paths:
        - node_modules/**/*
  EOT

  environment_variables = {
    "MONGODB_URI" = mongodbatlas_cluster.pc_planner.connection_strings.0.standard_srv
  }

  iam_service_role_arn = aws_iam_role.amplify.arn

  lifecycle {
    ignore_changes = [platform, custom_rule]
  }

  tags = local.common_tags
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.planner.id
  branch_name = local.amplify_branch

  lifecycle {
    ignore_changes = [framework]
  }

  tags = local.common_tags
}

resource "aws_amplify_webhook" "main" {
  app_id      = aws_amplify_app.planner.id
  branch_name = aws_amplify_branch.main.branch_name

  # NOTE: We trigger the webhook via local-exec so as to kick off the first build on creation of Amplify App.
  provisioner "local-exec" {
    command = "curl -X POST -d {} '${aws_amplify_webhook.main.url}&operation=startbuild' -H 'Content-Type:application/json'"
  }
}
