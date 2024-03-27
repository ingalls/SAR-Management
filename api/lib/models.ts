import Modeler, { Pool } from '@openaddresses/batch-generic';
import NotificationModel from './models/Notification.js'
import EquipmentModel from './models/Equipment.js'
import LeadershipModel from './models/Leadership.js'
import ApplicationCommentModel from './models/ApplicationComment.js'
import * as pgtypes from './schema.js';

export default class Models {
    User: Modeler<typeof pgtypes.User>;
    UserSetting: Modeler<typeof pgtypes.UserSetting>;
    UserReset: Modeler<typeof pgtypes.UserReset>;
    Team: Modeler<typeof pgtypes.Team>;
    UserTeam: Modeler<typeof pgtypes.UserTeam>;
    Application: Modeler<typeof pgtypes.Application>;
    Asset: Modeler<typeof pgtypes.Asset>;
    CertKnown: Modeler<typeof pgtypes.CertKnown>;
    Cert: Modeler<typeof pgtypes.Cert>;
    EquipmentAssigned: Modeler<typeof pgtypes.EquipmentAssigned>;
    EquipmentType: Modeler<typeof pgtypes.EquipmentType>;
    Fieldability: Modeler<typeof pgtypes.Fieldability>;
    Poll: Modeler<typeof pgtypes.Poll>;
    Issue: Modeler<typeof pgtypes.Issue>;
    IssueAssigned: Modeler<typeof pgtypes.IssueAssigned>;
    IssueComment: Modeler<typeof pgtypes.IssueComment>;
    MissionRole: Modeler<typeof pgtypes.MissionRole>;
    Mission: Modeler<typeof pgtypes.Mission>;
    MissionAssigned: Modeler<typeof pgtypes.MissionAssigned>;
    MissionTeam: Modeler<typeof pgtypes.MissionTeam>;
    PollQuestion: Modeler<typeof pgtypes.PollQuestion>;
    PollVote: Modeler<typeof pgtypes.PollVote>;
    Schedule: Modeler<typeof pgtypes.Schedule>;
    ScheduleAssigned: Modeler<typeof pgtypes.ScheduleAssigned>;
    ScheduleEvent: Modeler<typeof pgtypes.ScheduleEvent>;
    Server: Modeler<typeof pgtypes.Server>;
    Training: Modeler<typeof pgtypes.Training>;
    TrainingAssigned: Modeler<typeof pgtypes.TrainingAssigned>;
    TrainingTeam: Modeler<typeof pgtypes.TrainingTeam>;

    Equipment: EquipmentModel;
    Notification: NotificationModel;
    Leadership: LeadershipModel;
    ApplicationComment: ApplicationCommentModel;

    constructor(pg: Pool<typeof pgtypes>) {
        this.Notification = new NotificationModel(pg);
        this.Leadership = new LeadershipModel(pg);
        this.Equipment = new EquipmentModel(pg);
        this.ApplicationComment = new ApplicationCommentModel(pg);

        this.User = new Modeler(pg, pgtypes.User);
        this.UserSetting = new Modeler(pg, pgtypes.UserSetting);
        this.UserReset = new Modeler(pg, pgtypes.UserReset);
        this.Team = new Modeler(pg, pgtypes.Team);
        this.UserTeam = new Modeler(pg, pgtypes.UserTeam);
        this.Application = new Modeler(pg, pgtypes.Application);
        this.Asset = new Modeler(pg, pgtypes.Asset);
        this.CertKnown = new Modeler(pg, pgtypes.CertKnown);
        this.Cert = new Modeler(pg, pgtypes.Cert);
        this.EquipmentAssigned = new Modeler(pg, pgtypes.EquipmentAssigned);
        this.EquipmentType = new Modeler(pg, pgtypes.EquipmentType);
        this.Fieldability = new Modeler(pg, pgtypes.Fieldability);
        this.Poll = new Modeler(pg, pgtypes.Poll);
        this.Issue = new Modeler(pg, pgtypes.Issue);
        this.IssueAssigned = new Modeler(pg, pgtypes.IssueAssigned);
        this.IssueComment = new Modeler(pg, pgtypes.IssueComment);
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
