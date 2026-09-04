import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Rolodex, RolodexAgency, Agency, RolodexType } from '../schema.js';
import { sql, eq, is, asc, desc, max, SQL } from 'drizzle-orm';

export const PartialRolodexAgency = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    logo: Type.String(),
    created: Type.String(),
    updated: Type.String()
});

export const AugmentedRolodex = Type.Object({
    id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    archived: Type.Boolean(),
    protected: Type.Boolean(),
    type: Type.Enum(RolodexType),
    name: Type.String(),
    title: Type.String(),
    organization: Type.String(),
    phone: Type.Union([Type.Null(), Type.String()]),
    email: Type.Union([Type.Null(), Type.String()]),
    website: Type.String(),
    address: Type.String(),
    location_geom: Type.Union([Type.Null(), Type.Any()]),
    remarks: Type.String(),
    tags: Type.Array(Type.String()),
    photo: Type.Boolean(),
    author: Type.Union([Type.Null(), Type.Integer()]),
    agencies: Type.Array(PartialRolodexAgency),
    agencies_id: Type.Array(Type.Integer())
});

export default class RolodexModel extends Modeler<typeof Rolodex> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Rolodex);
    }

    /**
     * Subquery aggregating the agencies an item has been shared with
     */
    private rootAgencies() {
        return this.pool
            .select({
                agencies_rolodex_id: max(RolodexAgency.rolodex_id).as('agencies_rolodex_id'),
                agencies_id: sql<Array<number>>`coalesce(array_agg(agency.id), '{}'::INT[])`.as('agencies_id'),
                agencies: sql<Array<Static<typeof PartialRolodexAgency>>>`coalesce(json_agg(json_build_object(
                    'id', agency.id,
                    'name', agency.name,
                    'logo', agency.logo,
                    'created', agency.created,
                    'updated', agency.updated
                )), '[]'::JSON)`.as('agencies'),
            })
            .from(Agency)
            .innerJoin(RolodexAgency, eq(Agency.id, RolodexAgency.agency_id))
            .groupBy(RolodexAgency.rolodex_id)
            .as("root_agencies");
    }

    private normalize(item: Record<string, unknown>): Static<typeof AugmentedRolodex> {
        if (!item.agencies_id) item.agencies_id = [];
        if (!item.agencies) item.agencies = [];
        if (!item.tags) item.tags = [];
        return item as Static<typeof AugmentedRolodex>;
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedRolodex>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const RootAgencies = this.rootAgencies();

        const Root = this.pool
            .select({
                id: Rolodex.id,
                created: Rolodex.created,
                updated: Rolodex.updated,
                archived: Rolodex.archived,
                protected: Rolodex.protected,
                type: Rolodex.type,
                name: Rolodex.name,
                title: Rolodex.title,
                organization: Rolodex.organization,
                phone: Rolodex.phone,
                email: Rolodex.email,
                website: Rolodex.website,
                address: Rolodex.address,
                location_geom: Rolodex.location_geom,
                remarks: Rolodex.remarks,
                tags: Rolodex.tags,
                photo: Rolodex.photo,
                author: Rolodex.author,
                agencies: RootAgencies.agencies,
                agencies_id: RootAgencies.agencies_id,
            })
            .from(Rolodex)
            .leftJoin(RootAgencies, eq(Rolodex.id, RootAgencies.agencies_rolodex_id))
            .orderBy(orderBy)
            .as('root');

        const pgres = await this.pool.select({
            count: sql<string>`count(*) OVER()`.as('count'),
            id: Root.id,
            created: Root.created,
            updated: Root.updated,
            archived: Root.archived,
            protected: Root.protected,
            type: Root.type,
            name: Root.name,
            title: Root.title,
            organization: Root.organization,
            phone: Root.phone,
            email: Root.email,
            website: Root.website,
            address: Root.address,
            location_geom: Root.location_geom,
            remarks: Root.remarks,
            tags: Root.tags,
            photo: Root.photo,
            author: Root.author,
            agencies: Root.agencies,
            agencies_id: Root.agencies_id,
        })
            .from(Root)
            .where(query.where)
            .limit(query.limit || 10)
            .offset((query.page || 0) * (query.limit || 10))

        if (pgres.length === 0) {
            return { total: 0, items: [] };
        } else {
            return {
                total: parseInt(pgres[0].count),
                items: pgres.map((t) => this.normalize(t))
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedRolodex>> {
        const RootAgencies = this.rootAgencies();

        const pgres = await this.pool
            .select({
                id: Rolodex.id,
                created: Rolodex.created,
                updated: Rolodex.updated,
                archived: Rolodex.archived,
                protected: Rolodex.protected,
                type: Rolodex.type,
                name: Rolodex.name,
                title: Rolodex.title,
                organization: Rolodex.organization,
                phone: Rolodex.phone,
                email: Rolodex.email,
                website: Rolodex.website,
                address: Rolodex.address,
                location_geom: Rolodex.location_geom,
                remarks: Rolodex.remarks,
                tags: Rolodex.tags,
                photo: Rolodex.photo,
                author: Rolodex.author,
                agencies: RootAgencies.agencies,
                agencies_id: RootAgencies.agencies_id,
            })
            .from(Rolodex)
            .leftJoin(RootAgencies, eq(Rolodex.id, RootAgencies.agencies_rolodex_id))
            .where(is(id, SQL) ? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1)

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return this.normalize(pgres[0]);
    }
}
