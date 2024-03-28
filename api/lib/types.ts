import { createSelectSchema } from 'drizzle-typebox';
import { AugmentedApplicationComment } from './models/ApplicationComment.js';
import { AugmentedEquipment } from './models/Equipment.js';
import { AugmentedMission } from './models/Mission.js';
import { Type } from '@sinclair/typebox'
import * as schemas from './schema.js';

export const AssetResponse = Type.Object({
    id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    name: Type.String(),
    storage: Type.Boolean(),
    asset_url: Type.String()
});

export const DocResponse = Type.Object({
    key: Type.String(),
    last_modified: Type.String(),
    size: Type.Integer(),
    type: Type.String({ enum: ["dir", "file" ] })
});

export const MissionResponse = AugmentedMission;

export const EquipmentResponse = AugmentedEquipment;

export const StandardResponse = Type.Object({
    status: Type.Integer(),
    message: Type.String()
});

export const MissionRoleResponse = createSelectSchema(schemas.MissionRole, {
    id: Type.Integer()
});

export const NotificationResponse = createSelectSchema(schemas.Notification, {
    id: Type.Integer(),
    uid: Type.Integer()
})

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

export const ApplicationResponse = createSelectSchema(schemas.Application, {
    id: Type.Integer()
});

