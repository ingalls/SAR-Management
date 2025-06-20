import fs from 'node:fs';
import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import busboy from 'busboy';
import stream2buffer from '../lib/stream.js';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';
import sharp from 'sharp';
import Schema from '@openaddresses/batch-schema';
import { Readable } from 'node:stream';
import { StandardResponse } from '../lib/types.js';
import Config from '../lib/config.js';

const generic = fs.readFileSync(new URL('../lib/user.webp', import.meta.url));

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();

    await schema.get('/equipment/:equipmentid/profile', {
        name: 'Profile Pic',
        group: 'EquipmentProfile',
        description: 'Get a picture of equipment',
        query: Type.Object({
            token: Type.Optional(Type.String()),
            size: Type.String({
                default: 'full',
                enum: ['full', 'mini']
            })
        }),
        params: Type.Object({
            equipmentid: Type.Integer()
        }),
    }, async (req, res) => {
        try {
            await Auth.is_auth(config, req, { token: true });

            try {
                let Key = `equipment/${req.params.equipmentid}/`;
                if (req.query.size === 'full') Key = Key + 'profile.jpg';
                else if (req.query.size === 'mini') Key = Key + 'profile-mini.jpg';
                else Key = Key + 'profile.jpg';

                const raw = await spaces.get({ Key });
                const body = raw.Body as Readable;

                body.pipe(res);
            } catch (err) {
                // @ts-expect-error AWS Code
                if (err.Code === 'NoSuchKey') {
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

    await schema.post('/equipment/:equipmentid/profile', {
        name: 'Create Profile',
        group: 'EquipmentProfile',
        description: 'Create a new profile pic',
        params: Type.Object({
            equipmentid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        let bb;

        try {
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.MANAGE);

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
                        Key: `equipment/${req.params.equipmentid}/profile-orig-${blob.filename}`,
                        Body
                    });

                    const jpeg = await sharp(Body)
                        .jpeg({ mozjpeg: true })
                        .withMetadata()
                        .toBuffer();

                    await spaces.upload({
                        Key: `equipment/${req.params.equipmentid}/profile.jpg`,
                        Body: jpeg
                    });

                    const jpegmini = await sharp(Body)
                        .resize(100)
                        .jpeg({ mozjpeg: true })
                        .withMetadata()
                        .toBuffer();

                    await spaces.upload({
                        Key: `equipment/${req.params.equipmentid}/profile-mini.jpg`,
                        Body: jpegmini
                    });

                    res.json({
                        status: 200,
                        message: 'Profile Updated'
                    });
                } catch (err) {
                    Err.respond(err, res);
                }
            });

            return req.pipe(bb);
        }
    });
}
