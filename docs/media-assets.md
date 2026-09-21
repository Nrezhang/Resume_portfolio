# Portfolio media assets

Portfolio content may use a portable `media` field. The app accepts either a bundled asset key or a deployed URL, so content does not need a component change when an image moves to S3.

```json
{
  "id": "work-1",
  "company": "Example Company",
  "media": {
    "logo": {
      "src": "https://www.henryszhang.dev/media/experience/example-company.svg",
      "darkSrc": "https://www.henryszhang.dev/media/experience/example-company-dark.svg",
      "alt": "Example Company logo"
    }
  }
}
```

`media.logo.src` is used in both the compact homepage experience cards and the full experience view through the shared media resolver. `darkSrc` is optional; use `"darkMode": "invert"` only when a logo has no usable dark variant. For the local seed data, the `src` value is a catalog key such as `treasury`; deployed content can use a CloudFront URL directly.

## Deployment approach

Today, images imported by React are copied into the production build and uploaded to the private site S3 bucket. CloudFront serves them through the site domain; there is no public S3 bucket and no direct browser upload.

For a small, stable set of images, upload versioned files under `media/` with the normal site deployment and store CloudFront URLs in DynamoDB content. For owner-managed uploads later, add an authenticated API route that validates type and size, returns a short-lived presigned S3 upload URL, and writes only the resulting CloudFront URL into the portfolio record. Keep original uploads in a private `uploads/` prefix or a dedicated private bucket; expose resized, optimized derivatives through CloudFront. Do not store public S3 URLs, credentials, or arbitrary upload data in DynamoDB.
