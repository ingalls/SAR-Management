import Err from '@openaddresses/batch-error';
import busboy from 'busboy';
import fs from 'fs/promises';
import path from 'path';
import Auth from '../lib/auth.js';
import Asset from '../lib/types/asset.js';
import Spaces from '../lib/aws/spaces.js';

export default async function router(schema, config) {
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
            await Auth.is_auth(req);

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
        ':assetid': 'integer',
        res: 'assets.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

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
        ':assetid': 'integer'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req, true);

            const asset = await Asset.from(config.pool, req.params.assetid);

            const raw = await spaces.get({
                Key: `assets/${asset.id}-${asset.name}`,
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
        ':assetid': 'integer',
        res: 'assets.json'
    }, async (req, res) => {
        await Auth.is_auth(req);

        if (req.headers['content-type']) {
            req.headers['content-type'] = req.headers['content-type'].split(',')[0];
        } else {
            throw new Err(400, null, 'Missing Content-Type Header');
        }

        let bb;
        try {
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
        ':assetid': 'integer',
        body: 'req.body.PatchAsset.json',
        res: 'assets.json'
    }, async (req, res) => {
        await Auth.is_auth(req);

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
        ':assetid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        await Auth.is_auth(req);

        try {
            const asset = await Asset.from(config.pool, req.params.assetid);
            await asset.delete();

            await fs.unlink(new URL(`../assets/${asset.id}${path.parse(asset.name).ext}`, import.meta.url));

            return res.json({
                status: 200,
                message: 'Asset Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
