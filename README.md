# Overview
`S3n Browser` is a lightweight, intuitive web application for accessing and managing content in Amazon S3 storage. It provides content editors with a straightforward interface to browse, preview, upload, download, and remove files without requiring technical AWS knowledge.

# Features

### Direct Image Preview
`S3n Browser` enables users to view images directly in the browser without downloading files first. This feature:
- Streamlines the workflow for content editors managing large image collections
- Eliminates the need to download files for basic visual inspection
- Saves time and bandwidth when reviewing visual assets

### Integrated Pre-signed URL Generation
The application can integrate with an external signing service to generate pre-signed URLs directly from S3 object keys:
- Eliminates manual URL conversion processes for end users
- Removes the need to manually obtain bucket URLs and perform URL swapping
- Works with third-party signing services (such as secured AWS Lambda functions)
- Simplifies the process of sharing S3 content with external applications

# Scope and Limitations

This application is designed specifically for content editors with limited technical expertise. To maintain simplicity, several deliberate limitations have been implemented:

- The browser can only access the single S3 bucket specified in the `S3_BUCKET_NAME` environment variable
- Multiple bucket browsing and renaming capabilities are not supported
- Advanced functionality like editing file metadata or ACLs is not available

The interface focuses exclusively on essential content management tasks:
- Uploading and downloading files
- Deleting files
- Viewing images directly in the browser
- Generating and copying pre-signed URLs for sharing content in other applications

These design choices create a straightforward experience that allows non-technical users to efficiently manage their S3 content without unnecessary complexity.

# Environment Configuration

The following environment variables can be configured for the S3n Browser:

| Variable | Description                                                                                                                                         | Required | Default |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------|
| S3_ACCESS_KEY_ID | AWS access key ID for S3 authentication                                                                                                             | Yes | None |
| S3_SECRET_ACCESS_KEY | AWS secret access key for S3 authentication                                                                                                         | Yes | None |
| S3_BUCKET_NAME | Name of the S3 bucket to browse                                                                                                                     | Yes | None |
| S3_ENDPOINT_URL | Custom endpoint URL for S3 (useful for MinIO or other S3-compatible services). <br/> Also used to configure the remote hostname for Next.js images. | No | None |
| S3_REGION | AWS region for the S3 bucket                                                                                                                        | No | us-east-1 |
| S3_FORCE_PATH_STYLE | Whether to use path-style URLs for S3 requests                                                                                                      | No | true |
| S3_FILE_UPLOAD_LIMIT | Maximum file size for uploads in bytes                                                                                                              | No | None |
| S3_SIGNED_URL_EXPIRES | Number of seconds a signed URL is valid for                                                                                                         | No | 900 (15 minutes) |
| SIGNING_SERVICE_URL | URL of external service for generating signed URLs (useful for private storages)                                                                    | No | None |

# Security Considerations
Our implementation is deployed behind a reverse proxy that handles authentication and authorization. This ensures that only authorized users can access the S3n Browser application. The application itself does not manage user authentication, relying on the reverse proxy to enforce security policies.

If built-in authentication is added in the future, it will be implemented as an optional feature with careful consideration given to preserving the application's streamlined interface and content management focus.

# Deployment
S3n Browser is built with Next.js. For up-to-date deployment guidance, see the [Next.js deployment documentation](https://nextjs.org/docs/app/getting-started/deploying).

### Docker Deployment
A `Dockerfile` is included for straightforward containerized deployment.

### Docker Compose
The repository includes a sample `compose.yml` file with example environment variables. 