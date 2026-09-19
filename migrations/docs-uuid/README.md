## Documents UUID Migration Guide

Documents were previously stored on S3 using their folder structure & file name as the object key
(`documents/<folder>/<file>`), which made them impossible to search and expensive to move.

Documents are now stored in a flat structure, named only by a UUID (`docs/<uuid><ext>`), with the
folder structure, file names & PDF previews tracked in the `docs` database table.

The migration only ever copies objects - everything under `documents/` is left untouched unless
`--delete` is passed, so the previous version can be rolled back to at any time.

- Perform a backup of the database & the S3 `documents/` directory before proceeding with the migration.
- Deploy the new version using your preferred method - migration `0040_docs` creates the `docs` table.
  The Documents page will be empty until the following steps are complete.
- Install the migration script dependencies by running:

```bash
npm install
```

- Provide the same `SPACES_KEY`, `SPACES_SECRET` & `SPACES_BUCKET` environment variables used by the API.
  If `SPACES_BUCKET` is not set, `api/.env` is loaded when present.
- Preview the migration - nothing is written to S3:

```bash
node index.ts --dry-run
```

- Run the migration script:

```bash
node index.ts
```

- Apply the resultant `migration.sql` output to your database.

```bash
psql "$POSTGRES" -f migration.sql
```

The script records the UUID assigned to each object in `migration.json`, so it can be re-run safely -
objects that were already copied keep their UUID and `migration.sql` can be applied more than once.

- Once the Documents page has been verified, remove the previous objects by re-running with `--delete`,
  or by deleting the `documents/` prefix from the bucket.
