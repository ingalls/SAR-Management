import { sql } from 'drizzle-orm';
import { Static } from '@sinclair/typebox';
import { geometry, GeometryType } from '@openaddresses/batch-generic';
import { Iam } from './auth.js';

import {
    json,
    boolean,
    integer,
    timestamp,
    pgTable,
    serial,
    varchar,
    text,
    date
} from 'drizzle-orm/pg-core';
import { double } from 'drizzle-orm/mysql-core/index.js';

/** Internal Tables for Postgis for use with drizzle-kit push:pg */
export const SpatialRefSys = pgTable('spatial_ref_sys', {
    srid: integer().primaryKey(),
    auth_name: varchar({ length: 256 }),
    auth_srid: integer(),
    srtext: varchar({ length: 2048 }),
    proj4text: varchar({ length: 2048 })
});

/** ==== END ==== */

export const User = pgTable('users', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    disabled: boolean().notNull().default(false),
    disabled_date: timestamp({ withTimezone: true, mode: 'string' }),
    access: text().notNull().default('user'),
    username: text().notNull(),
    email: text().notNull(),
    password: text().notNull(),
    fname: text().notNull(),
    lname: text().notNull(),
    phone: text().notNull(),
    bday: date(),
    mfa_secret: text(),
    mfa_enabled: boolean().notNull().default(false),
    validated: boolean().notNull().default(false),
    start_year: integer(),
    emergency: json().notNull().default([]),
    address_street: text().notNull().default(''),
    address_city: text().notNull().default(''),
    address_state: text().notNull().default(''),
    address_zip: text().notNull().default(''),
    last_login: timestamp({ withTimezone: true, mode: 'string' })
});

export const UserSession = pgTable('users_sessions', {
    sid: text().primaryKey(),
    uid: integer().notNull().references(() => User.id),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    ip: text().notNull(),
    ua: text().notNull(),
});

export const UserDashboard = pgTable('user_dashboard', {
    id: serial().primaryKey(),
    uid: integer().notNull().references(() => User.id),
    name: text().notNull(),
    x: integer().notNull(),
    y: integer().notNull(),
    w: integer().notNull(),
    h: integer().notNull(),
});

export const UserSetting = pgTable('user_settings', {
    id: serial().primaryKey(),
    uid: integer().notNull().references(() => User.id),
    key: text().notNull(),
    value: json().notNull(),
});

export const UserReset = pgTable('users_reset', {
    uid: integer().notNull().references(() => User.id),
    expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    token: text().notNull(),
    action: text().notNull()
});

export const Team = pgTable('teams', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    public: boolean().notNull().default(true),
    name: text().notNull(),
    body: text().notNull().default(''),
    iam: json().$type<Static<typeof Iam>>().notNull().default({}),
    colour_bg: text().notNull().default('#808080'),
    colour_txt: text().notNull().default('#000000'),
    fieldable: boolean().notNull().default(true)
});
export const TeamChannel = pgTable('teams_channels', {
    id: serial().primaryKey(),
    team_id: integer().notNull().references(() => Team.id),
    channel_id: text().notNull(),
    channel_name: text().notNull()
});
export const UserTeam = pgTable('users_to_teams', {
    uid: integer().notNull().references(() => User.id),
    tid: integer().notNull().references(() => Team.id),
});

export const Application = pgTable('applications', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    group: text().notNull().default('unassigned'),
    name: text().notNull(),
    phone: text().notNull(),
    email: text().notNull(),
    meta: json().notNull().default({}),
    schema: json().notNull(),
    archived: boolean().notNull().default(false)
});

export const ApplicationComment = pgTable('application_comments', {
    id: serial().primaryKey(),
    application: integer().notNull().references(() => Application.id),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    body: text().notNull(),
    author: integer().notNull().references(() => User.id),
    archived: boolean().notNull().default(false)
})

export const Asset = pgTable('assets', {
    id: serial().primaryKey(),
    uid: integer().notNull().references(() => User.id),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text().notNull(),
    storage: boolean().notNull().default(false)
});

export const CertKnown = pgTable('certs_known', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text().notNull()
});

export const Cert = pgTable('certs', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    uid: integer().notNull().references(() => User.id),
    known: integer().references(() => CertKnown.id),
    name: text().notNull(),
    expiry: timestamp({ withTimezone: true, mode: 'string' }),
    asset: integer().notNull().references(() => Asset.id)
});

export const Equipment = pgTable('equipment', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    status: text().notNull().default('open'),
    name: text().notNull(),
    description: text().notNull().default(''),
    type_id: integer().references(() => EquipmentType.id),
    container: boolean().notNull().default(false),
    parent: integer().references(() => Equipment.id),
    meta: json().notNull().default({}),
    archived: boolean().notNull().default(false),
    quantity: integer().notNull().default(1),
    value: integer()
});

export const EquipmentAssigned = pgTable('equipment_assigned', {
    id: serial().primaryKey(),
    equip_id: integer().notNull().references(() => Equipment.id),
    uid: integer().notNull().references(() => User.id),
});
export const EquipmentType = pgTable('equipment_types', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    type: text().notNull(),
    schema: json()
});

export const Fieldability = pgTable('fieldability', {
    id: serial().primaryKey(),
    name: text().notNull().default(''),
    team: integer().notNull().references(() => Team.id),
});

export const Poll = pgTable('poll', {
    id: serial().primaryKey(),
    expiry: timestamp({ withTimezone: true, mode: 'string' })
});

export const Issue = pgTable('issues', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    status: text().notNull().default('open'),
    start_ts: timestamp({ withTimezone: true, mode: 'string' }),
    end_ts: timestamp({ withTimezone: true, mode: 'string' }),
    title: text().notNull(),
    body: text().notNull(),
    author: integer().notNull().references(() => User.id),
    poll_id: integer().references(() => Poll.id),
});

export const IssueAssigned = pgTable('issues_assigned', {
    id: serial().primaryKey(),
    issue_id: integer().notNull().references(() => Issue.id),
    uid: integer().notNull().references(() => User.id),
    visible: boolean().notNull().default(true)
});

export const IssueComment = pgTable('issues_comments', {
    id: serial().primaryKey(),
    issue: integer().notNull().references(() => Issue.id),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    body: text().notNull(),
    author: integer().notNull().references(() => User.id),
    archived: boolean().notNull().default(false)
});

export const Leadership = pgTable('leadership', {
    id: serial().primaryKey(),
    position: text().notNull(),
    uid: integer().notNull().references(() => User.id),
});

export const MissionRole = pgTable('mission_role', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text().notNull(),
    icon: text().notNull().default('')
});

export const MissionTag = pgTable('mission_tag', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text().notNull(),
    icon: text().notNull().default('')
});

export const Mission = pgTable('missions', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    start_ts: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    end_ts: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    status: text().notNull().default('open'),
    title: text().notNull(),
    body: text().notNull(),
    author: integer().notNull().references(() => User.id),
    location: text().notNull().default(''),
    location_geom: geometry({ type: GeometryType.Point, srid: 4326 }),
    externalid: text().default('')
});

export const MissionAssigned = pgTable('missions_assigned', {
    id: serial().primaryKey(),
    mission_id: integer().notNull().references(() => Mission.id),
    confirmed: boolean().notNull().default(false),
    role: text().notNull(),
    uid: integer().notNull().references(() => User.id),
});

export const MissionPatient = pgTable('missions_patients', {
    id: serial().primaryKey(),
    mission_id: integer().notNull().references(() => Mission.id),
    name: text().notNull(),
    age: integer(),
    dob: text(),
    address_street: text(),
    address_state: text(),
    address_postcode: text(),
    address_country: text(),
});

export const MissionTagAssigned = pgTable('missions_tag', {
    id: serial().primaryKey(),
    mission_id: integer().notNull().references(() => Mission.id),
    tag_id: integer().notNull().references(() => MissionTag.id),
});

export const MissionTeam = pgTable('missions_team', {
    id: serial().primaryKey(),
    mission_id: integer().notNull().references(() => Mission.id),
    team_id: integer().notNull().references(() => Team.id),
});

export const MissionAsset = pgTable('missions_assets', {
    id: serial().primaryKey(),
    mission_id: integer().notNull().references(() => Mission.id),
    asset_id: integer().notNull().references(() => Asset.id),
});

export const Notification = pgTable('notifications', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    uid: integer().notNull().references(() => User.id),
    text: text().notNull(),
    url: text()
});

export const PollQuestion = pgTable('poll_questions', {
    id: serial().primaryKey(),
    poll_id: integer().notNull().references(() => Poll.id),
    question: json().notNull()
});

export const PollVote = pgTable('poll_votes', {
    uid: integer().notNull().references(() => User.id),
    poll_id: integer().notNull().references(() => Poll.id),
    question_id: integer().notNull().references(() => PollQuestion.id),
});

export const Schedule = pgTable('schedule', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text().notNull(),
    body: text().notNull().default(''),
    handoff: text().notNull().default('06:00'),
    disabled: boolean().notNull().default(false)
});

export const ScheduleAssigned = pgTable('schedules_assigned', {
    id: serial().primaryKey(),
    schedule_id: integer().notNull().references(() => Schedule.id),
    role: text().notNull(),
    uid: integer().notNull().references(() => User.id),
});

export const ScheduleEvent = pgTable('schedules_event', {
    id: serial().primaryKey(),
    schedule_id: integer().notNull().references(() => Schedule.id),
    start_ts: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    end_ts: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    uid: integer().notNull().references(() => User.id),
});

export const Server = pgTable('server', {
    key: text().primaryKey(),
    value: text().notNull(),
    public: boolean().notNull().default(false)
});

export const TrainingTag = pgTable('training_tag', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text().notNull(),
    icon: text().notNull().default('')
});

export const Training = pgTable('training', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    author: integer().notNull().references(() => User.id),
    start_ts: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    end_ts: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    title: text().notNull(),
    body: text().notNull(),
    location: text().notNull().default(''),
    location_geom: geometry({ type: GeometryType.Point, srid: 4326 }),
    required: boolean().notNull().default(false)
});

export const TrainingAssigned = pgTable('training_assigned', {
    id: serial().primaryKey(),
    training_id: integer().notNull().references(() => Training.id),
    confirmed: boolean().notNull().default(false),
    role: text().notNull(),
    uid: integer().notNull().references(() => User.id),
});

export const TrainingTagAssigned = pgTable('trainings_tag', {
    id: serial().primaryKey(),
    training_id: integer().notNull().references(() => Training.id),
    tag_id: integer().notNull().references(() => TrainingTag.id),
});

export const TrainingTeam = pgTable('trainings_team', {
    id: serial().primaryKey(),
    training_id: integer().notNull().references(() => Training.id),
    team_id: integer().notNull().references(() => Team.id),
});

export const TrainingAsset = pgTable('trainings_assets', {
    id: serial().primaryKey(),
    training_id: integer().notNull().references(() => Training.id),
    asset_id: integer().notNull().references(() => Asset.id),
});

export const Rolodex = pgTable('rolodex', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),

    archived: boolean().notNull().default(false),
    protected: boolean().notNull().default(false),

    name: text().notNull(),
    phone: text(),
    email: text(),
    location_geom: geometry({ type: GeometryType.Point, srid: 4326 }),
    remarks: text().notNull().default('')
});

export const UserIncident = pgTable('users_incidents', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    date: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    title: text().notNull(),
    severity: text().notNull().default('minor'),
    body: text().notNull().default(''),
    uid: integer().notNull().references(() => User.id),
    mission_id: integer().references(() => Mission.id),
    training_id: integer().references(() => Training.id)
});

export const EquipmentIncident = pgTable('equipment_incidents', {
    id: serial().primaryKey(),
    created: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp({ withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    date: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    title: text().notNull(),
    body: text().notNull().default(''),
    equipment_id: integer().notNull().references(() => Equipment.id),
    mission_id: integer().references(() => Mission.id),
    training_id: integer().references(() => Training.id)
});


