import logger from '../utils/logger.js';

/**
 * Mailer Service
 * Abstracting email logic to allow easy switching between 
 * providers (SendGrid, Postmark, SES) and local logging.
 */

interface EmailPayload {
    to: string;
    subject: string;
    templateName: string;
    context: Record<string, any>;
}

export class MailerService {
    /**
     * Sends an email by logging it to the console/logger.
     * In production, this would integrate with a real provider.
     */
    static async sendEmail(payload: EmailPayload): Promise<void> {
        const { to, subject, templateName, context } = payload;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        logger.info(`[Email Service]: Sending "${subject}" to ${to}`, {
            template: templateName,
            orderId: context.orderId || 'N/A'
        });

        // Log a pretty version for development
        if (process.env.NODE_ENV !== 'production') {
            console.log('\n--- 📧 TRANSACTIONAL EMAIL SIMULATION ---');
            console.log(`To:      ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Template: ${templateName}`);
            console.log(`Data:    ${JSON.stringify(context, null, 2)}`);
            console.log('--- END OF EMAIL ---\n');
        }
    }

    /**
     * Helper for order confirmations
     */
    static async sendOrderConfirmation(email: string, orderId: string, total: number): Promise<void> {
        return this.sendEmail({
            to: email,
            subject: `Order Confirmed - #${orderId.slice(0, 8).toUpperCase()}`,
            templateName: 'order_confirmation',
            context: { orderId, total }
        });
    }

    /**
     * Helper for shipping updates
     */
    static async sendShippingUpdate(email: string, orderId: string, status: string): Promise<void> {
        return this.sendEmail({
            to: email,
            subject: `Order Update - #${orderId.slice(0, 8).toUpperCase()}`,
            templateName: 'shipping_update',
            context: { orderId, status }
        });
    }
}

export default MailerService;
