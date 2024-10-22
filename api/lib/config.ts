import { Pool } from '@openaddresses/batch-generic';
import * as pgtypes from './schema.js';
import Models from './models.js';

export type ConfigOpts = {
    email: boolean;
    silent: boolean;
    TimeZone: string;
    StackName: string;
    SigningSecret: string;
    URL: string;
    APIURL: URL;
    MailGun: string;
    pool: Pool<typeof pgtypes>;
    models: Models;

    OrgName?: string;
}

/**
 * @class
 */
export default class Config {
    silent: boolean;
    email: boolean;
    TimeZone: string;
    StackName: string;
    SigningSecret: string;
    URL: string;
    APIURL: URL;
    OrgName: string;
    MailGun: string;
    models: Models;

    pool: Pool<typeof pgtypes>;

    constructor(opts: ConfigOpts) {
        this.email = opts.email;
        this.silent = opts.silent;
        this.TimeZone = opts.TimeZone;
        this.StackName = opts.StackName;
        this.SigningSecret = opts.SigningSecret;
        this.URL = opts.URL;
        this.APIURL = opts.APIURL;
        this.MailGun = opts.MailGun;
        this.pool = opts.pool;
        this.models = opts.models;

        this.OrgName = opts.OrgName || 'Search and Rescue';
        
    }

    static async env(args: {
        email?: boolean;
        silent?: boolean;
        postgres?: string;
    } = {}): Promise<Config> {
        let config: Config;

        if (!process.env.AWS_DEFAULT_REGION) {
            if (!args.silent) console.error('ok - set env AWS_DEFAULT_REGION: us-east-1');
            process.env.AWS_DEFAULT_REGION = 'us-east-1';
        }

        const pool = await Pool.connect(process.env.POSTGRES || args.postgres || 'postgres://postgres@localhost:5432/sar', pgtypes, {
            ssl: process.env.StackName === 'test' ? undefined  : { rejectUnauthorized: false },
            migrationsFolder: (new URL('../migrations', import.meta.url)).pathname
        })

        const models = new Models(pool);
        const OrgName = (await models.Server.from('name')).value;

        if (!process.env.StackName || process.env.StackName === 'test') {
            if (!args.silent) console.error('ok - set env StackName: test');
            process.env.StackName = 'test';

            config = new Config({
                silent: args.silent || false,
                email: args.email || false,
                TimeZone: 'America/Denver',
                StackName: 'test',
                SigningSecret: 'mesa-sar-test-token',
                URL: 'http://localhost:8080/',
                APIURL: new URL('http://localhost:5000/'),
                MailGun: process.env.MailGun || '',
                OrgName, pool, models
            });

        } else {
            if (!process.env.StackName) throw new Error('StackName env must be set');
            if (!process.env.SigningSecret) throw new Error('SigningSecret env must be set');
            if (!process.env.MailGun) throw new Error('MailGun env must be set');

            const BASE_URL = (await models.Server.from('frontend')).value;

            const APIURL = new URL(((await models.Server.from('frontend')).value));

            config = new Config({
                silent: args.silent || false,
                email: args.email || false,
                TimeZone: 'America/Denver',
                StackName: process.env.StackName,
                SigningSecret: process.env.SigningSecret,
                URL: BASE_URL,
                APIURL: APIURL,
                MailGun: process.env.MailGun,
                OrgName, pool, models
            });
        }

        return config;
    }
}
