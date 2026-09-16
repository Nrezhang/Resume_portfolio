variable "aws_region" {
  description = "AWS region for regional resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefix used for resource names."
  type        = string
  default     = "henry-portfolio"
}

variable "github_repository" {
  description = "GitHub repository in owner/name form allowed to deploy."
  type        = string
  default     = "Nrezhang/Resume_portfolio"
}

variable "github_branch" {
  description = "Branch allowed to assume the deployment role."
  type        = string
  default     = "main"
}
