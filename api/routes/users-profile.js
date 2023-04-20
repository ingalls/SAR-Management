import fs from 'node:fs';
import Err from '@openaddresses/batch-error';
import busboy from 'busboy';
import Auth from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';
import sharp from 'sharp';

const generic = fs.readFileSync(new URL('../lib/user.webp', import.meta.url));

export default async function router(schema, config) {
    const spaces = new Spaces();

    await schema.get('/user/:userid/profile', {
        name: 'Profile Pic',
        auth: 'user',
        group: 'UserProfile',
        description: 'Get users profile picture',
        ':userid': 'integer'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req, true);

            try {
                const raw = await spaces.get({
                    Key: `users/${req.params.userid}/profile.jpg`
                });

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

    await schema.post('/user/:userid/profile', {
        name: 'Create Profile',
        auth: 'user',
        group: 'Assets',
        description: 'Create a new profile pic',
        ':userid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        let bb;

        try {
            await Auth.is_auth(req);

            if (req.auth.access !== 'admin' && req.auth.id !== req.params.userid) {
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


        const uploads = [];
        bb.on('file', async (fieldname, file, blob) => {
            const Body = await stream2buffer(file);

            uploads.push(async () => {
                console.error(Body)

                await spaces.upload({
                    Key: `users/${req.params.userid}/profile-orig-${blob.filename}`,
                    Body
                });

                const jpeg = await sharp(Body)
                    .jpeg({ mozjpeg: true })
                    .toBuffer()

                await spaces.upload({
                    Key: `users/${req.params.userid}/profile.jpg`,
                    Body: jpeg
                });

                const jpegmini = await sharp(Body)
                    .resize(100)
                    .jpeg({ mozjpeg: true })
                    .toBuffer()

                await spaces.upload({
                    Key: `users/${req.params.userid}/profile-mini.jpg`,
                    Body: jpegmini
                });
            })
        }).on('finish', async () => {
            try {
                if (!uploads.length) throw new Err(400, null, 'No Upload Provided');

                await uploads[0]();

                return res.json({
                    status: 200,
                    message: 'Profile Updated'
                })
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
        stream.on("data", (chunk) => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", (err) => reject(err));
    });
}
