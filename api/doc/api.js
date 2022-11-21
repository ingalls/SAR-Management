
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
* @apiSchema {jsonschema=../schema/res.Issue.json} apiSuccess
*/
