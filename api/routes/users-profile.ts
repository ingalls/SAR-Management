import fs from 'node:fs';
import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import { Readable } from 'node:stream';
import stream2buffer from '../lib/stream.js';
import busboy from 'busboy';
import Auth from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';
import sharp from 'sharp';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

const generic = fs.readFileSync(new URL('../lib/user.webp', import.meta.url));

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();

    await schema.get('/user/:userid/profile', {
        name: 'Profile Pic',
        group: 'UserProfile',
        description: 'Get users profile picture',
        query: Type.Object({
            token: Type.Optional(Type.String()),
            size: Type.String({
                default: 'full',
                enum: ['full', 'mini']
            })
        }),
        params: Type.Object({
            userid: Type.Integer(),
        }),
    }, async (req, res) => {
        try {
            await Auth.is_auth(config, req, { token: true });

            try {
                let Key = `users/${req.params.userid}/`;
                if (req.query.size === 'full') Key = Key + 'profile.jpg';
                else if (req.query.size === 'mini') Key = Key + 'profile-mini.jpg';
                else Key = Key + 'profile.jpg';

                const raw = await spaces.get({ Key });

                const body = raw.Body as Readable;
                body.pipe(res);
            } catch (err) {
                // @ts-expect-error AWS Error Code
                if (err.Code === 'NoSuchKey') {
                    res.writeHead(200, {
                        'Content-Type': 'image/webp'
                    });
                    res.write(generic);
                    return res.end();
                } else {
                    throw err;
                }
            }
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/user/:userid/profile', {
        name: 'Create Profile',
        group: 'Assets',
        description: 'Create a new profile pic',
        params: Type.Object({
            userid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        let bb;

        try {
            const user = await Auth.is_auth(config, req);

            if (user.access !== 'admin' && user.id !== req.params.userid) {
                throw new Err(401, null, 'Cannot change anther User\'s profile');
            }

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


        bb.on('file', async (fieldname, file, blob) => {
            const Body = await stream2buffer(file);

            try {
                await spaces.upload({
                    Key: `users/${req.params.userid}/profile-orig-${blob.filename}`,
                    Body
                });

                const jpeg = await sharp(Body)
                    .jpeg({ mozjpeg: true })
                    .withMetadata()
                    .toBuffer();

                await spaces.upload({
                    Key: `users/${req.params.userid}/profile.jpg`,
                    Body: jpeg
                });

                const jpegmini = await sharp(Body)
                    .resize(100)
                    .jpeg({ mozjpeg: true })
                    .withMetadata()
                    .toBuffer();

                await spaces.upload({
                    Key: `users/${req.params.userid}/profile-mini.jpg`,
                    Body: jpegmini
                });

                return res.json({
                    status: 200,
                    message: 'Profile Updated'
                });
            } catch (err) {
                Err.respond(err, res);
            }
        });

        return req.pipe(bb);
    });
}
