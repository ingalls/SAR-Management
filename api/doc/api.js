
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
* @api {get} /aggregate/:aggregate Get Aggregates
* @apiVersion 1.0.0
* @apiName GET-/aggregate/:aggregate
* @apiGroup Aggregate
* @apiPermission public
*
* @apidescription
*   Retrieve aggregates for a given time range
*
* @apiParam {string} aggregate param
*
*
*
* @apiSchema {jsonschema=../schema/res.Aggregate.json} apiSuccess
*/


/**
* @api {get} /field Get Fields
* @apiVersion 1.0.0
* @apiName GET-/field
* @apiGroup Field
* @apiPermission public
*
* @apidescription
*   Retrieve all fields for a given time range
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListField.json} apiSuccess
*/


/**
* @api {get} /field/export Export Fields
* @apiVersion 1.0.0
* @apiName GET-/field/export
* @apiGroup Field
* @apiPermission public
*
* @apidescription
*   Export all fields for a given time range to a CSV
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ExportField.json} apiParam
*
*
*/


/**
* @api {post} /record Record Stats
* @apiVersion 1.0.0
* @apiName POST-/record
* @apiGroup Record
* @apiPermission user
*
* @apidescription
*   The daily ETL process will push updates to this endpoint
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.Record.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /total Get Totals
* @apiVersion 1.0.0
* @apiName GET-/total
* @apiGroup Total
* @apiPermission public
*
* @apidescription
*   Retrieve total users across time
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListTotal.json} apiSuccess
*/


/**
* @api {get} /total/export Export Totals
* @apiVersion 1.0.0
* @apiName GET-/total/export
* @apiGroup Total
* @apiPermission public
*
* @apidescription
*   Export total users across time to a CSV
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ExportTotal.json} apiParam
*
*
*/
