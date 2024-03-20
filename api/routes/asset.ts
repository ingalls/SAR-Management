import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import busboy from 'busboy';
import Auth from '../lib/auth.js';
import Asset from '../lib/types/asset.js';
import Spaces from '../lib/aws/spaces.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();

    await schema.get('/asset', {
        name: 'List Assets',
        auth: 'user',
        group: 'Assets',
        description: 'List Assets',
        query: 'req.query.ListAssets.json',
        res: 'res.ListAssets.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(config, req);

            const list = await Asset.list(config.pool, req.query);
            return res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/asset/:assetid', {
        name: 'Get Asset',
        auth: 'user',
        group: 'Assets',
        description: 'Get single asset',
        params: Type.Object({
            assetid: Type.Integer()
        }),
        res: 'assets.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(config, req);

            const asset = await Asset.from(config.pool, req.params.assetid);
            return res.json(asset.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/asset/:assetid/raw', {
        name: 'Raw Asset',
        auth: 'user',
        group: 'Assets',
        description: 'Get single raw asset',
        params: Type.Object({
            assetid: Type.Integer()
        }),
    }, async (req, res) => {
        try {
            await Auth.is_auth(config, req, true);

            const asset = await Asset.from(config.pool, req.params.assetid);

            const raw = await spaces.get({
                Key: `assets/${asset.id}-${asset.name}`
            });

            res.contentType(asset.name);
            raw.Body.pipe(res);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/asset', {
        name: 'Create Asset',
        auth: 'user',
        group: 'Assets',
        description: 'Create a new asset',
        params: Type.Object({
            assetid: Type.Integer()
        }),
        res: 'assets.json'
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
            return Err.respond(err, res);
        }


        let asset;
        const assets = [];
        bb.on('file', async (fieldname, file, blob) => {
            asset = await Asset.generate(config.pool, {
                name: blob.filename
            });

            assets.push(spaces.upload({
                Key: `assets/${asset.id}-${asset.name}`,
                Body: file
            }));
        }).on('finish', async () => {
            try {
                if (!assets.length) throw new Err(400, null, 'No Asset Provided');

                await assets[0];
                await asset.commit({ storage: true });

                return res.json(asset.serialize());
            } catch (err) {
                Err.respond(err, res);
            }
        });

        return req.pipe(bb);
    });

    await schema.patch('/asset/:assetid', {
        name: 'Update Asset',
        auth: 'user',
        group: 'Assets',
        description: 'Update Asset',
        params: Type.Object({
            assetid: Type.Integer()
        }),
        body: 'req.body.PatchAsset.json',
        res: 'assets.json'
    }, async (req, res) => {
        await Auth.is_auth(config, req);

        try {
            const asset = await Asset.from(config.pool, req.params.assetid);
            await asset.commit(req.body);

            return res.json(asset.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/asset/:assetid', {
        name: 'Delete Asset',
        auth: 'user',
        group: 'Assets',
        description: 'Delete Asset',
        params: Type.Object({
            assetid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        await Auth.is_auth(config, req);

        try {
            const asset = await Asset.from(config.pool, req.params.assetid);

            await spaces.delete({
                Key: `assets/${asset.id}-${asset.name}`
            });

            await asset.delete();

            return res.json({
                status: 200,
                message: 'Asset Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
