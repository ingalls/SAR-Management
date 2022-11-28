import Err from '@openaddresses/batch-error';
import busboy from 'busboy';
import fs from 'fs';
import path from 'path';
import Auth from '../lib/auth.js';
import Asset from '../lib/types/asset.js';

export default async function router(schema, config) {
    await schema.get('/asset', {
        name: 'List Assets',
        auth: 'public',
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
        auth: 'public',
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


        const assets = [];
        bb.on('file', async (fieldname, file, blob) => {
            const asset = await Asset.generate(config.pool, {
                name: blob.filename
            });

            assets.push(asset.upload(file));
        }).on('finish', async () => {
            try {
                if (!assets.length) throw new Err(400, null, 'No Asset Provided');

                const asset = await assets[0];
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
        req: 'req.body.PatchAsset.json',
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

            fs.unlinkSync(new URL(`../assets/${asset.id}${path.parse(asset.name).ext}`, import.meta.url));

            return res.json({
                status: 200,
                message: 'Asset Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
