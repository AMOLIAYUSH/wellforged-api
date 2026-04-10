import logger from '../utils/logger.js';

interface EmailRecipient {
    email: string;
    name?: string;
}

interface OrderLineItem {
    productName: string;
    quantity: number;
    price: number;
    variantLabel?: string | null;
}

interface EmailPayload {
    to: EmailRecipient;
    subject: string;
    htmlContent: string;
    textContent: string;
}

const brevoApiKey = process.env.BREVO_API_KEY;
const brevoFromEmail = process.env.BREVO_FROM_EMAIL || 'hello@wellforged.in';
const brevoFromName = process.env.BREVO_FROM_NAME || 'Wellforged';
const brevoReplyToEmail = process.env.BREVO_REPLY_TO_EMAIL || 'hello@wellforged.in';
const brevoReplyToName = process.env.BREVO_REPLY_TO_NAME || brevoFromName;
const storefrontUrl = process.env.STOREFRONT_URL || 'https://wellforged.in';
const familyCouponCode = process.env.FAMILY_COUPON_CODE || 'FAMILY10';

const isBrevoConfigured = Boolean(brevoApiKey);

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);

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
            const variant = item.variantLabel ? `<br/><span style="font-size:12px;color:#6d846f;">${escapeHtml(item.variantLabel)}</span>` : '';
            return `
            <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e9dfcf;">
                    <span style="font-weight:600;color:#204635;">${escapeHtml(item.productName)}</span>${variant}
                </td>
                <td style="padding:12px 0;border-bottom:1px solid #e9dfcf;text-align:center;color:#3e6150;">
                    ${item.quantity}
                </td>
                <td style="padding:12px 0;border-bottom:1px solid #e9dfcf;text-align:right;color:#204635;">
                    ${formatCurrency(item.price * item.quantity)}
                </td>
            </tr>`;
        })
        .join('');

const orderItemsToText = (items: OrderLineItem[]) =>
    items
        .map((item) => {
            const variant = item.variantLabel ? ` (${item.variantLabel})` : '';
            return `- ${item.productName}${variant}: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`;
        })
        .join('\n');

const buildOrderConfirmationEmail = (
    customerName: string,
    orderNumber: string,
    totalAmount: number,
    items: OrderLineItem[],
    estimatedDelivery?: string,
) => {
    const safeName = customerName.trim() || 'Customer';
    const amountPaid = formatCurrency(totalAmount);
    const itemsHtml = orderItemsToHtml(items);
    const itemsText = orderItemsToText(items);
    const deliveryText = estimatedDelivery || '3-5 business days';
    const subject = 'Your order is confirmed – Wellforged';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media screen and (max-width: 600px) {
            .container { padding: 20px !important; }
            .header h1 { font-size: 24px !important; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background-color:#f7f3ea;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f7f3ea;">
          <tr>
            <td align="center" style="padding:40px 10px;">
              <table class="container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#fffdf8;border:1px solid #e9dfcf;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                <!-- Header -->
                <tr>
                  <td class="header" style="padding:40px 40px 20px;text-align:left;">
                    <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#6d846f;font-weight:700;">Order Confirmed</p>
                    <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;line-height:1.2;color:#204635;font-weight:400;">Thank you for your order, ${escapeHtml(safeName)}.</h1>
                  </td>
                </tr>
                
                <!-- Intro -->
                <tr>
                  <td style="padding:0 40px 30px;">
                    <p style="margin:0;font-size:16px;line-height:1.6;color:#3e6150;">
                      We're getting your Wellforged order ready. You've joined a community that values radical transparency and uncompromising quality.
                    </p>
                  </td>
                </tr>

                <!-- Order Summary -->
                <tr>
                  <td style="padding:0 40px 30px;">
                    <div style="background-color:#ffffff;border:1px solid #e9dfcf;border-radius:12px;padding:24px;">
                      <h2 style="margin:0 0 16px;font-size:18px;color:#204635;border-bottom:1px solid #f0e6d6;padding-bottom:12px;">Order Summary <span style="font-weight:400;font-size:14px;color:#6d846f;float:right;">#${escapeHtml(orderNumber)}</span></h2>
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <thead>
                          <tr>
                            <th align="left" style="font-size:12px;text-transform:uppercase;color:#6d846f;padding-bottom:12px;">Item</th>
                            <th align="center" style="font-size:12px;text-transform:uppercase;color:#6d846f;padding-bottom:12px;">Qty</th>
                            <th align="right" style="font-size:12px;text-transform:uppercase;color:#6d846f;padding-bottom:12px;">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colspan="2" style="padding:20px 0 0;font-weight:700;color:#204635;font-size:16px;">Total Paid</td>
                            <td align="right" style="padding:20px 0 0;font-weight:700;color:#204635;font-size:18px;">${escapeHtml(amountPaid)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Details -->
                <tr>
                  <td style="padding:0 40px 40px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="vertical-align:top;padding-right:10px;">
                          <h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;color:#6d846f;letter-spacing:0.1em;">Estimated Delivery</h3>
                          <p style="margin:0;font-size:15px;color:#204635;line-height:1.4;">${escapeHtml(deliveryText)}</p>
                        </td>
                        <td width="50%" style="vertical-align:top;">
                          <h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;color:#6d846f;letter-spacing:0.1em;">Next Steps</h3>
                          <p style="margin:0;font-size:15px;color:#204635;line-height:1.4;">You'll receive a tracking link once your parcel is dispatched.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Promo -->
                <tr>
                  <td style="padding:0 40px 40px;">
                    <div style="background-color:#f7f3ea;border-radius:12px;padding:24px;text-align:center;">
                      <p style="margin:0 0 12px;font-size:14px;color:#3e6150;">Share the wellness? Use this code for your next restock:</p>
                      <div style="display:inline-block;padding:8px 20px;border:2px dashed #6d846f;border-radius:8px;font-weight:700;color:#204635;font-size:18px;letter-spacing:2px;">${escapeHtml(familyCouponCode)}</div>
                      <p style="margin:12px 0 0;font-size:12px;color:#6d846f;">10% OFF for the Wellforged Family</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:40px;background-color:#204635;color:#ffffff;text-align:center;">
                    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;">Wellforged</p>
                    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#a8c4b2;">
                      Uncompromising supplements for the dedicated.<br/>
                      Questions? Reply to this email or contact <a href="mailto:hello@wellforged.in" style="color:#ffffff;text-decoration:underline;">hello@wellforged.in</a>
                    </p>
                    <a href="${storefrontUrl}" style="display:inline-block;background-color:#fffdf8;color:#204635;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">Visit Store</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;color:#6d846f;text-align:center;">&copy; 2026 Wellforged. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const textContent = [
        `Thank you for your order, ${safeName}!`,
        '',
        `Order Number: #${orderNumber}`,
        '---------------------------------------',
        itemsText,
        '---------------------------------------',
        `Total Amount Paid: ${amountPaid}`,
        '',
        `Estimated Delivery: ${deliveryText}`,
        '',
        `Next Steps: You'll receive a tracking link once your parcel is dispatched.`,
        '',
        `Exclusive Offer: Use ${familyCouponCode} for 10% OFF on your next restock.`,
        '',
        'Stay Bold. Stay Well.',
        'Wellforged Team',
        '',
        `Visit Store: ${storefrontUrl}`,
        `Support: hello@wellforged.in`,
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
    const subject = `Wellforged Order Update: ${titleStatus} - #${orderNumber}`;

    const htmlContent = `
      <div style="background-color:#f7f3ea;padding:40px 20px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#254f3d;">
        <div style="max-width:600px;margin:0 auto;background-color:#fffdf8;border:1px solid #e9dfcf;border-radius:16px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <p style="margin:0 0 16px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#6d846f;font-weight:700;">Order Update</p>
          <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;line-height:1.2;color:#204635;font-weight:400;">Hi ${escapeHtml(safeName)}, your order is now ${escapeHtml(titleStatus)}.</h1>
          <p style="margin:0 0 30px;font-size:16px;line-height:1.6;color:#3e6150;">
            Order <strong>#${escapeHtml(orderNumber)}</strong> has moved to the next stage. We'll keep you updated as it makes its way to you.
          </p>
          <div style="margin-top:30px;">
            <a href="${escapeHtml(storefrontUrl)}" style="display:inline-block;background-color:#204635;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">
              Visit Wellforged
            </a>
          </div>
          <hr style="margin:40px 0 20px;border:0;border-top:1px solid #e9dfcf;" />
          <p style="font-size:14px;color:#6d846f;">Questions? <a href="mailto:hello@wellforged.in" style="color:#204635;">Contact Support</a></p>
        </div>
      </div>
    `;

    const textContent = [
        `Hi ${safeName},`,
        '',
        `Your order #${orderNumber} is now ${titleStatus}.`,
        'We\'ll keep you updated as it progresses.',
        '',
        `Visit Wellforged: ${storefrontUrl}`,
        `Support: hello@wellforged.in`,
    ].join('\n');

    return { subject, htmlContent, textContent };
};

class MailerService {
    static isConfigured(): boolean {
        return isBrevoConfigured;
    }

    private static async withRetry<T>(
        operation: () => Promise<T>,
        retries: number = 3,
        delay: number = 1000
    ): Promise<T> {
        try {
            return await operation();
        } catch (error: any) {
            if (retries <= 0) throw error;
            
            // Don't retry on client errors (4xx) unless it's 429 (Too Many Requests)
            if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
                throw error;
            }

            logger.warn(`Email retry attempt remaining: ${retries}. Error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.withRetry(operation, retries - 1, delay * 2);
        }
    }

    static async sendEmail(payload: EmailPayload): Promise<void> {
        if (!isBrevoConfigured) {
            logger.warn('Brevo email skipped: missing BREVO_API_KEY', {
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
            replyTo: {
                email: brevoReplyToEmail,
                name: brevoReplyToName,
            },
            subject: payload.subject,
            htmlContent: payload.htmlContent,
            textContent: payload.textContent,
        };

        const executeRequest = async () => {
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
                const error: any = new Error(`Brevo API error: ${response.status} ${errorBody}`);
                error.status = response.status;
                throw error;
            }

            return response.json();
        };

        try {
            await this.withRetry(() => executeRequest());
            logger.info('Brevo email sent successfully', {
                to: payload.to.email,
                subject: payload.subject,
            });
        } catch (error: any) {
            logger.error('Failed to send Brevo email after retries', {
                to: payload.to.email,
                subject: payload.subject,
                error: error.message,
            });
            throw error;
        }
    }

    static async sendOrderConfirmation(
        email: string, 
        customerName: string, 
        orderNumber: string, 
        totalAmount: number, 
        items: OrderLineItem[],
        estimatedDelivery?: string
    ): Promise<void> {
        const template = buildOrderConfirmationEmail(customerName, orderNumber, totalAmount, items, estimatedDelivery);
        await this.sendEmail({
            to: { email, name: customerName },
            ...template,
        });
    }

    static async sendShippingUpdate(
        email: string, 
        customerName: string, 
        orderNumber: string, 
        status: string
    ): Promise<void> {
        const template = buildOrderStatusEmail(customerName, orderNumber, status);
        await this.sendEmail({
            to: { email, name: customerName },
            ...template,
        });
    }
}

export default MailerService;
