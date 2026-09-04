import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';

/**
 * Visual fields shared by Mission & Training Tags - tags render as badges
 * (like Teams) with an optional inline SVG logo
 */
export const TagVisualFields = {
    icon: Type.Optional(Type.String({
        description: 'SVG logo as a data:image/svg+xml URI, or an empty string for no logo',
        maxLength: 256 * 1024
    })),
    colour_bg: Type.Optional(Type.String({
        description: 'Badge background colour as a hex string ie: #808080',
        pattern: '^#[0-9a-fA-F]{6}$'
    })),
    colour_txt: Type.Optional(Type.String({
        description: 'Badge text colour as a hex string ie: #000000',
        pattern: '^#[0-9a-fA-F]{6}$'
    })),
};

export function validateTagVisuals(body: { icon?: string }): void {
    if (body.icon && !body.icon.startsWith('data:image/svg+xml')) {
        throw new Err(400, null, 'Tag icon must be an SVG image (data:image/svg+xml)');
    }
}
