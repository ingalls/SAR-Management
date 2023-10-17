import S3 from '@aws-sdk/client-s3';
import Err from '@openaddresses/batch-error';
import { Upload } from "@aws-sdk/lib-storage";

export default class Spaces {
    constructor() {
        this.client = Spaces.newclient();
    }

    static newclient() {
        return new S3.S3Client({
            forcePathStyle: false,
            endpoint: "https://sfo3.digitaloceanspaces.com",
            region: "us-east-1",
            credentials: {
                accessKeyId: process.env.SPACES_KEY,
                secretAccessKey: process.env.SPACES_SECRET
            }
        });
    }

    async list(params) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;

        return await this.client.send(new S3.ListObjectsCommand(params));
    } catch (err) {
        throw new Err(400, err, 'Failed to Head Object');
    }

    async upload(params) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;

        try {
            const upload = new Upload({ client: this.client, params });
            return await upload.done();
        } catch (err) {
            throw new Err(400, err, 'Failed to Put Object');
        }
    }

    async put(params) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.PutObjectCommand(params));
        } catch (err) {
            throw new Err(400, err, 'Failed to Put Object');
        }
    }

    async head(params) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.HeadObjectCommand(params));
        } catch (err) {
            throw new Err(400, err, 'Failed to Head Object');
        }
    }

    async get(params) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.GetObjectCommand(params));
        } catch (err) {
            throw new Err(400, err, 'Failed to Get Object');
        }
    }

    async delete(params) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.DeleteObjectCommand(params));
        } catch (err) {
            throw new Err(400, err, 'Failed to Head Object');
        }
    }

    async deleteRecursive(params) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;

        try {
            let ContinuationToken ;

            do {
                const list = await s3.send(new S3.ListObjectsV2Command({
                    Bucket: bucket,
                    Prefix: location,
                    ContinuationToken: token
                }));

                if (list.KeyCount) {
                    const deleteCommand = s3.send(new S3.DeleteObjectsCommand({
                        Bucket: bucket,
                        Delete: {
                            Objects: list.Contents.map((item) => ({ Key: item.Key })),
                            Quiet: false,
                        },
                    }));

                    if (deleted.Errors) deleted.Errors.map((error) => console.log(`${error.Key} could not be deleted - ${error.Code}`));
                }

                ContinuationToken = list.NextContinuationToken;
            } while (ContinuationToken);
        } catch (err) {
            throw new Err(400, err, 'Failed to Head Object');
        }
    }
}

