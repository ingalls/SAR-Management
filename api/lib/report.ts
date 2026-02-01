import { AugmentedMission } from './models/Mission.js';
import { AugmentedMissionAssigned } from './models/MissionAssigned.js';
import { Static } from '@sinclair/typebox';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

export default class Report {
    static logo(): string {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            for (const p of [
                path.resolve(process.cwd(), 'web/public/logo.png'),
                path.resolve(__dirname, '../web/public/logo.png'),
                path.resolve(__dirname, '../../web/public/logo.png')
            ]) {
                if (fs.existsSync(p)) {
                    const img = fs.readFileSync(p);
                    return 'data:image/png;base64,' + img.toString('base64');
                }
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
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        background-color: #ffffff; 
                        color: #111111; 
                        padding: 40px; 
                        line-height: 1.4;
                    }
                    h1 { 
                        font-size: 24px; 
                        text-transform: uppercase; 
                        letter-spacing: 3px; 
                        border-bottom: 2px solid #000000; 
                        padding-bottom: 15px; 
                        margin-bottom: 30px; 
                        color: #000000;
                    }
                    h3 {
                        font-size: 16px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        color: #555555;
                        border-bottom: 1px solid #cccccc;
                        padding-bottom: 5px;
                        margin-top: 40px;
                        margin-bottom: 15px;
                    }
                    .meta { 
                        display: grid; 
                        grid-template-columns: repeat(2, 1fr); 
                        gap: 20px; 
                        background: #f9f9f9; 
                        border: 1px solid #eaeaea; 
                        padding: 20px;
                    }
                    .label { 
                        display: block; 
                        font-size: 10px; 
                        text-transform: uppercase; 
                        color: #666666; 
                        margin-bottom: 5px; 
                        letter-spacing: 1px;
                    }
                    .value {
                        color: #000000;
                        font-weight: bold;
                    }
                    .section { margin-top: 30px; }
                    .description {
                        background: #f9f9f9;
                        border-left: 3px solid #000000;
                        padding: 15px;
                        color: #333333;
                        white-space: pre-wrap;
                        font-size: 14px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        font-size: 14px; 
                    }
                    th { 
                        text-align: left; 
                        padding: 10px; 
                        border-bottom: 1px solid #000000; 
                        color: #333333; 
                        text-transform: uppercase; 
                        font-size: 12px; 
                        letter-spacing: 1px; 
                    }
                    td { 
                        padding: 10px; 
                        border-bottom: 1px solid #eeeeee; 
                        color: #333333; 
                    }
                    tr:last-child td { border-bottom: none; }
                    ul { padding-left: 20px; color: #333333; }
                    li { margin-bottom: 5px; }
                </style>
            </head>
            <body>
                ${logo ? `<img src="${logo}" style="max-height: 80px; display: block; margin: 0 auto 30px auto;" />` : ''}
                
                <h1>Mission Report: ${mission.title}</h1>
                
                <div class="meta">
                    <div>
                        <span class="label">Start Time</span>
                        <span class="value">${mission.start_ts}</span>
                    </div>
                    <div>
                        <span class="label">End Time</span>
                        <span class="value">${mission.end_ts}</span>
                    </div>
                    <div>
                        <span class="label">Location</span>
                        <span class="value">${mission.location || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="label">Mission ID</span>
                        <span class="value">${mission.id}</span>
                    </div>
                    <div style="grid-column: span 2;">
                        <span class="label">Generated At</span>
                        <span class="value">${new Date().toISOString()}</span>
                    </div>
                </div>

                <div class="section">
                    <h3>Description</h3>
                    <div class="description">${mission.body || 'No description provided.'}</div>
                </div>

                ${mission.teams && mission.teams.length ? `
                <div class="section">
                    <h3>Assigned Teams</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mission.teams.map((t) => `
                            <tr>
                                <td>${t.name}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                ${users.length ? `
                <div class="section">
                    <h3>Assigned Personnel</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map((u) => `
                            <tr>
                                <td>${u.fname} ${u.lname}</td>
                                <td><span style="background: #eeeeee; color: #000000; border: 1px solid #000000; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${u.role || 'Unspecified'}</span></td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
            </body>
            </html>
        `;
    }
}
