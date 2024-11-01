# Project Name

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [DB Migration Settings](#db-migration-settings)
4. [Health Check API](#health-check-api)
5. [Contact](#contact)

## Introduction

Fruit management system where we will manage buy, sale, notification, analytics, and report

## Getting Started

Follow these steps to set up the project and get it running.

### Prerequisites

-   Docker
-   Node.js
-   Redis

### Opening Redis Bash

To access the Redis container's bash:

```bash
docker exec -it kissan_se_sidhe-redis-1 bash
```

## DB Migration Settings

To manage database migrations, follow these steps:

1. **Create a New Migration**

    ```bash
    npx db-migrate create create-users-table --sql-file
    ```

2. **Run Migrations**

    ```bash
    npx db-migrate up
    ```

3. **Revert Migrations**

    ```bash
    npx db-migrate down
    ```
4
    db-migrate create add-new-column
    

## Health Check API

To verify the health of the API, visit the following endpoint:

[http://localhost:8803/kss/api/health](http://localhost:8803/kss/api/health)

## Contact

For any questions or support, please contact:

-   **Name:** Rahul Joshi
-   **Email:** rahul.joshi@example.com
-   **GitHub:** [Your GitHub Profile](https://github.com/rahuljoshi7181)
