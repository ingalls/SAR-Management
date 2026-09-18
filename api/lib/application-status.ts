/**
 * Lifecycle of a membership application
 *
 * submitted => reviewing => interview => accepted => onboarded
 *
 * with declined, withdrawn & closed available as terminal outcomes from any open status.
 * `closed` is an application that was shut without a recorded outcome (duplicates, spam
 * and applications archived before statuses existed)
 */
export enum ApplicationStatus {
    SUBMITTED = 'submitted',
    REVIEWING = 'reviewing',
    INTERVIEW = 'interview',
    ACCEPTED = 'accepted',
    ONBOARDED = 'onboarded',
    DECLINED = 'declined',
    WITHDRAWN = 'withdrawn',
    CLOSED = 'closed'
}

export const ApplicationStatusOpen: string[] = [
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.REVIEWING,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.ACCEPTED
];

export const ApplicationStatusClosed: string[] = [
    ApplicationStatus.ONBOARDED,
    ApplicationStatus.DECLINED,
    ApplicationStatus.WITHDRAWN,
    ApplicationStatus.CLOSED
];

export enum ApplicationEventType {
    // Application was received, author is NULL for public submissions
    CREATED = 'created',
    STATUS = 'status',
    ASSIGNED = 'assigned',
    COHORT = 'cohort',
    // Applicant details or answers were edited by a reviewer
    EDITED = 'edited',
    // Linked or unlinked from a member account
    LINKED = 'linked',
    // An email was sent to the applicant
    EMAIL = 'email'
}
