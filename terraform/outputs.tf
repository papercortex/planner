output "amplify_app_id" {
  value = aws_amplify_app.planner.id
}

output "amplify_app_url" {
  value = aws_amplify_app.planner.default_domain
}
