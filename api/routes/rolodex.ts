import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import { Rolodex, RolodexType } from '../lib/schema.js';
import { RolodexResponse, StandardResponse } from '../lib/types.js';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import RolodexAccess from '../lib/rolodex-access.js';
import Spaces from '../lib/aws/spaces.js';
import Config from '../lib/config.js';
import { GenericListOrder, Param } from '@openaddresses/batch-generic';
import Schema from '@openaddresses/batch-schema';

const sortable = Object.keys(Rolodex).filter((k) => !['location_geom', 'tags', 'agency_id', 'enableRLS'].includes(k));

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();

    await schema.get('/rolodex', {
        name: 'Get Rolodex',
        group: 'Rolodex',
        description: 'Get all rolodex items shared with the current user',
        query: Type.Object({
            fields: Type.Optional(Type.Array(Type.String({ enum: Object.keys(Rolodex) }))),
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'name', enum: sortable })),
            filter: Type.Optional(Type.String({ default: '' })),
            type: Type.Optional(Type.Enum(RolodexType)),
            tag: Type.Optional(Type.String()),
            agency: Type.Optional(Type.Integer()),
            archived: Type.Boolean({ default: false }),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(RolodexResponse)
        })
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.VIEW);

            const visible = await RolodexAccess.visibleWhere(config, user);

            const list = await config.models.Rolodex.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    (
                        name ~* ${req.query.filter}
                        OR organization ~* ${req.query.filter}
                        OR title ~* ${req.query.filter}
                        OR address ~* ${req.query.filter}
                        OR email ~* ${req.query.filter}
                        OR phone ~* ${req.query.filter}
                        OR remarks ~* ${req.query.filter}
                    )
                    AND archived = ${req.query.archived}
                    AND (${Param(req.query.type)}::TEXT IS NULL OR type = ${Param(req.query.type)}::TEXT)
                    AND (${Param(req.query.tag)}::TEXT IS NULL OR ${Param(req.query.tag)}::TEXT = ANY(ARRAY(SELECT json_array_elements_text(tags))))
                    AND (${Param(req.query.agency)}::INT IS NULL OR agencies_id @> ARRAY[${Param(req.query.agency)}::INT])
                    AND ${visible}
                `
            });

            res.json(list);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/rolodex/tags', {
        name: 'Rolodex Tags',
        group: 'Rolodex',
        description: 'List the distinct tags in use across rolodex items visible to the user',
        query: Type.Object({
            filter: Type.Optional(Type.String({ default: '' })),
            limit: Type.Optional(Type.Integer({ default: 25 })),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(Type.Object({
                tag: Type.String(),
                count: Type.Integer()
            }))
        })
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.VIEW);

            // Pull a generous page of visible items and aggregate their tags in-process
            // so the visibility rules stay in a single place
            const visible = await RolodexAccess.visibleWhere(config, user);
            const list = await config.models.Rolodex.augmented_list({
                limit: 1000,
                where: sql`archived = False AND ${visible}`
            });

            const counts = new Map<string, number>();
            for (const item of list.items) {
                for (const tag of item.tags) {
                    if (req.query.filter && !tag.toLowerCase().includes(req.query.filter.toLowerCase())) continue;
                    counts.set(tag, (counts.get(tag) || 0) + 1);
                }
            }

            const items = Array.from(counts.entries())
                .map(([tag, count]) => ({ tag, count }))
                .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
                .slice(0, req.query.limit || 25);

            res.json({ total: counts.size, items });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/rolodex/:rolodexid', {
        name: 'Get Rolodex Item',
        group: 'Rolodex',
        description: 'Get a rolodex item',
        params: Type.Object({
            rolodexid: Type.Integer(),
        }),
        res: RolodexResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.VIEW);

            const item = await config.models.Rolodex.augmented_from(req.params.rolodexid);
            await RolodexAccess.assertView(config, user, item);

            res.json(item);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/rolodex', {
        name: 'Create Rolodex Item',
        group: 'Rolodex',
        description: 'Create a new rolodex item',
        body: Type.Object({
            type: Type.Optional(Type.Enum(RolodexType)),
            name: Type.String({ minLength: 1 }),
            title: Type.Optional(Type.String()),
            organization: Type.Optional(Type.String()),
            remarks: Type.Optional(Type.String()),
            phone: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
            website: Type.Optional(Type.String()),
            address: Type.Optional(Type.String()),
            location_geom: Type.Optional(Type.Union([Type.Any(), Type.Null()])),
            tags: Type.Optional(Type.Array(Type.String())),
            agencies: Type.Optional(Type.Array(Type.Integer()))
        }),
        res: RolodexResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.MANAGE);

            const agencies = req.body.agencies || [];
            delete req.body.agencies;

            await RolodexAccess.assertShare(config, user, agencies);

            const item = await config.models.Rolodex.generate({
                ...req.body,
                tags: normalizeTags(req.body.tags),
                author: user.id
            });

            for (const agency_id of new Set(agencies)) {
                await config.models.RolodexAgency.generate({
                    rolodex_id: item.id,
                    agency_id
                });
            }

            res.json(await config.models.Rolodex.augmented_from(item.id));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/rolodex/:rolodexid', {
        name: 'Patch Rolodex',
        group: 'Rolodex',
        description: 'Update an existing rolodex item',
        params: Type.Object({
            rolodexid: Type.Integer(),
        }),
        body: Type.Object({
            type: Type.Optional(Type.Enum(RolodexType)),
            name: Type.Optional(Type.String({ minLength: 1 })),
            title: Type.Optional(Type.String()),
            organization: Type.Optional(Type.String()),
            remarks: Type.Optional(Type.String()),
            phone: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
            website: Type.Optional(Type.String()),
            address: Type.Optional(Type.String()),
            location_geom: Type.Optional(Type.Union([Type.Any(), Type.Null()])),
            tags: Type.Optional(Type.Array(Type.String())),
            archived: Type.Optional(Type.Boolean()),
            agencies: Type.Optional(Type.Array(Type.Integer()))
        }),
        res: RolodexResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.MANAGE);

            const existing = await config.models.Rolodex.augmented_from(req.params.rolodexid);
            await RolodexAccess.assertView(config, user, existing);

            const agencies = req.body.agencies;
            delete req.body.agencies;

            if (agencies !== undefined) {
                await RolodexAccess.assertShare(config, user, agencies);
            }

            const item = await config.models.Rolodex.commit(req.params.rolodexid, {
                ...req.body,
                ...(req.body.tags !== undefined ? { tags: normalizeTags(req.body.tags) } : {}),
                updated: sql`Now()`
            });

            if (agencies !== undefined) {
                await config.models.RolodexAgency.delete(sql`rolodex_id = ${item.id}`);

                for (const agency_id of new Set(agencies)) {
                    await config.models.RolodexAgency.generate({
                        rolodex_id: item.id,
                        agency_id
                    });
                }
            }

            res.json(await config.models.Rolodex.augmented_from(item.id));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/rolodex/:rolodexid', {
        name: 'Delete Rolodex',
        group: 'Rolodex',
        description: 'Delete a rolodex item along with any uploaded photo',
        params: Type.Object({
            rolodexid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.ADMIN);

            const existing = await config.models.Rolodex.augmented_from(req.params.rolodexid);
            await RolodexAccess.assertView(config, user, existing);

            if (existing.protected) {
                throw new Err(400, null, 'Protected rolodex items cannot be deleted, archive it instead');
            }

            await config.models.RolodexAgency.delete(sql`rolodex_id = ${existing.id}`);
            await config.models.Rolodex.delete(existing.id);

            if (existing.photo) {
                try {
                    await spaces.deleteRecursive({ Prefix: `rolodex/${existing.id}/` });
                } catch (err) {
                    console.error(`Failed to remove photo for rolodex/${existing.id}`, err);
                }
            }

            res.json({
                status: 200,
                message: 'Rolodex Item Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}

function normalizeTags(tags?: Array<string>): Array<string> {
    if (!tags) return [];

    const seen = new Set<string>();
    for (const tag of tags) {
        const clean = tag.trim();
        if (clean.length) seen.add(clean);
    }

    return Array.from(seen);
}
