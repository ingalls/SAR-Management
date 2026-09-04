import Err from '@openaddresses/batch-error';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import { Type } from '@sinclair/typebox';
import { Mission } from '../lib/schema.js';
import { sql, SQL } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, MissionResponse } from '../lib/types.js';
import { PartialAsset } from '../lib/models/Mission.js';
import Report from '../lib/report.js';
import API2PDF from 'api2pdf';
import { streamCSV } from '../lib/csv.js';

/**
 * Parse a comma separated list of IDs from a query param
 */
function parseIds(name: string, value?: string): number[] {
    if (!value) return [];

    return value.split(',').map((v) => v.trim()).filter((v) => v.length).map((v) => {
        const id = Number(v);
        if (!Number.isInteger(id)) throw new Err(400, null, `${name} must be a comma separated list of integer IDs`);
        return id;
    });
}

/**
 * Escape a user supplied search string for use in an ILIKE pattern
 */
function likePattern(filter: string): string {
    return `%${filter.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

function idArray(ids: number[]): SQL {
    return sql`ARRAY[${sql.join(ids.map((id) => sql`${Param(id)}::INT`), sql`, `)}]`;
}

/**
 * Build the WHERE clause for the mission list from the filter query params.
 * Operates on the augmented mission row so array & JSON aggregates
 * (users, teams_id, tags_id, agencies_id, incidents, people) are available
 */
export function missionFilter(query: {
    filter?: string;
    assigned?: number;
    user?: string;
    team?: string;
    tag?: string;
    agency?: string;
    status?: string;
    geom?: boolean;
    incidents?: boolean;
    people?: boolean;
    users_min?: number;
    users_max?: number;
    start?: string;
    end?: string;
}): SQL {
    const conditions: SQL[] = [];

    if (query.filter && query.filter.trim().length) {
        const pattern = likePattern(query.filter.trim());
        conditions.push(sql`(
            title ILIKE ${pattern}
            OR body ILIKE ${pattern}
            OR location ILIKE ${pattern}
            OR externalid ILIKE ${pattern}
        )`);
    }

    if (query.assigned !== undefined) {
        conditions.push(sql`users @> ARRAY[${Param(query.assigned)}::INT]`);
    }

    // Attendees: every listed user must have attended
    const users = parseIds('user', query.user);
    if (users.length) conditions.push(sql`users @> ${idArray(users)}`);

    // Teams, Tags & Agencies: any match
    const teams = parseIds('team', query.team);
    if (teams.length) conditions.push(sql`teams_id && ${idArray(teams)}`);

    const tags = parseIds('tag', query.tag);
    if (tags.length) conditions.push(sql`tags_id && ${idArray(tags)}`);

    const agencies = parseIds('agency', query.agency);
    if (agencies.length) conditions.push(sql`agencies_id && ${idArray(agencies)}`);

    if (query.status) conditions.push(sql`status = ${query.status}`);

    if (query.geom === true) conditions.push(sql`location_geom IS NOT NULL`);
    else if (query.geom === false) conditions.push(sql`location_geom IS NULL`);

    if (query.incidents === true) conditions.push(sql`(incidents IS NOT NULL AND json_array_length(incidents) > 0)`);
    else if (query.incidents === false) conditions.push(sql`(incidents IS NULL OR json_array_length(incidents) = 0)`);

    if (query.people === true) conditions.push(sql`(people IS NOT NULL AND json_array_length(people) > 0)`);
    else if (query.people === false) conditions.push(sql`(people IS NULL OR json_array_length(people) = 0)`);

    if (query.users_min !== undefined) conditions.push(sql`coalesce(array_length(users, 1), 0) >= ${Param(query.users_min)}::INT`);
    if (query.users_max !== undefined) conditions.push(sql`coalesce(array_length(users, 1), 0) <= ${Param(query.users_max)}::INT`);

    if (query.start) conditions.push(sql`start_ts >= ${Param(query.start)}::TIMESTAMP`);
    if (query.end) conditions.push(sql`end_ts < ${Param(query.end)}::TIMESTAMP + INTERVAL '1 day'`);

    if (!conditions.length) return sql`TRUE`;

    return sql.join(conditions, sql` AND `);
}

export default async function router(schema: Schema, config: Config) {
    await schema.get('/mission', {
        name: 'List Missions',
        group: 'Mission',
        description: 'Get all missions for the Org',
        query: Type.Object({
            format: Type.String({ enum: ['csv', 'json'], default: 'json' }),
            fields: Type.Optional(Type.Array(Type.String({ enum: Object.keys(Mission) }))),
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            start: Type.Optional(Type.String({ description: 'Only missions starting on or after this date' })),
            end: Type.Optional(Type.String({ description: 'Only missions ending on or before this date' })),
            assigned: Type.Optional(Type.Integer({ description: 'Only missions attended by this User ID' })),
            user: Type.Optional(Type.String({ description: 'Comma separated User IDs - only missions attended by all of these users' })),
            team: Type.Optional(Type.String({ description: 'Comma separated Team IDs - only missions assigned to any of these teams' })),
            tag: Type.Optional(Type.String({ description: 'Comma separated Tag IDs - only missions with any of these tags' })),
            agency: Type.Optional(Type.String({ description: 'Comma separated Agency IDs - only missions shared with any of these agencies' })),
            status: Type.Optional(Type.String({ description: 'Only missions with this status' })),
            geom: Type.Optional(Type.Boolean({ description: 'true: only missions with a map location, false: only missions without' })),
            incidents: Type.Optional(Type.Boolean({ description: 'true: only missions with related incidents, false: only missions without' })),
            people: Type.Optional(Type.Boolean({ description: 'true: only missions with recorded subjects, false: only missions without' })),
            users_min: Type.Optional(Type.Integer({ description: 'Only missions with at least this many attendees' })),
            users_max: Type.Optional(Type.Integer({ description: 'Only missions with at most this many attendees' })),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Mission)})),
            filter: Type.Optional(Type.String({ default: '', description: 'Case insensitive search across title, body, location & mission number' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(MissionResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);

            const whereClause = missionFilter(req.query);

            if (req.query.format === 'csv') {
                await streamCSV(
                    res,
                    'sar-missions.csv',
                    req.query.fields || ['title', 'externalid', 'location', 'start_ts', 'end_ts'],
                    (page, limit) => config.models.Mission.augmented_list({
                        page, limit,
                        order: req.query.order,
                        sort: req.query.sort,
                        where: whereClause
                    })
                );
            } else {
                res.json(await config.models.Mission.augmented_list({
                    limit: req.query.limit,
                    page: req.query.page,
                    order: req.query.order,
                    sort: req.query.sort,
                    where: whereClause
                }));
            }
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/mission', {
        name: 'Create Mission',
        group: 'Mission',
        description: 'Create a new mission',
        body: Type.Object({
            title: Type.String(),
            externalid: Type.Optional(Type.String()),
            body: Type.String(),
            start_ts: Type.String(),
            end_ts: Type.String(),
            location: Type.String(),
            location_geom: Type.Optional(Type.Any()),
            assigned: Type.Optional(Type.Array(Type.Object({
                role: Type.String(),
                confirmed: Type.Boolean(),
                uid: Type.Integer()
            }))),
            teams: Type.Optional(Type.Array(Type.Integer())),
            tags: Type.Optional(Type.Array(Type.Integer())),
            assets: Type.Optional(Type.Array(Type.Integer())),
            agencies: Type.Optional(Type.Array(Type.Integer()))
        }),
        res: MissionResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.MANAGE);

            if (new Date(req.body.start_ts) >= new Date(req.body.end_ts)) {
                throw new Err(400, null, 'Start Date must be before End Date');
            }

            const assigned = req.body.assigned;
            delete req.body.assigned;
            const teams = req.body.teams;
            delete req.body.teams;
            const tags = req.body.tags;
            delete req.body.tags;
            const assets = req.body.assets;
            delete req.body.assets;
            const agencies = req.body.agencies;
            delete req.body.agencies;

            // Validate that at least one agency belongs to the user
            if (agencies && agencies.length > 0) {
                const userAgencies = await config.models.UserAgency.listByUser(user.id);
                const userAgencyIds = userAgencies.items.map(ua => ua.agency_id);
                const hasOwnAgency = agencies.some(agencyId => userAgencyIds.includes(agencyId));
                
                if (!hasOwnAgency) {
                    throw new Err(400, null, 'At least one agency must belong to you');
                }
            } else {
                throw new Err(400, null, 'At least one agency is required');
            }

            const mission = await config.models.Mission.generate({
                ...req.body,
                author: user.id
            });

            if (assigned) {
                for (const a of assigned) {
                    await config.models.MissionAssigned.generate({
                        mission_id: mission.id,
                        role: a.role,
                        confirmed: a.confirmed,
                        uid: a.uid
                    });
                }
            }

            if (teams) {
                for (const a of teams) {
                    await config.models.MissionTeam.generate({
                        mission_id: mission.id,
                        team_id: a
                    });
                }
            }

            if (tags) {
                for (const a of tags) {
                    await config.models.MissionTagAssigned.generate({
                        mission_id: mission.id,
                        tag_id: a
                    });
                }
            }

            if (assets) {
                for (const a of assets) {
                    await config.models.MissionAsset.generate({
                        mission_id: mission.id,
                        asset_id: a
                    });
                }
            }

            if (agencies) {
                for (const a of agencies) {
                    await config.models.MissionAgency.generate({
                        mission_id: mission.id,
                        agency_id: a
                    });
                }
            }

            res.json(await config.models.Mission.augmented_from(mission.id));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/mission/:missionid', {
        name: 'Update Mission',
        group: 'Mission',
        description: 'Update an existing mission',
        body: Type.Object({
            title: Type.Optional(Type.String()),
            externalid: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            start_ts: Type.Optional(Type.String()),
            end_ts: Type.Optional(Type.String()),
            location: Type.Optional(Type.String()),
            location_geom: Type.Optional(Type.Any()),
            teams: Type.Optional(Type.Array(Type.Integer())),
            tags: Type.Optional(Type.Array(Type.Integer())),
            assets: Type.Optional(Type.Array(Type.Integer())),
            agencies: Type.Optional(Type.Array(Type.Integer()))
        }),
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: MissionResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.MANAGE);

            if (req.body.start_ts || req.body.end_ts) {
                const mission = await config.models.Mission.from(req.params.missionid);
                const start = req.body.start_ts ? new Date(req.body.start_ts) : new Date(mission.start_ts);
                const end = req.body.end_ts ? new Date(req.body.end_ts) : new Date(mission.end_ts);

                if (start >= end) throw new Err(400, null, 'Start Date must be before End Date');
            }

            const teams = req.body.teams;
            delete req.body.teams;
            const tags = req.body.tags;
            delete req.body.tags;
            const assets = req.body.assets;
            delete req.body.assets;
            const agencies = req.body.agencies;
            delete req.body.agencies;

            // Validate agencies if provided in PATCH request
            if (agencies !== undefined) {
                if (!agencies || agencies.length === 0) {
                    throw new Err(400, null, 'At least one agency is required');
                }
                
                const userAgencies = await config.models.UserAgency.listByUser(user.id);
                const userAgencyIds = userAgencies.items.map(ua => ua.agency_id);
                const hasOwnAgency = agencies.some(agencyId => userAgencyIds.includes(agencyId));
                
                if (!hasOwnAgency) {
                    throw new Err(400, null, 'At least one agency must belong to you');
                }
            }

            const mission = await config.models.Mission.commit(req.params.missionid, req.body);

            if (teams) {
                await config.models.MissionTeam.delete(sql`mission_id = ${mission.id}`)

                for (const a of teams) {
                    await config.models.MissionTeam.generate({
                        mission_id: mission.id,
                        team_id: a
                    });
                }
            }

            if (tags) {
                await config.models.MissionTagAssigned.delete(sql`mission_id = ${mission.id}`)

                for (const a of tags) {
                    await config.models.MissionTagAssigned.generate({
                        mission_id: mission.id,
                        tag_id: a
                    });
                }
            }

            if (assets) {
                await config.models.MissionAsset.delete(sql`mission_id = ${mission.id}`)

                for (const a of assets) {
                    if (!a) continue;
                    await config.models.MissionAsset.generate({
                        mission_id: mission.id,
                        asset_id: a
                    });
                }
            }

            if (agencies) {
                await config.models.MissionAgency.delete(sql`mission_id = ${mission.id}`)

                for (const a of agencies) {
                    await config.models.MissionAgency.generate({
                        mission_id: mission.id,
                        agency_id: a
                    });
                }
            }

            res.json(await config.models.Mission.augmented_from(req.params.missionid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/mission/:missionid', {
        name: 'Delete Mission',
        group: 'Mission',
        description: 'Remove an existing mission',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.ADMIN);

            await config.models.MissionAssigned.delete(sql`mission_id = ${req.params.missionid}`);
            await config.models.MissionTeam.delete(sql`mission_id = ${req.params.missionid}`);
            await config.models.MissionTagAssigned.delete(sql`mission_id = ${req.params.missionid}`);
            await config.models.MissionAsset.delete(sql`mission_id = ${req.params.missionid}`);
            await config.models.MissionAgency.delete(sql`mission_id = ${req.params.missionid}`);

            await config.models.Mission.delete(req.params.missionid);

            res.json({
                status: 200,
                message: 'Mission Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/mission/stats', {
        name: 'Mission Stats',
        group: 'Mission',
        description: 'Get mission statistics',
        res: Type.Object({
            year: Type.Record(Type.String(), Type.Integer()),
            month: Type.Record(Type.String(), Type.Integer())
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);

            const stats = await config.models.Mission.pool.execute(sql`
                SELECT
                    EXTRACT(YEAR FROM start_ts) as year,
                    TO_CHAR(start_ts, 'YYYY-MM') as month,
                    COUNT(*) as count
                FROM missions
                GROUP BY 1, 2
            `);

            const response = {
                year: {} as Record<string, number>,
                month: {} as Record<string, number>
            };

            for (const row of stats) {
                const year = String(row.year);
                const month = String(row.month);
                const count = parseInt(String(row.count));

                if (!response.year[year]) response.year[year] = 0;
                response.year[year] += count;

                response.month[month] = count;
            }

            res.json(response);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/mission/:missionid/assets', {
        name: 'Get Mission Assets',
        group: 'Mission',
        description: 'Get a single missions assets',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: Type.Object({
            assets: Type.Array(PartialAsset)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);
            res.json({
                assets: await config.models.Mission.assets(req.params.missionid)
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/mission/:missionid/export', {
        name: 'Export Mission',
        group: 'Mission',
        description: 'Export a mission to a different format',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        query: Type.Object({
            format: Type.String({ enum: ['pdf'] }),
            token: Type.Optional(Type.String())
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW, { token: true });
            const mission = await config.models.Mission.augmented_from(req.params.missionid);

            if (req.query.format === 'pdf') {
                 if (!process.env.API2PDF) throw new Err(424, null, 'PDF Conversion not configured');
                 const convert = new API2PDF(process.env.API2PDF);

                 const users = await config.models.MissionAssigned.augmented_list({
                    limit: 1000,
                    where: sql`mission_id = ${req.params.missionid}`
                 });

                 const html = Report.mission(mission, users.items);
                 const pdf = await convert.chromeHtmlToPdf(html) as API2PDF.Api2PdfResult;
                 return res.redirect(pdf.FileUrl as string);
            }

            throw new Err(400, null, 'Unsupported Format');
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/mission/:missionid', {
        name: 'Get Mission',
        group: 'Mission',
        description: 'Get a single mission',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: MissionResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);

            const mission = await config.models.Mission.augmented_from(req.params.missionid);
            if (!mission.users) mission.users = [];

            res.json(mission);
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
