# Encounter-Engine
A web-based application to aid DnD groups in visualizing combat situations

## Requirements

- Node v24.4.0
- Docker
- npm v11.4.2

## Local Development

To start this application locally, you'll first need a `app.env` file in the project root, to which you should add the following:

```bash
ENV=prod
REDIS_URL=redis://redis:6379
VITE_SOCKET_URL=
VITE_BACKEND_URL=
```

Then run:

```bash
docker-compose -f docker-compose.prod.yaml up --build
```

This will start the application in "production" mode. Currently, the dev docker-compose.yaml won't work due to nginx configurations in the frontend and backend.
