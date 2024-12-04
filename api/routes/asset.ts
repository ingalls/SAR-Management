import Err from '@openaddresses/batch-error';
import { sql } from 'drizzle-orm';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { Readable } from 'node:stream';
import path from 'node:path';
import { Static, Type } from '@sinclair/typebox';
import busboy from 'busboy';
import Auth from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { Asset } from '../lib/schema.js';
import { StandardResponse, AssetResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();

    await schema.get('/asset', {
        name: 'List Assets',
        group: 'Assets',
        description: 'List Assets',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),rder: Type.Optional(Type.Enum(GenericListOrder)),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Asset)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(AssetResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_auth(config, req);

            const list = await config.models.Asset.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                `
            });

            res.json({
                total: list.total,
                items: list.items.map((asset) => {
                    return { asset_url: `/asset/${asset.id}${path.parse(asset.name).ext}`, ...asset };
                })
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/asset/:assetid', {
        name: 'Get Asset',
        group: 'Assets',
        description: 'Get single asset',
        params: Type.Object({
            assetid: Type.Integer()
        }),
        res: AssetResponse
    }, async (req, res) => {
        try {
            await Auth.is_auth(config, req);

            const asset = await config.models.Asset.from(req.params.assetid);
            res.json({ asset_url: `/asset/${asset.id}${path.parse(asset.name).ext}`, ...asset });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/asset/:assetid/raw', {
        name: 'Raw Asset',
        group: 'Assets',
        description: 'Get single raw asset',
        query: Type.Object({
            token: Type.Optional(Type.String()),
        }),
        params: Type.Object({
            assetid: Type.Integer()
        }),
    }, async (req, res) => {
        try {
            await Auth.is_auth(config, req, { token: true });

            const asset = await config.models.Asset.from(req.params.assetid);

            const raw = await spaces.get({
                Key: `assets/${asset.id}-${asset.name}`
            });

            res.contentType(asset.name);
            const body = raw.Body as Readable;
            body.pipe(res);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/asset', {
        name: 'Create Asset',
        group: 'Assets',
        description: 'Create a new asset',
        params: Type.Object({
            assetid: Type.Integer()
        }),
        res: AssetResponse
    }, async (req, res) => {
        let bb;

        try {
            await Auth.is_auth(config, req);

            if (req.headers['content-type']) {
                req.headers['content-type'] = req.headers['content-type'].split(',')[0];
            } else {
                throw new Err(400, null, 'Missing Content-Type Header');
            }

            bb = busboy({
                headers: req.headers,
                limits: {
                    files: 1
                }
            });
        } catch (err) {
            Err.respond(err, res);
        }


        const assets: Array<Promise<unknown>> = [];
        let asset: Static<typeof AssetResponse>;
        bb.on('file', async (fieldname, file, blob) => {
            const a = await config.models.Asset.generate({
                name: blob.filename
            });

            asset = {
                ...a,
                asset_url: `/asset/${asset.id}${path.parse(asset.name).ext}`,
            };

            assets.push(spaces.upload({
                Key: `assets/${asset.id}-${asset.name}`,
                Body: file
            }));
        }).on('finish', async () => {
            try {
                if (!assets.length) throw new Err(400, null, 'No Asset Provided');

                await assets[0];
                await config.models.Asset.commit(asset.id, { storage: true });

                res.json(asset);
            } catch (err) {
                Err.respond(err, res);
            }
        });

        return req.pipe(bb);
    });

    await schema.patch('/asset/:assetid', {
        name: 'Update Asset',
        group: 'Assets',
        description: 'Update Asset',
        params: Type.Object({
            assetid: Type.Integer()
        }),
        body: Type.Object({
            name: Type.Optional(Type.String())
        }),
        res: AssetResponse
    }, async (req, res) => {
        await Auth.is_auth(config, req);

        try {
            const asset = await config.models.Asset.commit(req.params.assetid, req.body);

            res.json({ asset_url: `/asset/${asset.id}${path.parse(asset.name).ext}`, ...asset });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.delete('/asset/:assetid', {
        name: 'Delete Asset',
        group: 'Assets',
        description: 'Delete Asset',
        params: Type.Object({
            assetid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        await Auth.is_auth(config, req);

        try {
            const asset = await config.models.Asset.from(req.params.assetid);

            await spaces.delete({
                Key: `assets/${asset.id}-${asset.name}`
            });

            await await config.models.Asset.delete(req.params.assetid);

            res.json({
                status: 200,
                message: 'Asset Deleted'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
