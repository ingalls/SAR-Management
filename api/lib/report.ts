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
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        background-color: #1a1a1a; 
                        color: #e0e0e0; 
                        padding: 40px; 
                        line-height: 1.4;
                    }
                    h1 { 
                        font-size: 24px; 
                        text-transform: uppercase; 
                        letter-spacing: 3px; 
                        border-bottom: 2px solid #58a6ff; 
                        padding-bottom: 15px; 
                        margin-bottom: 30px; 
                        color: #fff;
                    }
                    h3 {
                        font-size: 16px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        color: #8b949e;
                        border-bottom: 1px solid #30363d;
                        padding-bottom: 5px;
                        margin-top: 40px;
                        margin-bottom: 15px;
                    }
                    .meta { 
                        display: grid; 
                        grid-template-columns: repeat(2, 1fr); 
                        gap: 20px; 
                        background: #0d1117; 
                        border: 1px solid #30363d; 
                        padding: 20px;
                    }
                    .label { 
                        display: block; 
                        font-size: 10px; 
                        text-transform: uppercase; 
                        color: #8b949e; 
                        margin-bottom: 5px; 
                        letter-spacing: 1px;
                    }
                    .value {
                        color: #58a6ff;
                        font-weight: bold;
                    }
                    .section { margin-top: 30px; }
                    .description {
                        background: #0d1117;
                        border-left: 3px solid #58a6ff;
                        padding: 15px;
                        color: #c9d1d9;
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
                        border-bottom: 1px solid #30363d; 
                        color: #8b949e; 
                        text-transform: uppercase; 
                        font-size: 12px; 
                        letter-spacing: 1px; 
                    }
                    td { 
                        padding: 10px; 
                        border-bottom: 1px solid #21262d; 
                        color: #c9d1d9; 
                    }
                    tr:last-child td { border-bottom: none; }
                    ul { padding-left: 20px; color: #c9d1d9; }
                    li { margin-bottom: 5px; }
                </style>
            </head>
            <body>
                ${logo ? `<img src="${logo}" style="max-height: 80px; display: block; margin-bottom: 30px; filter: brightness(0) invert(1);" />` : ''}
                
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
                                <td><span style="background: #1f6feb; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${u.role || 'Unspecified'}</span></td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
                
                ${mission.teams && mission.teams.length ? `
                <div class="section">
                    <h3>Assigned Teams</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${mission.teams.map((t) => `
                            <div style="background: #21262d; border: 1px solid #30363d; padding: 5px 10px; color: #58a6ff;">${t.name}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </body>
            </html>
        `;
    }
}
