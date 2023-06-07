<h1 align=center>SAR Management</h1>

<p align=center>Search & Rescue Team Management Platform</p>

## Installation

1. Install NodeJS. A tool such as [Node Version Manager](https://github.com/nvm-sh/nvm) can proove
useful for making NodeJS version updates frictionless.

2. Install PostgreSQL

3. Create the `sar` database

```sql
CREATE DATABASE sar;
```

2. In the `api` directory, run:

```sh
npm install
```

3. Setup postgres connection - by default the server will attempt to connect to postgres using the following:

```
postgres://postgres@localhost:5432/sar
```

If you are not using the default path, set the postgres connection string by modifying and
running the following

```sh
export POSTGRES=postgres://postgres@localhost:5432/sar
```

4. Create the initial database schema

```sh
npx knex migrate:latest
```

5. Run the backend server with optional `.env` file

In the `api/` directory create a file with the name `.env` and the following
sample contents:
```json
{
    "API2PDF": "<Token>",
    "MailGun": "<Token>",
    "SPACES_KEY": "<Token>",
    "SPACES_SECRET": "<Token>",
    "SPACES_BUCKET": "<Bucket>"
}

```

```sh
npm run dev
```

If the server started successfully you should see the following message:
```
ok - http://localhost:4999
```

6. In a different tab or terminal, navigate to the `api/web` directory and run

```sh
npm install
```

7. Start the frontend UI builder via:

```
npm run serve
```

8. In your browser, navigate to `http://localhost:8080/`

Update to the frontend or backend code will cause the corresponding server to automatically restart.
