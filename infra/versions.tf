terraform {
  required_version = ">= 1.7.0"

  backend "s3" {
    bucket       = "henry-portfolio-terraform-state-767397760523"
    key          = "portfolio/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Application = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}
