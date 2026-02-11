# Database

## Change the adatper

The default use `sqlite`, you can change through `DATABASE_ADAPTER` change it.

```bash
# RAILS_ENV=production r db:schema:dump
RAILS_ENV=production r db:migrate
DB_ADAPTER=mysql  ./bin/rails db:reset
DB_ADAPTER=postgres ./bin/rails db:reset
```

# PostgreSQL Setup Guide

- Update the database driver in [Gemfile](../Gemfile) to `pg`
- Modify [.env.example] to include PostgreSQL environment variables
- Use [config/database.postgres.yml](../config/database.postgres.yml) to overwrite `database.yml`
- Use [Dockerfile.postgres](../Dockerfile.postgres) to overwrite `Dockerfile`
- Regenerate the database schema for PostgreSQL

- Use [compose.example.postgres.yml](../compose.example.postgres.yml) for Docker Compose deployment
