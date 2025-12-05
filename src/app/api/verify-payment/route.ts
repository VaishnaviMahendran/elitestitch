import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { sendOrderConfirmation } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // 1. Retrieve Stripe Session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
        }

        const orderId = session.metadata?.order_id;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID not found in session metadata' }, { status: 400 });
        }

        // 2. Update Order in Supabase
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options });
                    },
                },
            }
        );

        // Check if order is already paid to avoid duplicate emails
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('payment_status')
            .eq('id', orderId)
            .single();

        if (existingOrder?.payment_status === 'paid') {
            return NextResponse.json({ success: true, message: 'Order already verified' });
        }

        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update({
                payment_status: 'paid',
                status: 'confirmed' // Move from pending to confirmed
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        // 3. Send Confirmation Email
        if (updatedOrder.email && process.env.RESEND_API_KEY) {
            sendOrderConfirmation(updatedOrder, updatedOrder.email).catch(err =>
                console.error('Failed to send confirmation email:', err)
            );
        }

        return NextResponse.json({ success: true, orderId });

    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
