import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { Interfaces } from 'mailgun.js/definitions';
import Mailgen from 'mailgen';
import Err from '@openaddresses/batch-error';
import Config from './config.js';
import { Notification } from './schema.js';
import { InferSelectModel } from 'drizzle-orm';

const mailgun = new Mailgun(formData);

/**
 * Email validation helper
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Email error types for better error handling
 */
enum EmailErrorType {
    VALIDATION = 'VALIDATION',
    AUTHENTICATION = 'AUTHENTICATION', 
    RATE_LIMIT = 'RATE_LIMIT',
    NETWORK = 'NETWORK',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Enhanced email error class
 */
class EmailError extends Error {
    type: EmailErrorType;
    originalError?: Error;
    
    constructor(message: string, type: EmailErrorType, originalError?: Error) {
        super(message);
        this.name = 'EmailError';
        this.type = type;
        this.originalError = originalError;
    }
}

/**
 * @class
 *
 * @prop {Config} config Serverwide Config
 * @prop {Object} mailGenerator MailGen Generation API
 */
export default class Email {
    config: Config;
    mg: Interfaces.IMailgunClient;
    mailGenerator: Mailgen;

    constructor(config: Config) {
        this.config = config;

        // Validate required configuration
        if (!config.MailGun) {
            throw new EmailError('MailGun API key is not configured', EmailErrorType.VALIDATION);
        }

        this.mg = mailgun.client({
            username: 'api',
            key: config.MailGun
        });

        this.mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: this.config.OrgName,
                link: this.config.URL
            }
        });
    }

    /**
     * Enhanced error handling for mailgun errors
     */
    private handleMailgunError(err: any): EmailError {
        if (err?.status === 401 || err?.status === 403) {
            return new EmailError('Email authentication failed', EmailErrorType.AUTHENTICATION, err);
        }
        if (err?.status === 429) {
            return new EmailError('Email rate limit exceeded', EmailErrorType.RATE_LIMIT, err);
        }
        if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED') {
            return new EmailError('Network error sending email', EmailErrorType.NETWORK, err);
        }
        return new EmailError(`Failed to send email: ${err?.message || 'Unknown error'}`, EmailErrorType.UNKNOWN, err);
    }

    /**
     * Retry logic for email sending
     */
    private async retryOperation<T>(
        operation: () => Promise<T>, 
        maxRetries: number = 3,
        delayMs: number = 1000
    ): Promise<T> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (err) {
                const emailError = err instanceof EmailError ? err : this.handleMailgunError(err);
                
                // Don't retry validation or authentication errors
                if (emailError.type === EmailErrorType.VALIDATION || 
                    emailError.type === EmailErrorType.AUTHENTICATION) {
                    throw emailError;
                }
                
                // Last attempt, throw the error
                if (attempt === maxRetries) {
                    console.error(`Email sending failed after ${maxRetries} attempts:`, emailError.message);
                    throw emailError;
                }
                
                // Wait before retrying (exponential backoff)
                const delay = delayMs * Math.pow(2, attempt - 1);
                console.warn(`Email sending attempt ${attempt} failed, retrying in ${delay}ms:`, emailError.message);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw new EmailError('Unexpected error in retry logic', EmailErrorType.UNKNOWN);
    }

    /**
     * Log email operations for monitoring
     */
    private logEmailOperation(to: string, subject: string, success: boolean, error?: EmailError) {
        const logData = {
            timestamp: new Date().toISOString(),
            to: to.replace(/(.{3}).*@/, '$1***@'), // Partially hide email for privacy
            subject,
            success,
            error: error ? { type: error.type, message: error.message } : undefined
        };
        
        if (success) {
            console.log('Email sent successfully:', JSON.stringify(logData));
        } else {
            console.error('Email sending failed:', JSON.stringify(logData));
        }
    }

    /**
     * Send an email verification to the user
     *
     * @param {Object} user
     * @param {String} user.username
     * @param {String} user.email
     * @param {String} user.token
     */
    async verify(user: {
        username: string;
        email: string;
        token: string;
    }): Promise<void> {
        // Validate input parameters
        if (!user.username?.trim()) {
            throw new EmailError('Username is required for verification email', EmailErrorType.VALIDATION);
        }
        if (!user.email?.trim()) {
            throw new EmailError('Email is required for verification email', EmailErrorType.VALIDATION);
        }
        if (!user.token?.trim()) {
            throw new EmailError('Token is required for verification email', EmailErrorType.VALIDATION);
        }

        const email = {
            body: {
                name: user.email,
                intro: 'SAR Email Confirmation',
                action: {
                    instructions: `Hello ${user.username}, to finish creating your account, please click here:`,
                    button: {
                        color: 'green',
                        text: 'Verify Email',
                        link: String(new URL(`/login/verify?token=${encodeURIComponent(user.token)}`, this.config.URL))
                    }
                },
                outro: ''
            }
        };

        try {
            await this.send(user.email, 'SAR Email Verification', this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Confirmation Error');
        }
    }

    async forgot(user: {
        username: string;
        email: string;
        token: string;
    }): Promise<void> {
        // Validate input parameters
        if (!user.username?.trim()) {
            throw new EmailError('Username is required for password reset email', EmailErrorType.VALIDATION);
        }
        if (!user.email?.trim()) {
            throw new EmailError('Email is required for password reset email', EmailErrorType.VALIDATION);
        }
        if (!user.token?.trim()) {
            throw new EmailError('Token is required for password reset email', EmailErrorType.VALIDATION);
        }

        const email = {
            body: {
                name: user.email,
                intro: 'SAR Password Reset',
                action: {
                    instructions: `Hello ${user.username}, to reset your password, please click here:`,
                    button: {
                        color: 'green',
                        text: 'Password Reset',
                        link: String(new URL(`/login/reset?token=${encodeURIComponent(user.token)}`, this.config.URL))
                    }
                },
                outro: ''
            }
        };

        try {
            await this.send(user.email, 'SAR Password Reset', this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Forgot Error');
        }
    }

    async newuser(user: {
        fname: string;
        email: string;
    }): Promise<void> {
        // Validate input parameters
        if (!user.fname?.trim()) {
            throw new EmailError('First name is required for new user email', EmailErrorType.VALIDATION);
        }
        if (!user.email?.trim()) {
            throw new EmailError('Email is required for new user email', EmailErrorType.VALIDATION);
        }

        const email = {
            body: {
                name: user.email,
                intro: `Welcome to ${this.config.OrgName}`,
                action: {
                    instructions: `Hello ${user.fname}, a SAR account has been set up for you. Please reset the password to log in.`,
                    button: {
                        color: 'green',
                        text: 'Set Password',
                        link: String(new URL('/login/forgot', this.config.URL))
                    }
                },
                outro: 'Problems? Contact Nick Ingalls: 202-390-6116 or rescue@ingalls.ca'
            }
        };

        try {
            await this.send(user.email, `Welcome to ${this.config.OrgName}`, this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Forgot Error');
        }
    }

    async send(to: string, subject: string, body: string): Promise<void> {
        // Input validation
        if (!to) throw new EmailError('Recipient email address is required', EmailErrorType.VALIDATION);
        if (!subject) throw new EmailError('Email subject is required', EmailErrorType.VALIDATION);
        if (!body) throw new EmailError('Email body is required', EmailErrorType.VALIDATION);
        
        // Email format validation
        if (!isValidEmail(to)) {
            throw new EmailError(`Invalid email address format: ${to}`, EmailErrorType.VALIDATION);
        }

        const from = `${this.config.OrgName} No Reply <robot@mesacountysar.com>`;

        try {
            await this.retryOperation(async () => {
                await this.mg.messages.create('robot.mesacountysar.com', {
                    to, 
                    from, 
                    subject,
                    html: body,
                    // Add timeout configuration
                    timeout: 30000, // 30 seconds timeout
                    'o:tracking': 'yes', // Enable tracking for monitoring
                    'o:tracking-clicks': 'yes',
                    'o:tracking-opens': 'yes'
                });
            });
            
            this.logEmailOperation(to, subject, true);
        } catch (err) {
            const emailError = err instanceof EmailError ? err : this.handleMailgunError(err);
            this.logEmailOperation(to, subject, false, emailError);
            throw new Err(500, emailError, 'Failed to send email');
        }
    }

    async user_disabled(user: {
        email: string;
    }): Promise<void> {
        // Validate input parameters
        if (!user.email?.trim()) {
            throw new EmailError('Email is required for user disabled notification', EmailErrorType.VALIDATION);
        }

        const email = {
            body: {
                name: user.email,
                intro: `${this.config.OrgName} - Account Disabled`,
                outro: 'Your account has been disabled - please notify us if this has been done in error'
            }
        };

        try {
            await this.send(user.email, `${this.config.OrgName} - Account Disabled`, this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Notification');
        }
    }

    async notify(
        user: {
            email: string;
        },
        notify: InferSelectModel<typeof Notification>
    ): Promise<void> {
        // Validate input parameters
        if (!user.email?.trim()) {
            throw new EmailError('Email is required for notification', EmailErrorType.VALIDATION);
        }
        if (!notify?.text?.trim()) {
            throw new EmailError('Notification text is required', EmailErrorType.VALIDATION);
        }

        const email = {
            body: {
                name: user.email,
                intro: `${this.config.OrgName} - Notification`,
                action: {
                    instructions: notify.text,
                    button: {
                        color: 'green',
                        text: 'Check Notifications',
                        link: String(new URL('/notification', this.config.URL))
                    }
                },
                outro: ''
            }
        };

        try {
            await this.send(user.email, `${this.config.OrgName} - New Notification`, this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Notification');
        }
    }
}
