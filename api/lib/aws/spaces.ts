import S3 from '@aws-sdk/client-s3';
import Err from '@openaddresses/batch-error';
import { Upload } from "@aws-sdk/lib-storage";

export default class Spaces {
    client: S3.S3Client;

    constructor() {
        this.client = Spaces.newclient();
    }

    static newclient() {
        // @ts-expect-error Typing
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

    async list(params: S3.ListObjectsCommandInput): Promise<S3.ListObjectsCommandOutput> {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;

        try {
            return await this.client.send(new S3.ListObjectsCommand(params));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to List Objects');
        }
    }

    async upload(params: S3.PutObjectCommandInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;

        try {
            const upload = new Upload({ client: this.client, params });
            return await upload.done();
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Put Object');
        }
    }

    async put(params: S3.PutObjectCommandInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.PutObjectCommand(params));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Put Object');
        }
    }

    async head(params: S3.HeadObjectCommandInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.HeadObjectCommand(params));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Head Object');
        }
    }

    async get(params: S3.GetObjectCommandInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.GetObjectCommand(params));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Get Object');
        }
    }

    async delete(params: S3.DeleteObjectCommandInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.DeleteObjectCommand(params));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Head Object');
        }
    }

    async deleteRecursive(params: { Bucket?: string; Prefix: string }) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;

        try {
            let ContinuationToken: string | undefined;

            do {
                const list = await this.client.send(new S3.ListObjectsV2Command({
                    Bucket: params.Bucket,
                    Prefix: params.Prefix,
                    ContinuationToken
                }));

                if (list.KeyCount) {
                    const deleted = await this.client.send(new S3.DeleteObjectsCommand({
                        Bucket: params.Bucket,
                        Delete: {
                            Objects: (list.Contents || []).map((item) => ({ Key: item.Key })),
                            Quiet: false,
                        },
                    }));

                    if (deleted.Errors) deleted.Errors.map((error) => console.log(`${error.Key} could not be deleted - ${error.Code}`));
                }

                ContinuationToken = list.NextContinuationToken;
            } while (ContinuationToken);
        } catch (err) {
            console.error(err);
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Recursive Delete');
        }
    }
}

