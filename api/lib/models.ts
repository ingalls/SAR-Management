import Modeler, { Pool } from '@openaddresses/batch-generic';
import NotificationModel from './models/Notification.js'
import EquipmentModel from './models/Equipment.js'
import ScheduleEventModel from './models/ScheduleEvent.js'
import EquipmentAssignedModel from './models/EquipmentAssigned.js'
import IssueModel from './models/Issue.js'
import IssueAssignedModel from './models/IssueAssigned.js'
import ScheduleAssignedModel from './models/ScheduleAssigned.js'
import IssueCommentModel from './models/IssueComment.js'
import MissionAssignedModel from './models/MissionAssigned.js'
import TrainingAssignedModel from './models/TrainingAssigned.js'
import PollModel from './models/IssuePoll.js'
import LeadershipModel from './models/Leadership.js'
import MissionModel from './models/Mission.js'
import TrainingModel from './models/Training.js'
import UserModel from './models/User.js'
import ApplicationCommentModel from './models/ApplicationComment.js'
import TeamModel from './models/Team.js'
import StatsModel from './models/Stats.js'
import * as pgtypes from './schema.js';

export default class Models {
    UserSetting: Modeler<typeof pgtypes.UserSetting>;
    UserReset: Modeler<typeof pgtypes.UserReset>;
    UserDashboard: Modeler<typeof pgtypes.UserDashboard>;
    UserTeam: Modeler<typeof pgtypes.UserTeam>;
    Application: Modeler<typeof pgtypes.Application>;
    Asset: Modeler<typeof pgtypes.Asset>;
    CertKnown: Modeler<typeof pgtypes.CertKnown>;
    Cert: Modeler<typeof pgtypes.Cert>;
    EquipmentType: Modeler<typeof pgtypes.EquipmentType>;
    Fieldability: Modeler<typeof pgtypes.Fieldability>;
    MissionTag: Modeler<typeof pgtypes.MissionTag>;
    MissionTagAssigned: Modeler<typeof pgtypes.MissionTagAssigned>;
    MissionAsset: Modeler<typeof pgtypes.MissionAsset>;
    MissionRole: Modeler<typeof pgtypes.MissionRole>;
    MissionTeam: Modeler<typeof pgtypes.MissionTeam>;
    PollQuestion: Modeler<typeof pgtypes.PollQuestion>;
    PollVote: Modeler<typeof pgtypes.PollVote>;
    Schedule: Modeler<typeof pgtypes.Schedule>;
    Server: Modeler<typeof pgtypes.Server>;
    TrainingTag: Modeler<typeof pgtypes.TrainingTag>;
    TrainingTagAssigned: Modeler<typeof pgtypes.TrainingTagAssigned>;
    TrainingAsset: Modeler<typeof pgtypes.TrainingAsset>;
    TrainingTeam: Modeler<typeof pgtypes.TrainingTeam>;
    Rolodex: Modeler<typeof pgtypes.Rolodex>;
    UserIncident: Modeler<typeof pgtypes.UserIncident>;
    EquipmentIncident: Modeler<typeof pgtypes.EquipmentIncident>;

    Poll: PollModel;
    Team: TeamModel;
    Stats: StatsModel;
    User: UserModel;
    Issue: IssueModel;
    Equipment: EquipmentModel;
    Mission: MissionModel;
    MissionAssigned: MissionAssignedModel;
    Training: TrainingModel;
    TrainingAssigned: TrainingAssignedModel;
    Notification: NotificationModel;
    Leadership: LeadershipModel;
    ApplicationComment: ApplicationCommentModel;
    IssueComment: IssueCommentModel;
    EquipmentAssigned: EquipmentAssignedModel;
    IssueAssigned: IssueAssignedModel;
    ScheduleAssigned: ScheduleAssignedModel;
    ScheduleEvent: ScheduleEventModel;

    constructor(pg: Pool<typeof pgtypes>) {
        this.Poll = new PollModel(pg);
        this.User = new UserModel(pg);
        this.Notification = new NotificationModel(pg);
        this.Leadership = new LeadershipModel(pg);
        this.Equipment = new EquipmentModel(pg);
        this.EquipmentAssigned = new EquipmentAssignedModel(pg);
        this.ApplicationComment = new ApplicationCommentModel(pg);
        this.IssueComment = new IssueCommentModel(pg);
        this.Mission = new MissionModel(pg);
        this.Training = new TrainingModel(pg);
        this.ScheduleEvent = new ScheduleEventModel(pg);
        this.Issue = new IssueModel(pg);
        this.IssueAssigned = new IssueAssignedModel(pg);
        this.TrainingAssigned = new TrainingAssignedModel(pg);
        this.MissionAssigned = new MissionAssignedModel(pg);
        this.ScheduleAssigned = new ScheduleAssignedModel(pg);
        this.Stats = new StatsModel(pg);
        this.Team = new TeamModel(pg);

        this.UserSetting = new Modeler(pg, pgtypes.UserSetting);
        this.UserReset = new Modeler(pg, pgtypes.UserReset);
        this.UserDashboard = new Modeler(pg, pgtypes.UserDashboard);
        this.UserTeam = new Modeler(pg, pgtypes.UserTeam);
        this.Application = new Modeler(pg, pgtypes.Application);
        this.Asset = new Modeler(pg, pgtypes.Asset);
        this.Rolodex = new Modeler(pg, pgtypes.Rolodex);
        this.CertKnown = new Modeler(pg, pgtypes.CertKnown);
        this.Cert = new Modeler(pg, pgtypes.Cert);
        this.EquipmentType = new Modeler(pg, pgtypes.EquipmentType);
        this.Fieldability = new Modeler(pg, pgtypes.Fieldability);
        this.MissionTag = new Modeler(pg, pgtypes.MissionTag);
        this.MissionTagAssigned = new Modeler(pg, pgtypes.MissionTagAssigned);
        this.MissionAsset = new Modeler(pg, pgtypes.MissionAsset);
        this.MissionRole = new Modeler(pg, pgtypes.MissionRole);
        this.MissionTeam = new Modeler(pg, pgtypes.MissionTeam);
        this.PollQuestion = new Modeler(pg, pgtypes.PollQuestion);
        this.PollVote = new Modeler(pg, pgtypes.PollVote);
        this.Schedule = new Modeler(pg, pgtypes.Schedule);
        this.Server = new Modeler(pg, pgtypes.Server);
        this.TrainingTag = new Modeler(pg, pgtypes.TrainingTag);
        this.TrainingTagAssigned = new Modeler(pg, pgtypes.TrainingTagAssigned);
        this.UserIncident = new Modeler(pg, pgtypes.UserIncident);
        this.EquipmentIncident = new Modeler(pg, pgtypes.EquipmentIncident);
        this.TrainingAsset = new Modeler(pg, pgtypes.TrainingAsset);
        this.TrainingTeam = new Modeler(pg, pgtypes.TrainingTeam);
    }
}
