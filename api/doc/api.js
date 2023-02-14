
/**
* @api {get} /schema GET /schema
* @apiVersion 1.0.0
* @apiName GET-/schema
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListSchema.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListSchema.json} apiSuccess
*/


/**
* @api {get} /asset List Assets
* @apiVersion 1.0.0
* @apiName GET-/asset
* @apiGroup Assets
* @apiPermission user
*
* @apidescription
*   List Assets
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListAssets.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListAssets.json} apiSuccess
*/


/**
* @api {get} /asset/:assetid Get Asset
* @apiVersion 1.0.0
* @apiName GET-/asset/:assetid
* @apiGroup Assets
* @apiPermission user
*
* @apidescription
*   Get single asset
*
* @apiParam {integer} assetid param
*
*
*
* @apiSchema {jsonschema=../schema/assets.json} apiSuccess
*/


/**
* @api {get} /asset/:assetid/raw Raw Asset
* @apiVersion 1.0.0
* @apiName GET-/asset/:assetid/raw
* @apiGroup Assets
* @apiPermission user
*
* @apidescription
*   Get single raw asset
*
* @apiParam {integer} assetid param
*
*
*
*
*/


/**
* @api {post} /asset Create Asset
* @apiVersion 1.0.0
* @apiName POST-/asset
* @apiGroup Assets
* @apiPermission user
*
* @apidescription
*   Create a new asset
*
* @apiParam {integer} assetid param
*
*
*
* @apiSchema {jsonschema=../schema/assets.json} apiSuccess
*/


/**
* @api {patch} /asset/:assetid Update Asset
* @apiVersion 1.0.0
* @apiName PATCH-/asset/:assetid
* @apiGroup Assets
* @apiPermission user
*
* @apidescription
*   Update Asset
*
* @apiParam {integer} assetid param
*
*
*
* @apiSchema {jsonschema=../schema/assets.json} apiSuccess
*/


/**
* @api {delete} /asset/:assetid Delete Asset
* @apiVersion 1.0.0
* @apiName DELETE-/asset/:assetid
* @apiGroup Assets
* @apiPermission user
*
* @apidescription
*   Delete Asset
*
* @apiParam {integer} assetid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /calendar List Calendar Layers
* @apiVersion 1.0.0
* @apiName GET-/calendar
* @apiGroup Calendar
* @apiPermission user
*
* @apidescription
*   Get all possible calendar layers
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListCalendarLayers.json} apiSuccess
*/


/**
* @api {get} /calendar/:calendar/events List Events
* @apiVersion 1.0.0
* @apiName GET-/calendar/:calendar/events
* @apiGroup Calendar
* @apiPermission user
*
* @apidescription
*   Query Events from a given calendar
*
* @apiParam {string} calendar param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListEvents.json} apiParam
*
*
*/


/**
* @api {get} /doc List Docs
* @apiVersion 1.0.0
* @apiName GET-/doc
* @apiGroup Docs
* @apiPermission user
*
* @apidescription
*   List Docs
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListDocs.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListDocs.json} apiSuccess
*/


/**
* @api {get} /equipment List Equipment
* @apiVersion 1.0.0
* @apiName GET-/equipment
* @apiGroup Equipment
* @apiPermission user
*
* @apidescription
*   Get all equipment in the Org
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListEquipment.json} apiSuccess
*/


/**
* @api {get} /equipment/:equipmentid Get Equipment
* @apiVersion 1.0.0
* @apiName GET-/equipment/:equipmentid
* @apiGroup Equipment
* @apiPermission user
*
* @apidescription
*   Get a single equipment
*
* @apiParam {integer} equipmentid param
*
*
*
* @apiSchema {jsonschema=../schema/equipment.json} apiSuccess
*/


/**
* @api {post} /equipment Create Equipment
* @apiVersion 1.0.0
* @apiName POST-/equipment
* @apiGroup Equipment
* @apiPermission user
*
* @apidescription
*   Create a new piece of equipment
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateEquipment.json} apiParam
* @apiSchema {jsonschema=../schema/equipment.json} apiSuccess
*/


/**
* @api {patch} /equipment/:equipmentid Update Equipment
* @apiVersion 1.0.0
* @apiName PATCH-/equipment/:equipmentid
* @apiGroup Equipment
* @apiPermission user
*
* @apidescription
*   Update an existing piece of equipment
*
* @apiParam {integer} equipmentid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchEquipment.json} apiParam
* @apiSchema {jsonschema=../schema/equipment.json} apiSuccess
*/


/**
* @api {get} /issue/:issueid/assigned Get Assigned
* @apiVersion 1.0.0
* @apiName GET-/issue/:issueid/assigned
* @apiGroup IssueAssigned
* @apiPermission user
*
* @apidescription
*   Get users assigned to an issue
*
* @apiParam {integer} issueid param
*
*
*
* @apiSchema {jsonschema=../schema/res.ListIssueAssigned.json} apiSuccess
*/


/**
* @api {post} /issue/:issueid/assigned Add Assigned
* @apiVersion 1.0.0
* @apiName POST-/issue/:issueid/assigned
* @apiGroup IssueAssigned
* @apiPermission user
*
* @apidescription
*   Remove an assignment
*
* @apiParam {integer} issueid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateIssueAssigned.json} apiParam
* @apiSchema {jsonschema=../schema/issues_assigned.json} apiSuccess
*/


/**
* @api {delete} /issue/:issueid/assigned/:assignedid Remove Assigned
* @apiVersion 1.0.0
* @apiName DELETE-/issue/:issueid/assigned/:assignedid
* @apiGroup IssueAssigned
* @apiPermission user
*
* @apidescription
*   Remove a user from an issue
*
* @apiParam {integer} issueid param
* @apiParam {integer} assignedid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /issue/:issueid/comment Get Comments
* @apiVersion 1.0.0
* @apiName GET-/issue/:issueid/comment
* @apiGroup Comments
* @apiPermission user
*
* @apidescription
*   Get all comments for a given issue
*
* @apiParam {integer} issueid param
*
*
*
* @apiSchema {jsonschema=../schema/res.ListIssueComments.json} apiSuccess
*/


/**
* @api {post} /issue/:issueid/comment Create Comment
* @apiVersion 1.0.0
* @apiName POST-/issue/:issueid/comment
* @apiGroup Comments
* @apiPermission user
*
* @apidescription
*   Create a new issue comment
*
* @apiParam {integer} issueid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateIssueComment.json} apiParam
* @apiSchema {jsonschema=../schema/view_issues_comments.json} apiSuccess
*/


/**
* @api {get} /issue Get Issues
* @apiVersion 1.0.0
* @apiName GET-/issue
* @apiGroup Issue
* @apiPermission user
*
* @apidescription
*   Get all issues for the Org
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListIssues.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListIssues.json} apiSuccess
*/


/**
* @api {post} /issue Create Issue
* @apiVersion 1.0.0
* @apiName POST-/issue
* @apiGroup Issue
* @apiPermission user
*
* @apidescription
*   Create a new issue
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateIssue.json} apiParam
* @apiSchema {jsonschema=../schema/view_issues.json} apiSuccess
*/


/**
* @api {patch} /issue/:issueid Upodate Issue
* @apiVersion 1.0.0
* @apiName PATCH-/issue/:issueid
* @apiGroup Issue
* @apiPermission user
*
* @apidescription
*   Update an issue
*
* @apiParam {integer} issueid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchIssue.json} apiParam
* @apiSchema {jsonschema=../schema/view_issues.json} apiSuccess
*/


/**
* @api {get} /issue/:issueid Get Issue
* @apiVersion 1.0.0
* @apiName GET-/issue/:issueid
* @apiGroup Issue
* @apiPermission user
*
* @apidescription
*   Get an issue
*
* @apiParam {integer} issueid param
*
*
*
* @apiSchema {jsonschema=../schema/view_issues.json} apiSuccess
*/


/**
* @api {get} /leadership List Leadership
* @apiVersion 1.0.0
* @apiName GET-/leadership
* @apiGroup Leadership
* @apiPermission user
*
* @apidescription
*   Get all team leaders
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListLeadership.json} apiSuccess
*/


/**
* @api {post} /leadership Create Leadership
* @apiVersion 1.0.0
* @apiName POST-/leadership
* @apiGroup Leadership
* @apiPermission admin
*
* @apidescription
*   Create a new leader
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateLeadership.json} apiParam
* @apiSchema {jsonschema=../schema/res.Leadership.json} apiSuccess
*/


/**
* @api {patch} /leadership/:leaderid Patch Leadership
* @apiVersion 1.0.0
* @apiName PATCH-/leadership/:leaderid
* @apiGroup Leadership
* @apiPermission admin
*
* @apidescription
*   Update a leader
*
* @apiParam {integer} leaderid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchLeadership.json} apiParam
* @apiSchema {jsonschema=../schema/res.Leadership.json} apiSuccess
*/


/**
* @api {delete} /leadership/:leaderid dElete Leadership
* @apiVersion 1.0.0
* @apiName DELETE-/leadership/:leaderid
* @apiGroup Leadership
* @apiPermission admin
*
* @apidescription
*   delete a leader
*
* @apiParam {integer} leaderid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /login Session Info
* @apiVersion 1.0.0
* @apiName GET-/login
* @apiGroup Login
* @apiPermission user
*
* @apidescription
*   REturn information about the currently logged in user
*

*
*
*
* @apiSchema {jsonschema=../schema/res.Login.json} apiSuccess
*/


/**
* @api {post} /login Create Session
* @apiVersion 1.0.0
* @apiName POST-/login
* @apiGroup Login
* @apiPermission user
*
* @apidescription
*   Log a user into the service and create an auth cookie
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Login.json} apiSuccess
*/


/**
* @api {post} /login/verify Verify User
* @apiVersion 1.0.0
* @apiName POST-/login/verify
* @apiGroup Login
* @apiPermission public
*
* @apidescription
*   Email verification of a new user
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.VerifyLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /login/forgot Forgot Login
* @apiVersion 1.0.0
* @apiName POST-/login/forgot
* @apiGroup Login
* @apiPermission public
*
* @apidescription
*   If a user has forgotten their password, send a password reset link to their email
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.ForgotLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /login/reset Reset Login
* @apiVersion 1.0.0
* @apiName POST-/login/reset
* @apiGroup Login
* @apiPermission public
*
* @apidescription
*   Once a user has obtained a password reset by email via the Forgot Login API, use the token to reset the password
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.ResetLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /mission/:missionid/assigned Get Assigned
* @apiVersion 1.0.0
* @apiName GET-/mission/:missionid/assigned
* @apiGroup MissionAssigned
* @apiPermission user
*
* @apidescription
*   Get users assigned to an mission
*
* @apiParam {integer} missionid param
*
*
*
* @apiSchema {jsonschema=../schema/res.ListMissionAssigned.json} apiSuccess
*/


/**
* @api {post} /mission/:missionid/assigned Add Assigned
* @apiVersion 1.0.0
* @apiName POST-/mission/:missionid/assigned
* @apiGroup MissionAssigned
* @apiPermission user
*
* @apidescription
*   Remove an assignment
*
* @apiParam {integer} missionid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateMissionAssigned.json} apiParam
* @apiSchema {jsonschema=../schema/missions_assigned.json} apiSuccess
*/


/**
* @api {delete} /mission/:missionid/assigned/:assignedid Remove Assigned
* @apiVersion 1.0.0
* @apiName DELETE-/mission/:missionid/assigned/:assignedid
* @apiGroup MissionAssigned
* @apiPermission user
*
* @apidescription
*   Remove a user from an mission
*
* @apiParam {integer} missionid param
* @apiParam {integer} assignedid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /mission List Missions
* @apiVersion 1.0.0
* @apiName GET-/mission
* @apiGroup Mission
* @apiPermission user
*
* @apidescription
*   Get all missions for the Org
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListMissions.json} apiSuccess
*/


/**
* @api {get} /mission/:missionid Get Mission
* @apiVersion 1.0.0
* @apiName GET-/mission/:missionid
* @apiGroup Mission
* @apiPermission user
*
* @apidescription
*   Get a single mission
*
* @apiParam {integer} missionid param
*
*
*
* @apiSchema {jsonschema=../schema/missions.json} apiSuccess
*/


/**
* @api {post} /mission Create Mission
* @apiVersion 1.0.0
* @apiName POST-/mission
* @apiGroup Mission
* @apiPermission user
*
* @apidescription
*   Create a new mission
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateMission.json} apiParam
* @apiSchema {jsonschema=../schema/missions.json} apiSuccess
*/


/**
* @api {get} /notification Get Notifications
* @apiVersion 1.0.0
* @apiName GET-/notification
* @apiGroup User
* @apiPermission user
*
* @apidescription
*   Get all notifications
*

*
*
*
*
*/


/**
* @api {get} /team/:teamid/user List Users
* @apiVersion 1.0.0
* @apiName GET-/team/:teamid/user
* @apiGroup TeamUsers
* @apiPermission user
*
* @apidescription
*   Get all users that are part of a given team
*
* @apiParam {integer} teamid param
*
*
*
* @apiSchema {jsonschema=../schema/res.ListTeamUsers.json} apiSuccess
*/


/**
* @api {delete} /team/:teamid/user/:userid Remove User
* @apiVersion 1.0.0
* @apiName DELETE-/team/:teamid/user/:userid
* @apiGroup TeamUsers
* @apiPermission user
*
* @apidescription
*   Remove a user from a team
*
* @apiParam {integer} teamid param
* @apiParam {integer} userid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /team/:teamid/user Add User
* @apiVersion 1.0.0
* @apiName POST-/team/:teamid/user
* @apiGroup TeamUsers
* @apiPermission user
*
* @apidescription
*   Add a user to a team
*
* @apiParam {integer} teamid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.AddUID.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /iam Get IAM
* @apiVersion 1.0.0
* @apiName GET-/iam
* @apiGroup IAM
* @apiPermission user
*
* @apidescription
*   Get all teams on the server
*

*
*
*
* @apiSchema {jsonschema=../schema/res.IAM.json} apiSuccess
*/


/**
* @api {get} /team Get Teams
* @apiVersion 1.0.0
* @apiName GET-/team
* @apiGroup Teams
* @apiPermission user
*
* @apidescription
*   Get all teams on the server
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListTeams.json} apiSuccess
*/


/**
* @api {post} /team Create Team
* @apiVersion 1.0.0
* @apiName POST-/team
* @apiGroup Teams
* @apiPermission admin
*
* @apidescription
*   Create a new team
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateTeam.json} apiParam
* @apiSchema {jsonschema=../schema/res.Team.json} apiSuccess
*/


/**
* @api {get} /team/:teamid Get Team
* @apiVersion 1.0.0
* @apiName GET-/team/:teamid
* @apiGroup Teams
* @apiPermission user
*
* @apidescription
*   Return a team
*
* @apiParam {integer} teamid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Team.json} apiSuccess
*/


/**
* @api {patch} /team/:teamid Update Team
* @apiVersion 1.0.0
* @apiName PATCH-/team/:teamid
* @apiGroup Teams
* @apiPermission admin
*
* @apidescription
*   Update a team
*
* @apiParam {integer} teamid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchTeam.json} apiParam
* @apiSchema {jsonschema=../schema/res.Team.json} apiSuccess
*/


/**
* @api {delete} /team/:teamid Delete Team
* @apiVersion 1.0.0
* @apiName DELETE-/team/:teamid
* @apiGroup Teams
* @apiPermission admin
*
* @apidescription
*   Delete a team
*
* @apiParam {integer} teamid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /training/:trainingid/assigned Get Assigned
* @apiVersion 1.0.0
* @apiName GET-/training/:trainingid/assigned
* @apiGroup TrainingAssigned
* @apiPermission user
*
* @apidescription
*   Get users assigned to an training
*
* @apiParam {integer} trainingid param
*
*
*
* @apiSchema {jsonschema=../schema/res.ListTrainingAssigned.json} apiSuccess
*/


/**
* @api {post} /training/:trainingid/assigned Add Assigned
* @apiVersion 1.0.0
* @apiName POST-/training/:trainingid/assigned
* @apiGroup TrainingAssigned
* @apiPermission user
*
* @apidescription
*   Remove an assignment
*
* @apiParam {integer} trainingid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateTrainingAssigned.json} apiParam
* @apiSchema {jsonschema=../schema/training_assigned.json} apiSuccess
*/


/**
* @api {delete} /training/:trainingid/assigned/:assignedid Remove Assigned
* @apiVersion 1.0.0
* @apiName DELETE-/training/:trainingid/assigned/:assignedid
* @apiGroup TrainingAssigned
* @apiPermission user
*
* @apidescription
*   Remove a user from an training
*
* @apiParam {integer} trainingid param
* @apiParam {integer} assignedid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /training List Trainings
* @apiVersion 1.0.0
* @apiName GET-/training
* @apiGroup Training
* @apiPermission user
*
* @apidescription
*   Get all trainings for the Org
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListTrainings.json} apiSuccess
*/


/**
* @api {get} /training/:trainingid Get Training
* @apiVersion 1.0.0
* @apiName GET-/training/:trainingid
* @apiGroup Training
* @apiPermission user
*
* @apidescription
*   Get a single Training
*
* @apiParam {integer} trainingid param
*
*
*
* @apiSchema {jsonschema=../schema/training.json} apiSuccess
*/


/**
* @api {post} /training Create Training
* @apiVersion 1.0.0
* @apiName POST-/training
* @apiGroup Training
* @apiPermission user
*
* @apidescription
*   Create a new training
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateTraining.json} apiParam
* @apiSchema {jsonschema=../schema/training.json} apiSuccess
*/


/**
* @api {patch} /training/:trainingid Update Training
* @apiVersion 1.0.0
* @apiName PATCH-/training/:trainingid
* @apiGroup Training
* @apiPermission user
*
* @apidescription
*   Update an existing training
*
* @apiParam {integer} trainingid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchTraining.json} apiParam
* @apiSchema {jsonschema=../schema/training.json} apiSuccess
*/


/**
* @api {get} /user/:userid/certs Get Certs
* @apiVersion 1.0.0
* @apiName GET-/user/:userid/certs
* @apiGroup Cert
* @apiPermission user
*
* @apidescription
*   Get all certs for the given user
*
* @apiParam {integer} userid param
*
*
*
* @apiSchema {jsonschema=../schema/res.ListCerts.json} apiSuccess
*/


/**
* @api {get} /user Get Users
* @apiVersion 1.0.0
* @apiName GET-/user
* @apiGroup User
* @apiPermission user
*
* @apidescription
*   Get all users on the server
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListUsers.json} apiSuccess
*/


/**
* @api {post} /user Create User
* @apiVersion 1.0.0
* @apiName POST-/user
* @apiGroup User
* @apiPermission admin
*
* @apidescription
*   Create a new user
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateUser.json} apiParam
* @apiSchema {jsonschema=../schema/res.User.json} apiSuccess
*/


/**
* @api {patch} /user/:userid Patch User
* @apiVersion 1.0.0
* @apiName PATCH-/user/:userid
* @apiGroup User
* @apiPermission admin
*
* @apidescription
*   Update an existing user
*
* @apiParam {integer} userid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchUser.json} apiParam
* @apiSchema {jsonschema=../schema/res.User.json} apiSuccess
*/


/**
* @api {get} /user/:userid Create User
* @apiVersion 1.0.0
* @apiName GET-/user/:userid
* @apiGroup User
* @apiPermission user
*
* @apidescription
*   Return a user
*
* @apiParam {integer} userid param
*
*
*
* @apiSchema {jsonschema=../schema/res.User.json} apiSuccess
*/
