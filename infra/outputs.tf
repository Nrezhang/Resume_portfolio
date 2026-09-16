output "site_url" {
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
  description = "CloudFront URL for the portfolio."
}

output "site_bucket" {
  value       = aws_s3_bucket.site.id
  description = "S3 bucket receiving built frontend files."
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.site.id
  description = "CloudFront distribution invalidated by CI/CD."
}

output "github_actions_role_arn" {
  value       = aws_iam_role.github_deploy.arn
  description = "AWS role assumed by GitHub Actions through OIDC."
}

output "admin_secret_arn" {
  value       = aws_secretsmanager_secret.admin.arn
  description = "Secret to populate with an email/password JSON object."
}

output "lambda_function_name" {
  value       = aws_lambda_function.api.function_name
  description = "Lambda function updated by CI/CD."
}

output "domain_validation_records" {
  description = "DNS CNAME records required to validate the CloudFront certificate."
  value = {
    for option in aws_acm_certificate.site.domain_validation_options : option.domain_name => {
      name  = option.resource_record_name
      type  = option.resource_record_type
      value = option.resource_record_value
    }
  }
}
