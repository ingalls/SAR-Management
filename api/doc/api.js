
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
* @apiPermission public
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
* @apiPermission public
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
* @apiSchema {jsonschema=../schema/issues_comments.json} apiSuccess
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
*
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
* @apiSchema {jsonschema=../schema/issues.json} apiSuccess
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
* @apiSchema {jsonschema=../schema/issues.json} apiSuccess
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
* @apiSchema {jsonschema=../schema/issues.json} apiSuccess
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
