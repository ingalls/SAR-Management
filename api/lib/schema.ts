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

/** Internal Tables for Postgis for use with drizzle-kit push:pg */
export const SpatialRefSys = pgTable('spatial_ref_sys', {
    srid: integer('srid').primaryKey(),
    auth_name: varchar('auth_name', { length: 256 }),
    auth_srid: integer('auth_srid'),
    srtext: varchar('srtext', { length: 2048 }),
    proj4text: varchar('proj4text', { length: 2048 })
});

/** ==== END ==== */

export const User = pgTable('users', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    disabled: boolean('disabled').notNull().default(false),
    disabled_date: timestamp('disabled_date', { withTimezone: true, mode: 'string' }),
    access: text('access').notNull().default('user'),
    username: text('username').notNull(),
    email: text('email').notNull(),
    password: text('password').notNull(),
    fname: text('fname').notNull(),
    lname: text('lname').notNull(),
    phone: text('phone').notNull(),
    bday: date('bday'),
    validated: boolean('validated').notNull().default(false),
    start_year: integer('start_year'),
    emergency: json('emergency').notNull().default([]),
    address_street: text('address_street').notNull().default(''),
    address_city: text('address_city').notNull().default(''),
    address_state: text('address_state').notNull().default(''),
    address_zip: text('address_zip').notNull().default(''),
    last_login: timestamp('last_login', { withTimezone: true, mode: 'string' })
});

export const UserSetting = pgTable('user_settings', {
    id: serial('id').primaryKey(),
    uid: integer('uid').notNull().references(() => User.id),
    key: text('key').notNull(),
    value: json('value').notNull(),
});

export const UserReset = pgTable('users_reset', {
    uid: integer('uid').notNull().references(() => User.id),
    expires: timestamp('expires', { mode: 'string' }).notNull(),
    token: text('token').notNull(),
    action: text('action').notNull()
});

export const Team = pgTable('teams', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    public: boolean('public').notNull().default(true),
    name: text('name').notNull(),
    body: text('body').notNull().default(''),
    iam: json('iam').$type<Static<typeof Iam>>().notNull().default({}),
    colour_bg: text('colour_bg').notNull().default('#808080'),
    colour_txt: text('colour_txt').notNull().default('#000000'),
    fieldable: boolean('fieldable').notNull().default(true)
});

export const UserTeam = pgTable('users_to_teams', {
    uid: integer('uid').notNull().references(() => User.id),
    tid: integer('tid').notNull().references(() => Team.id),
});

export const Application = pgTable('applications', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    group: text('group').notNull().default('unassigned'),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    meta: json('meta').notNull().default({}),
    schema: json('schema').notNull(),
    archived: boolean('archived').notNull().default(false)
});

export const ApplicationComment = pgTable('application_comments', {
    id: serial('id').primaryKey(),
    application: integer('application').notNull().references(() => Application.id),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    body: text('body').notNull(),
    author: integer('author').notNull().references(() => User.id),
    archived: boolean('archived').notNull().default(false)
})

export const Asset = pgTable('assets', {
    id: serial('id').primaryKey(),
    uid: integer('uid').notNull().references(() => User.id),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text('name').notNull(),
    storage: boolean('storage').notNull().default(false)
});

export const CertKnown = pgTable('certs_known', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text('name').notNull()
});

export const Cert = pgTable('certs', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    uid: integer('uid').notNull().references(() => User.id),
    known: integer('known').references(() => CertKnown.id),
    name: text('name').notNull(),
    expiry: timestamp('expiry', { mode: 'string' }),
    asset: integer('asset').notNull().references(() => Asset.id)
});

export const Equipment = pgTable('equipment', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    status: text('status').notNull().default('open'),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    type_id: integer('type_id').references(() => EquipmentType.id),
    container: boolean('container').notNull().default(false),
    parent: integer('parent').references(() => Equipment.id),
    meta: json('meta').notNull().default({}),
    archived: boolean('archived').notNull().default(false),
    quantity: integer('quantity').notNull().default(1),
    value: integer('value')
});

export const EquipmentAssigned = pgTable('equipment_assigned', {
    id: serial('id').primaryKey(),
    equip_id: integer('equip_id').notNull().references(() => Equipment.id),
    uid: integer('uid').notNull().references(() => User.id),
});
export const EquipmentType = pgTable('equipment_types', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    type: text('type').notNull(),
    schema: json('schema')
});

export const Fieldability = pgTable('fieldability', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().default(''),
    team: integer('team').notNull().references(() => Team.id),
});

export const Poll = pgTable('poll', {
    id: serial('id').primaryKey(),
    expiry: timestamp('expiry', { withTimezone: true, mode: 'string' })
});

export const Issue = pgTable('issues', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    status: text('status').notNull().default('open'),
    start_ts: timestamp('start_ts', { mode: 'string' }),
    end_ts: timestamp('end_ts', { mode: 'string' }),
    title: text('title').notNull(),
    body: text('body').notNull(),
    author: integer('author').notNull().references(() => User.id),
    poll_id: integer('poll_id').references(() => Poll.id),
});

export const IssueAssigned = pgTable('issues_assigned', {
    id: serial('id').primaryKey(),
    issue_id: integer('issue_id').notNull().references(() => Issue.id),
    uid: integer('uid').notNull().references(() => User.id),
    visible: boolean('visible').notNull().default(true)
});

export const IssueComment = pgTable('issues_comments', {
    id: serial('id').primaryKey(),
    issue: integer('issue').notNull().references(() => Issue.id),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    body: text('body').notNull(),
    author: integer('author').notNull().references(() => User.id),
    archived: boolean('archived').notNull().default(false)
});

export const Leadership = pgTable('leadership', {
    id: serial('id').primaryKey(),
    position: text('position').notNull(),
    uid: integer('uid').notNull().references(() => User.id),
});

export const MissionRole = pgTable('mission_role', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text('name').notNull()
});

export const MissionTag = pgTable('mission_tag', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text('name').notNull()
});

export const Mission = pgTable('missions', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    start_ts: timestamp('start_ts', { mode: 'string' }).notNull(),
    end_ts: timestamp('end_ts', { mode: 'string' }).notNull(),
    status: text('status').notNull().default('open'),
    title: text('title').notNull(),
    body: text('body').notNull(),
    author: integer('author').notNull().references(() => User.id),
    location: text('location').notNull().default(''),
    location_geom: geometry('location_geom', { type: GeometryType.Point, srid: 4326 }),
    externalid: text('externalid').default('')
});

export const MissionAssigned = pgTable('missions_assigned', {
    id: serial('id').primaryKey(),
    mission_id: integer('mission_id').notNull().references(() => Mission.id),
    confirmed: boolean('confirmed').notNull().default(false),
    role: text('role').notNull(),
    uid: integer('uid').notNull().references(() => User.id),
});

export const MissionTagAssigned = pgTable('missions_tag', {
    id: serial('id').primaryKey(),
    mission_id: integer('mission_id').notNull().references(() => Mission.id),
    tag_id: integer('tag_id').notNull().references(() => MissionTag.id),
});

export const MissionTeam = pgTable('missions_team', {
    id: serial('id').primaryKey(),
    mission_id: integer('mission_id').notNull().references(() => Mission.id),
    team_id: integer('team_id').notNull().references(() => Team.id),
});

export const Notification = pgTable('notifications', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    uid: integer('uid').notNull().references(() => User.id),
    text: text('text').notNull(),
    url: text('url')
});

export const PollQuestion = pgTable('poll_questions', {
    id: serial('id').primaryKey(),
    poll_id: integer('poll_id').notNull().references(() => Poll.id),
    question: json('question').notNull()
});

export const PollVote = pgTable('poll_votes', {
    uid: integer('uid').notNull().references(() => User.id),
    poll_id: integer('poll_id').notNull().references(() => Poll.id),
    question_id: integer('question_id').notNull().references(() => PollQuestion.id),
});

export const Schedule = pgTable('schedule', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    name: text('name').notNull(),
    body: text('body').notNull().default(''),
    handoff: text('handoff').notNull().default('06:00'),
    disabled: boolean('disabled').notNull().default(false)
});

export const ScheduleAssigned = pgTable('schedules_assigned', {
    id: serial('id').primaryKey(),
    schedule_id: integer('schedule_id').notNull().references(() => Schedule.id),
    role: text('role').notNull(),
    uid: integer('uid').notNull().references(() => User.id),
});

export const ScheduleEvent = pgTable('schedules_event', {
    id: serial('id').primaryKey(),
    schedule_id: integer('schedule_id').notNull().references(() => Schedule.id),
    start_ts: timestamp('start_ts', { mode: 'string' }).notNull(),
    end_ts: timestamp('end_ts', { mode: 'string' }).notNull(),
    uid: integer('uid').notNull().references(() => User.id),
});

export const Server = pgTable('server', {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    public: boolean('public').notNull().default(false)
});

export const Training = pgTable('training', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    author: integer('author').notNull().references(() => User.id),
    start_ts: timestamp('start_ts', { mode: 'string' }).notNull(),
    end_ts: timestamp('end_ts', { mode: 'string' }).notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    location: text('location').notNull().default(''),
    location_geom: geometry('location_geom', { type: GeometryType.Point, srid: 4326 }),
    required: boolean('required').notNull().default(false)
});

export const TrainingAssigned = pgTable('training_assigned', {
    id: serial('id').primaryKey(),
    training_id: integer('training_id').notNull().references(() => Training.id),
    confirmed: boolean('confirmed').notNull().default(false),
    role: text('role').notNull(),
    uid: integer('uid').notNull().references(() => User.id),
});

export const TrainingTeam = pgTable('trainings_team', {
    id: serial('id').primaryKey(),
    training_id: integer('training_id').notNull().references(() => Training.id),
    team_id: integer('team_id').notNull().references(() => Team.id),
});

export const Rolodex = pgTable('rolodex', {
    id: serial('id').primaryKey(),
    created: timestamp('created', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),
    updated: timestamp('updated', { withTimezone: true, mode: 'string' }).notNull().default(sql`Now()`),

    archived: boolean('archived').notNull().default(false),
    protected: boolean('protected').notNull().default(false),

    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    location_geom: geometry('location_geom', { type: GeometryType.Point, srid: 4326 }),
    remarks: text('remarks').notNull().default('')
});
