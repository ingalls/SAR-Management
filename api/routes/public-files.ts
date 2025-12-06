import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Spaces from '../lib/aws/spaces.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();

    await schema.get('/public/photos', {
        name: 'List Public Files',
        group: 'Public Files',
        description: 'List photos in the public S3 bucket',
        res: Type.Object({
            IsTruncated: Type.Optional(Type.Boolean()),
            Contents: Type.Optional(Type.Array(Type.Object({
                Key: Type.Optional(Type.String()),
                LastModified: Type.Optional(Type.String()),
                ETag: Type.Optional(Type.String()),
                Size: Type.Optional(Type.Integer())
            }))),
            Name: Type.Optional(Type.String()),
            Prefix: Type.Optional(Type.String()),
        })
    }, async (req, res) => {
        try {
            if (!process.env.SPACES_BUCKET_PUBLIC) {
                throw new Err(400, new Error('SPACES_BUCKET_PUBLIC not set'), 'SPACES_BUCKET_PUBLIC not set');
            }

            const list = await spaces.list({
                Bucket: process.env.SPACES_BUCKET_PUBLIC,
                Prefix: 'PublicPhotos/'
            });

            res.json({
                ...list,
                Contents: list.Contents ? list.Contents.map((file) => {
                    return {
                        Key: file.Key,
                        LastModified: file.LastModified ? file.LastModified.toISOString() : undefined,
                        ETag: file.ETag,
                        Size: file.Size
                    };
                }) : []
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
