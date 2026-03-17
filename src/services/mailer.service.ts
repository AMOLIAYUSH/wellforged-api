import logger from '../utils/logger.js';

interface EmailRecipient {
    email: string;
    name?: string;
}

interface OrderLineItem {
    productName: string;
    quantity: number;
    variantLabel?: string | null;
}

interface EmailPayload {
    to: EmailRecipient;
    subject: string;
    htmlContent: string;
    textContent: string;
}

const brevoApiKey = process.env.BREVO_API_KEY;
const brevoFromEmail = process.env.BREVO_FROM_EMAIL;
const brevoFromName = process.env.BREVO_FROM_NAME || 'WellForged';
const brevoReplyToEmail = process.env.BREVO_REPLY_TO_EMAIL;
const brevoReplyToName = process.env.BREVO_REPLY_TO_NAME || brevoFromName;
const storefrontUrl = process.env.STOREFRONT_URL || 'https://wellforged-ui.vercel.app/product';
const familyCouponCode = process.env.FAMILY_COUPON_CODE || 'FAMILY10';

const isBrevoConfigured = Boolean(brevoApiKey && brevoFromEmail);

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);

const buildReplyTo = () => {
    if (!brevoReplyToEmail) {
        return undefined;
    }

    return {
        email: brevoReplyToEmail,
        name: brevoReplyToName,
    };
};

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const orderItemsToHtml = (items: OrderLineItem[]) =>
    items
        .map((item) => {
            const variant = item.variantLabel ? ` - ${escapeHtml(item.variantLabel)}` : '';
            return `<li style="margin-bottom:8px;">${escapeHtml(item.productName)}${variant} x ${item.quantity}</li>`;
        })
        .join('');

const orderItemsToText = (items: OrderLineItem[]) =>
    items
        .map((item) => {
            const variant = item.variantLabel ? ` - ${item.variantLabel}` : '';
            return `- ${item.productName}${variant} x ${item.quantity}`;
        })
        .join('\n');

const buildOrderConfirmationEmail = (
    customerName: string,
    orderNumber: string,
    totalAmount: number,
    items: OrderLineItem[],
) => {
    const safeName = customerName.trim() || 'Customer';
    const amountPaid = formatCurrency(totalAmount);
    const itemsHtml = orderItemsToHtml(items);
    const itemsText = orderItemsToText(items);
    const subject = `Welcome to the WellForged Family, ${safeName}! Order Confirmation`;

    const htmlContent = `
      <div style="background:#f7f3ea;padding:32px 16px;font-family:Georgia,serif;color:#254f3d;">
        <div style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #e9dfcf;border-radius:24px;padding:32px;">
          <p style="margin:0 0 16px;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#6d846f;">Order Confirmed</p>
          <h1 style="margin:0 0 20px;font-size:32px;line-height:1.15;color:#204635;">Welcome to the WellForged Family, ${escapeHtml(safeName)}.</h1>
          <p style="margin:0 0 16px;font:16px/1.8 'Helvetica Neue',Arial,sans-serif;color:#3e6150;">
            Most brands talk about quality; we verify it. By choosing us, you have not just bought a supplement - you have joined a movement for radical transparency.
          </p>
          <p style="margin:0 0 24px;font:16px/1.8 'Helvetica Neue',Arial,sans-serif;color:#3e6150;">
            Our team is already preparing your parcel. We have double-checked the lab reports, and it is ready to make its way to you.
          </p>

          <div style="border:1px solid #e9dfcf;border-radius:20px;padding:24px;background:#fff;">
            <h2 style="margin:0 0 16px;font-size:22px;color:#204635;">Order Summary</h2>
            <p style="margin:0 0 8px;font:15px/1.7 'Helvetica Neue',Arial,sans-serif;color:#3e6150;"><strong>Order ID:</strong> #${escapeHtml(orderNumber)}</p>
            <ul style="margin:0 0 12px 18px;padding:0;font:15px/1.7 'Helvetica Neue',Arial,sans-serif;color:#3e6150;">
              ${itemsHtml}
            </ul>
            <p style="margin:0;font:15px/1.7 'Helvetica Neue',Arial,sans-serif;color:#3e6150;"><strong>Amount Paid:</strong> ${escapeHtml(amountPaid)}</p>
          </div>

          <div style="margin-top:24px;padding:24px;border-radius:20px;background:#f7f3ea;border:1px solid #e9dfcf;">
            <h2 style="margin:0 0 12px;font-size:20px;color:#204635;">What's Next?</h2>
            <p style="margin:0 0 14px;font:15px/1.8 'Helvetica Neue',Arial,sans-serif;color:#3e6150;">
              Once your order is dispatched, you will receive a tracking link. Inside your package, you will find a QR code that reveals the exact third-party lab report for the batch in your hand.
            </p>
            <p style="margin:0;font:15px/1.8 'Helvetica Neue',Arial,sans-serif;color:#3e6150;">
              Use <strong>${escapeHtml(familyCouponCode)}</strong> for 10% off when you are ready to restock.
            </p>
          </div>

          <div style="margin-top:28px;">
            <a href="${escapeHtml(storefrontUrl)}" style="display:inline-block;background:#214f3d;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font:700 13px/1.2 'Helvetica Neue',Arial,sans-serif;letter-spacing:0.16em;text-transform:uppercase;">
              Shop More at WellForged
            </a>
          </div>

          <p style="margin:28px 0 0;font:15px/1.8 'Helvetica Neue',Arial,sans-serif;color:#3e6150;">
            Stay Bold. Stay Well.<br />
            <strong>Ayush Amoli</strong><br />
            Founder, WellForged<br />
            The No-Nonsense Supplement Brand
          </p>
        </div>
      </div>
    `;

    const textContent = [
        `Welcome to the WellForged Family, ${safeName}.`,
        '',
        'Most brands talk about quality; we verify it. By choosing us, you have joined a movement for radical transparency.',
        'Your order is confirmed and our team is already preparing your parcel.',
        '',
        `Order ID: #${orderNumber}`,
        itemsText,
        `Amount Paid: ${amountPaid}`,
        '',
        "What's Next?",
        'Once your order is dispatched, you will receive a tracking link. Inside your package, you will find a QR code to view the exact third-party lab report for your batch.',
        `Use ${familyCouponCode} for 10% off on your next purchase.`,
        '',
        `Shop More: ${storefrontUrl}`,
        '',
        'Stay Bold. Stay Well.',
        'Ayush Amoli',
        'Founder, WellForged',
    ].join('\n');

    return { subject, htmlContent, textContent };
};

const buildOrderStatusEmail = (
    customerName: string,
    orderNumber: string,
    status: string,
) => {
    const safeName = customerName.trim() || 'Customer';
    const normalizedStatus = status.replace(/_/g, ' ');
    const titleStatus = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
    const subject = `WellForged Order Update: ${titleStatus} - #${orderNumber}`;

    const htmlContent = `
      <div style="background:#f7f3ea;padding:32px 16px;font-family:Georgia,serif;color:#254f3d;">
        <div style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #e9dfcf;border-radius:24px;padding:32px;">
          <p style="margin:0 0 16px;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#6d846f;">Order Update</p>
          <h1 style="margin:0 0 20px;font-size:30px;line-height:1.15;color:#204635;">Hi ${escapeHtml(safeName)}, your order is now ${escapeHtml(titleStatus)}.</h1>
          <p style="margin:0 0 14px;font:16px/1.8 'Helvetica Neue',Arial,sans-serif;color:#3e6150;">
            Order <strong>#${escapeHtml(orderNumber)}</strong> has moved to the next stage. We will keep you updated as it progresses.
          </p>
          <div style="margin-top:24px;">
            <a href="${escapeHtml(storefrontUrl)}" style="display:inline-block;background:#214f3d;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font:700 13px/1.2 'Helvetica Neue',Arial,sans-serif;letter-spacing:0.16em;text-transform:uppercase;">
              Visit WellForged
            </a>
          </div>
        </div>
      </div>
    `;

    const textContent = [
        `Hi ${safeName},`,
        '',
        `Your order #${orderNumber} is now ${titleStatus}.`,
        'We will keep you updated as it progresses.',
        '',
        `Visit WellForged: ${storefrontUrl}`,
    ].join('\n');

    return { subject, htmlContent, textContent };
};

export class MailerService {
    static isConfigured(): boolean {
        return isBrevoConfigured;
    }

    static async sendEmail(payload: EmailPayload): Promise<void> {
        if (!isBrevoConfigured) {
            logger.warn('Brevo email skipped: missing configuration', {
                to: payload.to.email,
                subject: payload.subject,
            });
            return;
        }

        const body: Record<string, unknown> = {
            sender: {
                email: brevoFromEmail,
                name: brevoFromName,
            },
            to: [
                {
                    email: payload.to.email,
                    ...(payload.to.name ? { name: payload.to.name } : {}),
                },
            ],
            subject: payload.subject,
            htmlContent: payload.htmlContent,
            textContent: payload.textContent,
        };

        const replyTo = buildReplyTo();
        if (replyTo) {
            body.replyTo = replyTo;
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey as string,
                'content-type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Brevo email failed: ${response.status} ${errorBody}`);
        }

        logger.info('Brevo email sent successfully', {
            to: payload.to.email,
            subject: payload.subject,
        });
    }

    static async sendOrderConfirmation(email: string, customerName: string, orderNumber: string, totalAmount: number, items: OrderLineItem[]): Promise<void> {
        const template = buildOrderConfirmationEmail(customerName, orderNumber, totalAmount, items);
        await this.sendEmail({
            to: { email, name: customerName },
            ...template,
        });
    }

    static async sendShippingUpdate(email: string, customerName: string, orderNumber: string, status: string): Promise<void> {
        const template = buildOrderStatusEmail(customerName, orderNumber, status);
        await this.sendEmail({
            to: { email, name: customerName },
            ...template,
        });
    }
}

export default MailerService;
