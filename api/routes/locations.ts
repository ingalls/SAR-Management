import Err from '@openaddresses/batch-error';
import Location from '../lib/views/location.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/location', {
        name: 'List Locations',
        group: 'Locations',
        description: 'Return a combined list of mission/training locations to populate the location search box',
        query: 'req.query.ListLocations.json',
        res: 'res.ListLocations.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');
            await Auth.is_iam(config, req, 'Training:View');

            res.json(await Location.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
