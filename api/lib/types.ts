import { createSelectSchema } from 'drizzle-typebox';
import { AugmentedTeam } from './models/Team.js';
import { AugmentedIssue } from './models/Issue.js';
import { AugmentedScheduleEvent } from './models/ScheduleEvent.js';
import { AugmentedApplicationComment } from './models/ApplicationComment.js';
import { AugmentedIssueComment } from './models/IssueComment.js';
import { AugmentedEquipmentAssigned } from './models/EquipmentAssigned.js';
import { AugmentedMissionAssigned } from './models/MissionAssigned.js';
import { AugmentedTrainingAssigned } from './models/TrainingAssigned.js';
import { AugmentedIssueAssigned } from './models/IssueAssigned.js';
import { AugmentedEquipment } from './models/Equipment.js';
import { AugmentedUser } from './models/User.js';
import { AugmentedTraining } from './models/Training.js';
import { AugmentedMission } from './models/Mission.js';
import { Type } from '@sinclair/typebox'
import * as schemas from './schema.js';

export const PollQuestionResponse = createSelectSchema(schemas.PollQuestion, {
    id: Type.Integer(),
    poll_id: Type.Integer(),
});

export const PollResponse = Type.Object({
    id: Type.Integer(),
    questions: Type.Array(PollQuestionResponse),
    vote: Type.Union([Type.Integer(), Type.Null()]),
    votes: Type.Array(Type.Object({
        question_id: Type.Integer(),
        votes: Type.Integer()
    })),
});

export const ServerResponse = createSelectSchema(schemas.Server, {
    public: Type.Boolean()
});

export const TeamResponse = AugmentedTeam;
export const IssueResponse = AugmentedIssue;
export const ScheduleEventResponse = AugmentedScheduleEvent;
export const IssueAssignedResponse = AugmentedIssueAssigned;
export const MissionAssignedResponse = AugmentedMissionAssigned;
export const TrainingAssignedResponse = AugmentedTrainingAssigned;

export const FieldabilityResponse = createSelectSchema(schemas.Fieldability, {
    id: Type.Integer(),
    team: Type.Integer()
});

export const ScheduleAssignedResponse = createSelectSchema(schemas.ScheduleAssigned, {
    id: Type.Integer(),
    schedule_id: Type.Integer(),
    uid: Type.Integer(),
});

export const ScheduleResponse = createSelectSchema(schemas.Schedule, {
    id: Type.Integer(),
});

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

export const TrainingResponse = AugmentedTraining;
export const MissionResponse = AugmentedMission;

export const CertKnownResponse = createSelectSchema(schemas.CertKnown, {
    id: Type.Integer(),
});

export const CertResponse = createSelectSchema(schemas.Cert, {
    id: Type.Integer(),
    uid: Type.Integer(),
    known: Type.Integer(),
    asset: Type.Integer()
});

export const EquipmentTypeResponse = createSelectSchema(schemas.EquipmentType, {
    id: Type.Integer()
});

export const EquipmentAssignedResponse = AugmentedEquipmentAssigned;
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


export const LoginResponse = Type.Object({
    id: Type.Integer(),
    username: Type.String(),
    email: Type.String(),
    access: Type.String(),
    iam: Type.Any(),
    validated: Type.Optional(Type.Boolean()),
    token: Type.Optional(Type.String())
});

export const UserResponse = AugmentedUser;
export const IssueCommentResponse = AugmentedIssueComment;
export const ApplicationCommentResponse = AugmentedApplicationComment;

export const ApplicationResponse = createSelectSchema(schemas.Application, {
    id: Type.Integer()
});

