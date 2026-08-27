INSERT INTO "server" ("key", "value", "public") VALUES
    ('local_login_enabled', 'true', true)
ON CONFLICT ("key") DO NOTHING;
