import { createSelectSchema } from 'drizzle-typebox';
import { AugmentedApplicationComment } from './models/ApplicationComment.js';
import { Type } from '@sinclair/typebox'
import * as schemas from './schema.js';

export const StandardResponse = Type.Object({
    status: Type.Integer(),
    message: Type.String()
});

export const MissionRoleResponse = createSelectSchema(schemas.MissionRole, {
    id: Type.Integer()
});


export const LeadershipResponse = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    position: Type.String(),
    uid: Type.Integer()
});

export const User_EmergencyContact = Type.Object({
    name: Type.String(),
    phone: Type.String(),
    relationship: Type.String()
})

export const LoginResponse = Type.Object({
    id: Type.Integer(),
    username: Type.String(),
    email: Type.String(),
    access: Type.String(),
    iam: Type.Any(),
    validated: Type.Optional(Type.Boolean()),
    token: Type.Optional(Type.String())
});

export const UserResponse = Type.Object({
    id: Type.Integer(),
    access: Type.String(),
    disabled: Type.Boolean(),
    username: Type.String(),
    created: Type.String(),
    updated: Type.String(),
    phone: Type.String(),
    email: Type.String(),
    lname: Type.String(),
    fname: Type.String(),
    start_year: Type.Integer(),
    last_login: Type.String(),
    emergency: User_EmergencyContact,
    address_street: Type.String(),
    address_city: Type.String(),
    address_state: Type.String(),
    address_zip: Type.String()
})

export const ApplicationCommentResponse = AugmentedApplicationComment;
