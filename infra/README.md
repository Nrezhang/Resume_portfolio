# AWS deployment

This stack deploys the React site to a private S3 bucket behind CloudFront. Requests under `/api/*` are routed to API Gateway and Lambda. Editable portfolio content is stored in DynamoDB. Google sign-in is limited to an email allowlist read from Secrets Manager. GitHub Actions assumes a narrowly scoped AWS role through GitHub OIDC; no long-lived AWS access key is stored in GitHub.

Terraform state is stored in the dedicated, private, versioned `henry-portfolio-terraform-state-767397760523` S3 bucket. That bootstrap bucket is intentionally separate from the site bucket and is not destroyed with the application stack.

## Prerequisites

- Terraform 1.7 or newer
- Node.js 22 and npm
- AWS CLI authenticated to the target account

## Deploy infrastructure

```bash
cd infra
terraform init
terraform apply
```

Create a Google OAuth web client first, then add its client ID and the approved editor emails to the admin secret. The Google client ID is not a password, but keeping the full sign-in configuration in the existing secret means deployments do not need a separate manual environment variable.

In Google Cloud, add every exact site origin under **Authorized JavaScript origins**: the deployed site (for example, `https://www.henryszhang.dev`), `http://127.0.0.1:3000`, and `http://localhost:3000` if you use that local URL. This sign-in flow uses a browser popup, so it does not need an authorized redirect URI.

```bash
aws secretsmanager put-secret-value \
  --secret-id "$(terraform output -raw admin_secret_arn)" \
  --secret-string '{"googleClientId":"your-google-oauth-client-id.apps.googleusercontent.com","allowedEmails":["henryszhang83@gmail.com","hsz2011@nyu.edu"]}'
```

Build and upload the first release:

```bash
cd ..
REACT_APP_API_URL=/api npm run build
aws s3 sync client/build/static "s3://$(terraform -chdir=infra output -raw site_bucket)/static" --delete --cache-control 'public,max-age=31536000,immutable'
aws s3 sync client/build "s3://$(terraform -chdir=infra output -raw site_bucket)" --delete --exclude 'static/*' --cache-control 'public,max-age=0,must-revalidate'
aws cloudfront create-invalidation --distribution-id "$(terraform -chdir=infra output -raw cloudfront_distribution_id)" --paths '/*'
```

## Configure GitHub Actions

Set these repository variables from Terraform outputs:

- `AWS_REGION` (normally `us-east-1`)
- `AWS_DEPLOY_ROLE_ARN` from `github_actions_role_arn`
- `AWS_SITE_BUCKET` from `site_bucket`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID` from `cloudfront_distribution_id`
- `AWS_LAMBDA_FUNCTION_NAME` from `lambda_function_name`
- `GOOGLE_CLIENT_ID` from the Google OAuth web client (required for `/admin` sign-in)

Pull requests run two independent CI jobs: **Frontend CI** runs the React tests and production build, while **Backend & infrastructure CI** runs API/content tests and Terraform validation. A push to `main` starts the same CI workflow; only after it succeeds does the separate **Deploy production** workflow upload the site and invalidate CloudFront.

## Content Operations

The DynamoDB `portfolio` record is the production source of truth. Seed it once from the checked-in portfolio content:

```bash
npm run seed:content
```

The seed command uses a conditional write, so rerunning it does not overwrite published edits. To intentionally replace the live document with the bundled default, run `npm run seed:content -- --force`.

For a portable backup, save the current record before a manual replacement:

```bash
aws dynamodb get-item --table-name henry-portfolio-content --key '{"id":{"S":"portfolio"}}' --consistent-read --output json > portfolio-content-backup.json
```

Restore that backup with `aws dynamodb put-item --table-name henry-portfolio-content --item file://portfolio-content-backup.json`. DynamoDB point-in-time recovery is also enabled by Terraform for database-level recovery. For application rollbacks, rerun the prior successful GitHub Actions deployment or restore the corresponding S3 object version.
