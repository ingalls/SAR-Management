import {
    IconChecklist,
    IconSchool,
    IconCalendar,
    IconPhoneCall,
    IconAmbulance,
    IconCertificate
} from '@tabler/icons-vue';

/**
 * Registry of widgets that can be added to the personal dashboard.
 *
 * name: stored in the user_dashboard table and used by Home.vue to render the card
 * w/h: default gridstack size when the widget is first added (12 column grid, 200px rows)
 */
export default [
    {
        name: 'Issues',
        label: 'Issues',
        category: 'Operations',
        icon: IconChecklist,
        description: 'Track active missions and tasks assigned across the team.',
        w: 6,
        h: 4
    },
    {
        name: 'Trainings',
        label: 'Trainings',
        category: 'Training',
        icon: IconSchool,
        description: 'View upcoming training events for the next month.',
        w: 6,
        h: 4
    },
    {
        name: 'Calendar',
        label: 'Calendar',
        category: 'Operations',
        icon: IconCalendar,
        description: 'View upcoming missions and trainings on a calendar.',
        w: 6,
        h: 4
    },
    {
        name: 'OnCall',
        label: 'On-Call',
        category: 'Operations',
        icon: IconPhoneCall,
        description: 'See who is currently on-call for each schedule.',
        w: 6,
        h: 4
    },
    {
        name: 'MissionRate',
        label: 'My Mission Rate',
        category: 'Personal',
        icon: IconAmbulance,
        description: 'Your mission attendance rate for the year, quarter, or all time.',
        w: 4,
        h: 1
    },
    {
        name: 'TrainingRate',
        label: 'My Training Rate',
        category: 'Personal',
        icon: IconCertificate,
        description: 'Your attendance rate for required trainings for the year, quarter, or all time.',
        w: 4,
        h: 1
    }
];
