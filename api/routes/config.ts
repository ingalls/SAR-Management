import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import { GenerateUpsert } from '@openaddresses/batch-generic';
import Config from '../lib/config.js';
import { StandardResponse, ServerResponse } from '../lib/types.js';

// Public config keys that don't require authentication
export const PublicConfigKeys = [
    'name',
    'frontend',
];

// Admin-only config keys
export const AdminConfigKeys = [
    'timezone',
    'slack_enabled',
    'slack_app_id',
    'slack_token',
    'slack_refresh',
];

export default async function router(schema: Schema, config: Config) {
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
                } catch (err) {
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
