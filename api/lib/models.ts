import Modeler, { Pool } from '@openaddresses/batch-generic';
import * as pgtypes from './schema.js';

export default class Models {
    User: Modeler<typeof pgtypes.User>;
    UserSetting: Modeler<typeof pgtypes.UserSetting>;
    UserReset: Modeler<typeof pgtypes.UserReset>;
    Team: Modeler<typeof pgtypes.Team>;
    UserTeam: Modeler<typeof pgtypes.UserTeam>;
    Application: Modeler<typeof pgtypes.Application>;
    ApplicationComment: Modeler<typeof pgtypes.ApplicationComment>;
    Asset: Modeler<typeof pgtypes.Asset>;
    CertKnown: Modeler<typeof pgtypes.CertKnown>;
    Cert: Modeler<typeof pgtypes.Cert>;
    Equipment: Modeler<typeof pgtypes.Equipment>;
    EquipmentAssigned: Modeler<typeof pgtypes.EquipmentAssigned>;
    EquipmentType: Modeler<typeof pgtypes.EquipmentType>;
    Fieldability: Modeler<typeof pgtypes.Fieldability>;
    Poll: Modeler<typeof pgtypes.Poll>;
    Issue: Modeler<typeof pgtypes.Issue>;
    IssueAssigned: Modeler<typeof pgtypes.IssueAssigned>;
    IssueComment: Modeler<typeof pgtypes.IssueComment>;
    Leadership: Modeler<typeof pgtypes.Leadership>;
    MissionRole: Modeler<typeof pgtypes.MissionRole>;
    Mission: Modeler<typeof pgtypes.Mission>;
    MissionAssigned: Modeler<typeof pgtypes.MissionAssigned>;
    MissionTeam: Modeler<typeof pgtypes.MissionTeam>;
    Notification: Modeler<typeof pgtypes.Notification>;
    PollQuestion: Modeler<typeof pgtypes.PollQuestion>;
    PollVote: Modeler<typeof pgtypes.PollVote>;
    Schedule: Modeler<typeof pgtypes.Schedule>;
    ScheduleAssigned: Modeler<typeof pgtypes.ScheduleAssigned>;
    ScheduleEvent: Modeler<typeof pgtypes.ScheduleEvent>;
    Server: Modeler<typeof pgtypes.Server>;
    Training: Modeler<typeof pgtypes.Training>;
    TrainingAssigned: Modeler<typeof pgtypes.TrainingAssigned>;
    TrainingTeam: Modeler<typeof pgtypes.TrainingTeam>;

    constructor(pg: Pool<typeof pgtypes>) {
        this.Notification = new Modeler(pg, pgtypes.Notification);

        this.User = new Modeler(pg, pgtypes.User);
        this.UserSetting = new Modeler(pg, pgtypes.UserSetting);
        this.UserReset = new Modeler(pg, pgtypes.UserReset);
        this.Team = new Modeler(pg, pgtypes.Team);
        this.UserTeam = new Modeler(pg, pgtypes.UserTeam);
        this.Application = new Modeler(pg, pgtypes.Application);
        this.ApplicationComment = new Modeler(pg, pgtypes.ApplicationComment);
        this.Asset = new Modeler(pg, pgtypes.Asset);
        this.CertKnown = new Modeler(pg, pgtypes.CertKnown);
        this.Cert = new Modeler(pg, pgtypes.Cert);
        this.Equipment = new Modeler(pg, pgtypes.Equipment);
        this.EquipmentAssigned = new Modeler(pg, pgtypes.EquipmentAssigned);
        this.EquipmentType = new Modeler(pg, pgtypes.EquipmentType);
        this.Fieldability = new Modeler(pg, pgtypes.Fieldability);
        this.Poll = new Modeler(pg, pgtypes.Poll);
        this.Issue = new Modeler(pg, pgtypes.Issue);
        this.IssueAssigned = new Modeler(pg, pgtypes.IssueAssigned);
        this.IssueComment = new Modeler(pg, pgtypes.IssueComment);
        this.Leadership = new Modeler(pg, pgtypes.Leadership);
        this.MissionRole = new Modeler(pg, pgtypes.MissionRole);
        this.Mission = new Modeler(pg, pgtypes.Mission);
        this.MissionAssigned = new Modeler(pg, pgtypes.MissionAssigned);
        this.MissionTeam = new Modeler(pg, pgtypes.MissionTeam);
        this.PollQuestion = new Modeler(pg, pgtypes.PollQuestion);
        this.PollVote = new Modeler(pg, pgtypes.PollVote);
        this.Schedule = new Modeler(pg, pgtypes.Schedule);
        this.ScheduleAssigned = new Modeler(pg, pgtypes.ScheduleAssigned);
        this.ScheduleEvent = new Modeler(pg, pgtypes.ScheduleEvent);
        this.Server = new Modeler(pg, pgtypes.Server);
        this.Training = new Modeler(pg, pgtypes.Training);
        this.TrainingAssigned = new Modeler(pg, pgtypes.TrainingAssigned);
        this.TrainingTeam = new Modeler(pg, pgtypes.TrainingTeam);
    }
}
