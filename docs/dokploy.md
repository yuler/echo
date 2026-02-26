# Dokploy Setup Guide

## Dockerfile Services

- Create a `echo` application with two services using the **Dockerfile** provider.
- Configure the Docker Image from GitHub Container Registry:
  - **Image:** `ghcr.io/yuler/echo:main`
  - **Registry:** `https://ghcr.io`
  - **Username:** `yuler`
  - **Password/Token:** `ghp_xxx`

### Volume Configuration

Configure the volume for `/rails/storage`:

| Mount Type | Volume Name | Mount Path      |
| :--------- | :---------- | :-------------- |
| VOLUME     | echo        | /rails/storage  |

### Job Service Configuration

For the job service, update the **Run Command** to:
```bash
./bin/jobs
```

## Workflows

See [dokploy.yml](./.github/workflows/dokploy.yml) for more info.
