import {
    S3Client,
    ListObjectsV2Command,
    CopyObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import type { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const SOURCE = 'documents/';
const DEST = 'docs/';
const PREVIEW = '/preview.pdf';
const PREVIEW_EXT = '.preview.pdf';

const dryrun = process.argv.includes('--dry-run');
const remove = process.argv.includes('--delete');

if (!process.env.SPACES_BUCKET) {
    try {
        Object.assign(process.env, JSON.parse(String(fs.readFileSync(new URL('../../api/.env', import.meta.url)))));
        console.error('ok - loaded api/.env');
    } catch (err) {
        console.error(`ok - no api/.env file loaded: ${err}`);
    }
}

const bucket = process.argv.slice(2).find((arg) => !arg.startsWith('--')) || process.env.SPACES_BUCKET;

if (!bucket || !process.env.SPACES_KEY || !process.env.SPACES_SECRET) {
    console.error('Usage: SPACES_KEY=<key> SPACES_SECRET=<secret> node index.ts [bucket] [--dry-run] [--delete]');
    process.exit(1);
}

const s3 = new S3Client({
    forcePathStyle: false,
    endpoint: process.env.SPACES_ENDPOINT || 'https://sfo3.digitaloceanspaces.com',
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET
    }
});

type S3Object = {
    key: string;
    size: number;
    modified: string;
};

async function* listS3Objects(prefix: string): AsyncGenerator<S3Object> {
    let ContinuationToken: string | undefined = undefined;
    do {
        const resp: ListObjectsV2CommandOutput = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken,
            })
        );

        for (const obj of resp.Contents ?? []) {
            if (obj.Key) yield {
                key: obj.Key,
                size: obj.Size || 0,
                modified: (obj.LastModified || new Date()).toISOString()
            };
        }

        ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
    } while (ContinuationToken);
}

function quote(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
}

// Mirrors normalizePath & validateName in api/lib/doc.ts - names are trimmed and must be representable
function normalize(key: string): string | null {
    const segments = key.replace(/\/$/, '').split('/').map((segment) => segment.trim());

    const valid = segments.every((segment) => {
        return segment !== ''
            && segment !== '.'
            && segment !== '..'
            && ![...segment].some((char) => char.charCodeAt(0) < 32);
    });

    return valid ? segments.join('/') : null;
}

async function copy(from: string, to: string): Promise<void> {
    console.error(`ok - ${dryrun ? 'would copy' : 'copying'} ${from} to ${to}`);
    if (dryrun) return;

    await s3.send(new CopyObjectCommand({
        CopySource: `${bucket}/${from.split('/').map(encodeURIComponent).join('/')}`,
        Bucket: bucket,
        Key: to
    }));
}

// Original relative key (IE: Policies/Handbook.docx) => UUID - persisted so that the script can be safely re-run
const stateFile = new URL('./migration.json', import.meta.url);
const state: Record<string, string> = fs.existsSync(stateFile) ? JSON.parse(String(fs.readFileSync(stateFile))) : {};

function uuid(key: string): string {
    if (!state[key]) state[key] = randomUUID();
    return state[key];
}

function saveState(): void {
    if (!dryrun) fs.writeFileSync(stateFile, JSON.stringify(state, null, 4));
}

function location(key: string): { folder: string; name: string } {
    const segments = key.split('/');
    const name = segments.pop() as string;

    return {
        folder: segments.length ? `/${segments.join('/')}/` : '/',
        name
    };
}

async function main() {
    const objects = new Map<string, S3Object>();
    for await (const obj of listS3Objects(SOURCE)) {
        objects.set(obj.key.slice(SOURCE.length), obj);
    }

    console.error(`ok - found ${objects.size} objects in s3://${bucket}/${SOURCE}`);

    const files = new Map<string, { id: string; raw: string; obj: S3Object; artifacts: Array<{ ext: string; size: number }> }>();
    const dirs = new Set<string>();
    const skipped: string[] = [];
    const copied: string[] = [];

    function addDirs(segments: string[]) {
        for (let i = 1; i <= segments.length; i++) {
            dirs.add(segments.slice(0, i).join('/'));
        }
    }

    // Files & the folder markers that were created for empty folders
    for (const [raw, obj] of objects) {
        if (!raw) continue;

        const key = normalize(raw);

        if (key === null) {
            console.error(`not ok - skipping ${obj.key}: unsupported name`);
            skipped.push(obj.key);
        } else if (raw.endsWith('/')) {
            addDirs(key.split('/'));
        } else if (raw.endsWith(PREVIEW) && objects.has(raw.slice(0, -PREVIEW.length))) {
            // Generated preview of <file> stored at <file>/preview.pdf - copied alongside the file below
            continue;
        } else if (files.has(key)) {
            console.error(`not ok - skipping ${obj.key}: duplicate of ${files.get(key)?.obj.key} once names are trimmed`);
            skipped.push(obj.key);
        } else {
            files.set(key, { id: uuid(raw), raw, obj, artifacts: [] });
            addDirs(key.split('/').slice(0, -1));
        }
    }

    // The previous API used <file>/ as a folder for previews, anything else placed within it cannot be represented
    for (const key of [...files.keys()]) {
        if (!dirs.has(key)) continue;

        for (const other of [...files.keys(), ...dirs]) {
            if (!other.startsWith(`${key}/`)) continue;
            console.error(`not ok - skipping ${SOURCE}${other}: a file & folder share the name ${key}`);
            skipped.push(`${SOURCE}${other}`);
            files.delete(other);
            dirs.delete(other);
        }

        dirs.delete(key);
    }

    // UUIDs are recorded before anything is copied so that an interrupted run can be resumed
    for (const dir of dirs) uuid(`${dir}/`);
    saveState();

    for (const [key, file] of files) {
        const ext = path.extname(key).toLowerCase();

        try {
            await copy(file.obj.key, `${DEST}${file.id}${ext}`);
            copied.push(file.obj.key);

            const preview = objects.get(`${file.raw}${PREVIEW}`);
            if (preview) {
                await copy(preview.key, `${DEST}${file.id}${PREVIEW_EXT}`);
                copied.push(preview.key);
                file.artifacts.push({ ext: PREVIEW_EXT, size: preview.size });
            }
        } catch (err) {
            console.error(`not ok - failed to copy ${file.obj.key}:`, err);
            skipped.push(file.obj.key);
            files.delete(key);
        }
    }

    const migration = fs.createWriteStream(new URL('./migration.sql', import.meta.url));

    migration.write('BEGIN TRANSACTION;\n');

    for (const dir of [...dirs].sort()) {
        const { folder, name } = location(dir);

        migration.write(`INSERT INTO docs (id, type, path, name) VALUES (${quote(uuid(`${dir}/`))}::UUID, 'dir', ${quote(folder)}, ${quote(name)}) ON CONFLICT DO NOTHING;\n`);
    }

    for (const [key, file] of files) {
        const { folder, name } = location(key);

        migration.write(`INSERT INTO docs (id, type, path, name, size, created, updated, artifacts) VALUES (${quote(file.id)}::UUID, 'file', ${quote(folder)}, ${quote(name)}, ${file.obj.size}, ${quote(file.obj.modified)}, ${quote(file.obj.modified)}, ${quote(JSON.stringify(file.artifacts))}::JSONB) ON CONFLICT DO NOTHING;\n`);
    }

    migration.write('COMMIT;\n');

    await new Promise((resolve) => migration.end(resolve));

    if (remove && !dryrun) {
        for (const key of copied) {
            console.error(`ok - deleting ${key}`);
            await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        }
    }

    console.log(`ok - ${files.size} files, ${dirs.size} folders, ${skipped.length} skipped${dryrun ? ' (dry run - nothing was copied)' : ''}`);
    for (const key of skipped) console.log(`not ok - skipped ${key}`);
    console.log(`ok - migration file created at ${migration.path}`);
}

await main();
