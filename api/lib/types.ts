import { createSelectSchema } from 'drizzle-typebox';
import { Type } from '@sinclair/typebox'
import * as schemas from './schema.js';

export const StandardResponse = Type.Object({
    status: Type.Integer(),
    message: Type.String()
});

export const ApplicationResponse = createSelectSchema(schemas.Application, {
    id: Type.Integer(),
});
