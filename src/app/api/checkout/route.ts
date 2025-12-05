import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                    set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
                    remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }); },
                },
            }
        );

        const body = await request.json();
        const { email, customerName, userId, basePrice, includeMeasurements, designTitle, designId, chest, waist, hips } = body;

        // Calculate total amount in cents/paise
        const totalAmount = (basePrice + (includeMeasurements ? 500 : 0));
        const stripeAmount = totalAmount * 100;

        // 1. Save Order to DB as Pending
        const { data: order, error } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: userId,
                    customer_name: customerName,
                    email: email,
                    design_title: designTitle,
                    amount: totalAmount,
                    status: 'pending',
                    payment_status: 'pending_payment',
                    payment_method: 'online',
                    measurements: includeMeasurements ? { chest, waist, hips } : null
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // 2. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Tailoring Service: ${designTitle || 'Custom Order'}`,
                            description: includeMeasurements ? 'Includes custom measurements' : 'Standard size',
                        },
                        unit_amount: stripeAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/track?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
            cancel_url: `${request.headers.get('origin')}/order`,
            customer_email: email,
            metadata: {
                order_id: order.id
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Checkout error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
