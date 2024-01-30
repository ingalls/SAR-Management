import { Pool } from '@openaddresses/batch-generic';
import * as pgtypes from './schema.js';

/**
 * @class
 */
export default class Config {
    silent: boolean;
    email: string;
    TimeZone: string;
    StackName: string;
    SigningSecret: string;
    URL: string;
    APIURL: URL;
    OrgName: string;
    MailGun: string;

    pool?: Pool<typeof pgtypes>;

    static env(args: {
        email?: string;
        silent?: boolean;
    } = {}) {
        const config = new Config();

        config.silent = args.silent || false;
        config.email = args.email || '';
        config.TimeZone = 'America/Denver';

        try {
            if (!process.env.AWS_DEFAULT_REGION) {
                if (!config.silent) console.error('ok - set env AWS_DEFAULT_REGION: us-east-1');
                process.env.AWS_DEFAULT_REGION = 'us-east-1';
            }

            if (!process.env.StackName || process.env.StackName === 'test') {
                if (!config.silent) console.error('ok - set env StackName: test');
                process.env.StackName = 'test';

                config.StackName = 'test';
                config.SigningSecret = 'mesa-sar-test-token';
                config.URL = 'http://localhost:8080/';
                config.APIURL = new URL('http://localhost:5000/');
                config.MailGun = process.env.MailGun || '';
            } else {
                if (!process.env.StackName) throw new Error('StackName env must be set');
                if (!process.env.SigningSecret) throw new Error('SigningSecret env must be set');
                if (!process.env.MailGun) throw new Error('MailGun env must be set');

                config.MailGun = process.env.MailGun;
                config.StackName = process.env.StackName;
                config.SigningSecret = process.env.SigningSecret;
            }
        } catch (err) {
            throw new Error(err);
        }

        return config;
    }
}
