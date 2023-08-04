import fs from 'node:fs';
import Err from '@openaddresses/batch-error';
import busboy from 'busboy';
import Auth from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';
import sharp from 'sharp';

const generic = fs.readFileSync(new URL('../lib/user.webp', import.meta.url));

export default async function router(schema) {
    const spaces = new Spaces();

    await schema.get('/equipment/:equipmentid/profile', {
        name: 'Profile Pic',
        auth: 'user',
        group: 'EquipmentProfile',
        description: 'Get a picture of equipment',
        query: 'req.query.EquipmentProfile.json',
        ':equipmentid': 'integer'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req, true);

            try {
                let Key = `equipment/${req.params.equipmentid}/`;
                if (req.query.size === 'full') Key = Key + 'profile.jpg';
                else if (req.query.size === 'mini') Key = Key + 'profile-mini.jpg';
                else Key = Key + 'profile.jpg';

                const raw = await spaces.get({ Key });

                raw.Body.pipe(res);
            } catch (err) {
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

    await schema.post('/equipment/:equipmentid/profile', {
        name: 'Create Profile',
        auth: 'user',
        group: 'EquipmentProfile',
        description: 'Create a new profile pic',
        ':equipmentid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        let bb;

        try {
            await Auth.is_iam(req, 'Equipment:Manage');

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
            try {
                const Body = await stream2buffer(file);

                await spaces.upload({
                    Key: `equipment/${req.params.equipmentid}/profile-orig-${blob.filename}`,
                    Body
                });

                const jpeg = await sharp(Body)
                    .jpeg({ mozjpeg: true })
                    .toBuffer();

                await spaces.upload({
                    Key: `equipment/${req.params.equipmentid}/profile.jpg`,
                    Body: jpeg
                });

                const jpegmini = await sharp(Body)
                    .resize(100)
                    .jpeg({ mozjpeg: true })
                    .toBuffer();

                await spaces.upload({
                    Key: `equipment/${req.params.equipmentid}/profile-mini.jpg`,
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

function stream2buffer(stream) {
    return new Promise((resolve, reject) => {
        const _buf = [];
        stream.on('data', (chunk) => _buf.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(_buf)));
        stream.on('error', (err) => reject(err));
    });
}
