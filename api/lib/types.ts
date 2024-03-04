import { createSelectSchema } from 'drizzle-typebox';
import { AugmentedApplicationComment } from './models/ApplicationComment.js';
import { Type } from '@sinclair/typebox'
import * as schemas from './schema.js';

export const StandardResponse = Type.Object({
    status: Type.Integer(),
    message: Type.String()
});

export const ApplicationResponse = AugmentedApplicationComment;

export const ApplicationCommentResponse = createSelectSchema(schemas.ApplicationComment, {
    id: Type.Integer(),
    application: Type.Integer(),
});
