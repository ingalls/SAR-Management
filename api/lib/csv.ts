import { stringify } from 'csv-stringify/sync';
import type { Response } from 'express';
import type { GenericList } from '@openaddresses/batch-generic';

export type CSVCellFormatter<T> = (item: T, field: string) => unknown;

/**
 * Stream a paged list to the response as a CSV attachment
 *
 * Pages through `list` (100 at a time) so large exports never load in memory
 *
 * @param res       - Express Response
 * @param filename  - Attachment filename
 * @param fields    - Column names, in order
 * @param list      - Callback returning a page of results
 * @param formatter - Optional per-cell formatter, defaults to raw property lookup
 */
export async function streamCSV<T>(
    res: Response,
    filename: string,
    fields: string[],
    list: (page: number, limit: number) => Promise<GenericList<T>>,
    formatter: CSVCellFormatter<T> = (item, field) => (item as Record<string, unknown>)[field]
): Promise<void> {
    const limit = 100;

    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.write(stringify([fields]));

    let total: number;
    let page = 0;
    do {
        const result = await list(page, limit);
        total = result.total;

        for (const item of result.items) {
            const line = fields.map((field) => {
                const value = formatter(item, field);
                return value === undefined || value === null ? '' : value;
            });
            res.write(stringify([line]));
        }

        page++;
    } while (total > (page + 1) * limit);

    res.end();
}
