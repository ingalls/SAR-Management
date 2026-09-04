import fs from 'node:fs';
import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import busboy from 'busboy';
import stream2buffer from '../lib/stream.js';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import RolodexAccess from '../lib/rolodex-access.js';
import Spaces from '../lib/aws/spaces.js';
import sharp from 'sharp';
import Schema from '@openaddresses/batch-schema';
import { Readable } from 'node:stream';
import { sql } from 'drizzle-orm';
import { StandardResponse } from '../lib/types.js';
import Config from '../lib/config.js';

const generic = fs.readFileSync(new URL('../lib/user.webp', import.meta.url));

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();

    await schema.get('/rolodex/:rolodexid/profile', {
        name: 'Rolodex Photo',
        group: 'RolodexProfile',
        description: 'Get the photo attached to a rolodex item',
        query: Type.Object({
            token: Type.Optional(Type.String()),
            size: Type.String({
                default: 'full',
                enum: ['full', 'mini']
            })
        }),
        params: Type.Object({
            rolodexid: Type.Integer()
        }),
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.VIEW, { token: true });

            const item = await config.models.Rolodex.augmented_from(req.params.rolodexid);
            await RolodexAccess.assertView(config, user, item);

            try {
                let Key = `rolodex/${req.params.rolodexid}/`;
                if (req.query.size === 'mini') Key = Key + 'profile-mini.jpg';
                else Key = Key + 'profile.jpg';

                const raw = await spaces.get({ Key });
                const body = raw.Body as Readable;

                res.writeHead(200, {
                    'Content-Type': 'image/jpeg'
                });
                body.pipe(res);
            } catch (err) {
                // @ts-expect-error AWS Code
                if (err.Code === 'NoSuchKey' || (err.original && err.original.Code === 'NoSuchKey')) {
                    res.writeHead(200, {
                        'Content-Type': 'image/webp'
                    });
                    res.write(generic);
                    res.end();
                } else {
                    throw err;
                }
            }
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/rolodex/:rolodexid/profile', {
        name: 'Upload Rolodex Photo',
        group: 'RolodexProfile',
        description: 'Attach or replace the photo of a rolodex item',
        params: Type.Object({
            rolodexid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        let bb;

        try {
            const user = await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.MANAGE);

            const item = await config.models.Rolodex.augmented_from(req.params.rolodexid);
            await RolodexAccess.assertView(config, user, item);

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

        if (bb) {
            bb.on('file', async (fieldname, file, blob) => {
                try {
                    const Body = await stream2buffer(file);

                    await spaces.upload({
                        Key: `rolodex/${req.params.rolodexid}/profile-orig-${blob.filename}`,
                        Body
                    });

                    const jpeg = await sharp(Body)
                        .rotate()
                        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
                        .jpeg({ mozjpeg: true })
                        .toBuffer();

                    await spaces.upload({
                        Key: `rolodex/${req.params.rolodexid}/profile.jpg`,
                        Body: jpeg,
                        ContentType: 'image/jpeg'
                    });

                    const jpegmini = await sharp(Body)
                        .rotate()
                        .resize({ width: 300, height: 300, fit: 'cover' })
                        .jpeg({ mozjpeg: true })
                        .toBuffer();

                    await spaces.upload({
                        Key: `rolodex/${req.params.rolodexid}/profile-mini.jpg`,
                        Body: jpegmini,
                        ContentType: 'image/jpeg'
                    });

                    await config.models.Rolodex.commit(req.params.rolodexid, {
                        photo: true,
                        updated: sql`Now()`
                    });

                    res.json({
                        status: 200,
                        message: 'Photo Updated'
                    });
                } catch (err) {
                    Err.respond(err, res);
                }
            });

            return req.pipe(bb);
        }
    });

    await schema.delete('/rolodex/:rolodexid/profile', {
        name: 'Delete Rolodex Photo',
        group: 'RolodexProfile',
        description: 'Remove the photo attached to a rolodex item',
        params: Type.Object({
            rolodexid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.MANAGE);

            const item = await config.models.Rolodex.augmented_from(req.params.rolodexid);
            await RolodexAccess.assertView(config, user, item);

            await spaces.deleteRecursive({ Prefix: `rolodex/${req.params.rolodexid}/` });

            await config.models.Rolodex.commit(req.params.rolodexid, {
                photo: false,
                updated: sql`Now()`
            });

            res.json({
                status: 200,
                message: 'Photo Removed'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
