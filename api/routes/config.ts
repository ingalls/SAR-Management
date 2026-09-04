import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import { GenerateUpsert } from '@openaddresses/batch-generic';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

// Public config keys that don't require authentication
export const PublicConfigKeys = [
    'name',
    'frontend',
    'oauth_enabled',
    'oauth_name',
    'local_login_enabled',

    // Branding - consumed by the login page, public application form & app header
    'brand_title',
    'brand_logo',
    'login_brand_enabled',
    'login_brand_logo',
    'login_background_enabled',
    'login_background_color',
    'login_username_label',
    'login_contact',
];

// Admin-only config keys
export const AdminConfigKeys = [
    'timezone',
    'slack_enabled',
    'slack_app_id',
    'slack_token',
    'slack_refresh',
    'oauth_client_id',
    'oauth_client_secret',
    'oauth_authorize_url',
    'oauth_token_url',
    'oauth_userinfo_url',
    'oauth_scopes',
];

export const BrandDefaults = {
    name: 'Search & Rescue',
    title: 'Team Management',
    username: 'Username or Email',
};

export const BrandResponse = Type.Object({
    name: Type.String({ description: 'Organisation Name' }),
    title: Type.String({ description: 'Application Title shown in the header' }),
    logo: Type.Optional(Type.String({ description: 'Base64 encoded PNG/SVG Logo' })),
    login: Type.Object({
        username: Type.String({ description: 'Label for the username field on the login page' }),
        contact: Type.Optional(Type.String({ description: 'Email address or URL for new account requests' })),
        brand: Type.Object({
            enabled: Type.String({
                description: 'Show or hide the large brand logo on the login page',
                enum: ['default', 'enabled', 'disabled']
            }),
            logo: Type.Optional(Type.String({ description: 'Base64 encoded PNG/SVG Large Brand Logo' })),
        }),
        background: Type.Object({
            enabled: Type.Boolean({ description: 'Enable a custom login page background colour' }),
            color: Type.Optional(Type.String()),
        }),
    }),
});

function isTrue(value: unknown): boolean {
    return value === true || value === 'true';
}

export default async function router(schema: Schema, config: Config) {
    await schema.get('/config/brand', {
        name: 'Get Branding',
        group: 'Config',
        description: 'Return the public branding configuration applied across the application',
        res: BrandResponse
    }, async (req, res) => {
        try {
            const keys = [
                'name',
                'brand_title',
                'brand_logo',
                'login_brand_enabled',
                'login_brand_logo',
                'login_background_enabled',
                'login_background_color',
                'login_username_label',
                'login_contact',
            ];

            const final: Record<string, string> = {};
            (await Promise.allSettled(keys.map((key) => {
                return config.models.Server.from(key);
            }))).forEach((k) => {
                if (k.status === 'rejected') return;
                if (k.value.value === null || k.value.value === undefined) return;
                final[k.value.key] = String(k.value.value);
            });

            const brandEnabled = ['default', 'enabled', 'disabled'].includes(final.login_brand_enabled)
                ? final.login_brand_enabled
                : 'default';

            res.json({
                name: final.name || BrandDefaults.name,
                title: final.brand_title || BrandDefaults.title,
                logo: final.brand_logo || undefined,
                login: {
                    username: final.login_username_label || BrandDefaults.username,
                    contact: final.login_contact || undefined,
                    brand: {
                        enabled: brandEnabled,
                        logo: final.login_brand_logo || undefined,
                    },
                    background: {
                        enabled: isTrue(final.login_background_enabled),
                        color: final.login_background_color || undefined,
                    },
                },
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/config', {
        name: 'Get Config',
        group: 'Config',
        description: 'Get multiple config values',
        query: Type.Object({
            keys: Type.String({
                description: 'Comma-separated list of config keys to retrieve'
            }),
        }),
        res: Type.Object({
            config: Type.Record(Type.String(), Type.Any()),
        })
    }, async (req, res) => {
        try {
            const keys = (req.query.keys || '').split(',').map(k => k.trim());
            
            // Check if all requested keys are public
            const allPublic = keys.every(k => PublicConfigKeys.includes(k));
            
            // If not all public, require authentication
            if (!allPublic) {
                await Auth.is_auth(config, req);
                
                // Check if any keys are admin-only
                const hasAdminKeys = keys.some(k => AdminConfigKeys.includes(k));
                if (hasAdminKeys) {
                    await Auth.is_admin(config, req);
                }
            }

            const result: Record<string, any> = {};
            
            for (const key of keys) {
                try {
                    const server = await config.models.Server.from(key);
                    result[key] = {
                        key: server.key,
                        value: server.value,
                        public: server.public
                    };
                } catch {
                    // Key doesn't exist, use default
                    result[key] = {
                        key: key,
                        value: '',
                        public: PublicConfigKeys.includes(key)
                    };
                }
            }

            res.json({ config: result });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.put('/config', {
        name: 'Update Config',
        group: 'Config',
        description: 'Update multiple config values',
        body: Type.Object({
            config: Type.Record(Type.String(), Type.Object({
                value: Type.Any(),
                public: Type.Boolean()
            }))
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const updates = req.body.config;
            
            for (const [key, data] of Object.entries(updates)) {
                await config.models.Server.generate({
                    key,
                    value: data.value,
                    public: data.public
                }, {
                    upsert: GenerateUpsert.UPDATE
                });
            }

            res.json({
                status: 200,
                message: 'Config updated successfully'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
