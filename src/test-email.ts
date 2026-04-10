import 'dotenv/config';
import MailerService from './services/mailer.service.js';

async function testEmail() {
    console.log('--- Wellforged Email Integration Test ---');
    
    const testRecipient = process.argv[2] || 'test@example.com';
    
    if (!process.env.BREVO_API_KEY) {
        console.error('Error: BREVO_API_KEY is not set in environment variables.');
        process.exit(1);
    }

    console.log(`Using API Key: ${process.env.BREVO_API_KEY.substring(0, 8)}...`);
    console.log(`Sending test email to: ${testRecipient}`);

    try {
        await MailerService.sendOrderConfirmation(
            testRecipient,
            'Test Customer',
            'WF-TEST-RECAP',
            4500,
            [
                { 
                    productName: 'Raw Whey Protein (Unflavored)', 
                    quantity: 2, 
                    price: 2000,
                    variantLabel: '1kg Pouch'
                },
                { 
                    productName: 'Shaker Bottle', 
                    quantity: 1, 
                    price: 500 
                }
            ],
            '3-5 business days'
        );
        console.log('✅ Success! Order confirmation email sent.');
    } catch (error: any) {
        console.error('❌ Failed to send email:', error.message);
    }
}

testEmail();
