INSERT INTO "server" ("key", "value", "public") VALUES
    ('oauth_enabled', 'false', true),
    ('oauth_name', 'Single Sign-On', true),
    ('oauth_client_id', '', false),
    ('oauth_client_secret', '', false),
    ('oauth_authorize_url', '', false),
    ('oauth_token_url', '', false),
    ('oauth_userinfo_url', '', false),
    ('oauth_scopes', 'openid email profile', false)
ON CONFLICT ("key") DO NOTHING;
