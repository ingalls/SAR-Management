import { AugmentedMission } from './models/Mission.js';
import { AugmentedMissionAssigned } from './models/MissionAssigned.js';
import { Static } from '@sinclair/typebox';
import fs from 'node:fs';
import path from 'node:path';

export default class Report {
    static logo(): string {
        try {
            const p = path.resolve(process.cwd(), 'web/public/logo.png');
            if (fs.existsSync(p)) {
                 const img = fs.readFileSync(p);
                 return 'data:image/png;base64,' + img.toString('base64');
            }
        } catch (err) {
            console.error(err);
        }
        return '';
    }

    static mission(mission: Static<typeof AugmentedMission>, users: Array<Static<typeof AugmentedMissionAssigned>> = []): string {
        const logo = Report.logo();

        return `
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; padding: 40px; }
                    h1 { border-bottom: 3px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .meta { color: #666; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .section { margin-top: 30px; }
                    .label { font-weight: bold; color: #333; }
                    ul { padding-left: 20px; }
                </style>
            </head>
            <body>
                ${logo ? `<img src="${logo}" style="max-height: 100px; display: block; margin-bottom: 20px;" />` : ''}
                <h1>${mission.title}</h1>
                <div class="meta">
                    <div><span class="label">Start:</span> ${mission.start_ts}</div>
                    <div><span class="label">End:</span> ${mission.end_ts}</div>
                    <div><span class="label">Location:</span> ${mission.location || 'N/A'}</div>
                    <div><span class="label">ID:</span> ${mission.id}</div>
                    <div><span class="label">Retrieved At:</span> ${new Date().toISOString()}</div>
                </div>

                <div class="section">
                    <h3>Description</h3>
                    <div style="white-space: pre-wrap;">${mission.body || 'No description provided.'}</div>
                </div>

                ${users.length ? `
                <div class="section">
                    <h3>Assigned Personnel</h3>
                    <ul>
                        ${users.map((u) => `<li>${u.username} ${u.role ? `(${u.role})` : ''}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                    ${mission.teams && mission.teams.length ? `
                <div class="section">
                    <h3>Assigned Teams</h3>
                    <ul>
                        ${mission.teams.map((t) => `<li>${t.name}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </body>
            </html>
        `;
    }
}
