import S3 from '@aws-sdk/client-s3';
import Err from '@openaddresses/batch-error';
import { Upload } from "@aws-sdk/lib-storage";

interface SpacesInput {
    Bucket?: string;
    [key: string]: any;
}

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

    async list(params: SpacesInput): Promise<S3.ListObjectsCommandOutput> {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;

        try {
            return await this.client.send(new S3.ListObjectsCommand(params as S3.ListObjectsCommandInput));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to List Objects');
        }
    }

    async upload(params: SpacesInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;

        try {
            const upload = new Upload({ client: this.client, params: params as S3.PutObjectCommandInput });
            return await upload.done();
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Put Object');
        }
    }

    async put(params: SpacesInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.PutObjectCommand(params as S3.PutObjectCommandInput));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Put Object');
        }
    }

    async head(params: SpacesInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.HeadObjectCommand(params as S3.HeadObjectCommandInput));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Head Object');
        }
    }

    async get(params: SpacesInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.GetObjectCommand(params as S3.GetObjectCommandInput));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Get Object');
        }
    }

    async delete(params: SpacesInput) {
        if (!params.Bucket && process.env.SPACES_BUCKET) params.Bucket = process.env.SPACES_BUCKET;
        try {
            return await this.client.send(new S3.DeleteObjectCommand(params as S3.DeleteObjectCommandInput));
        } catch (err) {
            throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'Failed to Head Object');
        }
    }

    async deleteRecursive(params: SpacesInput) {
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

