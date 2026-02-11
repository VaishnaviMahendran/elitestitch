import { Resend } from 'resend';

export async function sendOrderConfirmation(order: any, email: string) {
    // Lazy initialize to avoid build-time errors if env vars are missing
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
        console.warn('RESEND_API_KEY is missing. Email sending skipped.');
        return { success: false, error: 'Missing API Key' };
    }

    const resend = new Resend(apiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Elite Stitch World <onboarding@resend.dev>', // Use verified domain in production
            to: [email],
            subject: `Order Confirmation #${order.id.slice(0, 8)}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #d4a373;">Order Confirmed!</h1>
                    <p>Thank you for your order, ${order.customer_name || 'Valued Customer'}.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> ${order.id}</p>
                        <p><strong>Design:</strong> ${order.design_title}</p>
                        <p><strong>Total Amount:</strong> ₹${order.amount}</p>
                        <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                    </div>

                    <p>We will notify you when your garment is ready.</p>
                    <p>Best regards,<br>The Elite Stitch World Team</p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}
