/**
 * Presentation of the application lifecycle
 * The allowed values mirror api/lib/application-status.ts
 */

export type ApplicationStatus =
    'submitted' | 'reviewing' | 'interview' | 'accepted' |
    'onboarded' | 'declined' | 'withdrawn' | 'closed';

export interface StatusMeta {
    label: string;
    description: string;
    // Tabler colour name used for badges & buttons
    colour: string;
    // Still moving through the process
    active: boolean;
    // Statuses offered as the next step, in the order they are shown
    next: ApplicationStatus[];
}

export const Statuses: Record<ApplicationStatus, StatusMeta> = {
    submitted: {
        label: 'Submitted',
        description: 'Received and waiting for a reviewer',
        colour: 'azure',
        active: true,
        next: ['reviewing', 'declined', 'withdrawn', 'closed']
    },
    reviewing: {
        label: 'Reviewing',
        description: 'Being evaluated by the membership team',
        colour: 'blue',
        active: true,
        next: ['interview', 'accepted', 'declined', 'withdrawn']
    },
    interview: {
        label: 'Interview',
        description: 'Invited to meet the team',
        colour: 'purple',
        active: true,
        next: ['accepted', 'declined', 'withdrawn']
    },
    accepted: {
        label: 'Accepted',
        description: 'Offered a place, waiting on a member account',
        colour: 'lime',
        active: true,
        next: ['onboarded', 'withdrawn']
    },
    onboarded: {
        label: 'Onboarded',
        description: 'Became a member',
        colour: 'green',
        active: false,
        next: []
    },
    declined: {
        label: 'Declined',
        description: 'Turned down by the team',
        colour: 'red',
        active: false,
        next: ['reviewing']
    },
    withdrawn: {
        label: 'Withdrawn',
        description: 'Applicant pulled out',
        colour: 'orange',
        active: false,
        next: ['reviewing']
    },
    closed: {
        label: 'Closed',
        description: 'Closed without a recorded outcome, ie: duplicates or spam',
        colour: 'secondary',
        active: false,
        next: ['reviewing']
    }
};

export const StatusOrder = Object.keys(Statuses) as ApplicationStatus[];

export function statusMeta(status: string): StatusMeta {
    return Statuses[status as ApplicationStatus] || {
        label: status,
        description: '',
        colour: 'secondary',
        active: false,
        next: []
    };
}

// Label used on the button that moves an application into the given status
export const StatusActions: Record<ApplicationStatus, string> = {
    submitted: 'Mark Submitted',
    reviewing: 'Start Review',
    interview: 'Invite to Interview',
    accepted: 'Accept',
    onboarded: 'Mark Onboarded',
    declined: 'Decline',
    withdrawn: 'Mark Withdrawn',
    closed: 'Close'
};
