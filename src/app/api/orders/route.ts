import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendOrderConfirmation } from '@/lib/email';

export async function POST(request: Request) {
    try {
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

        const body = await request.json();
        const {
            userId,
            email,
            customerName,
            designId,
            designTitle,
            basePrice,
            includeMeasurements,
            chest, waist, hips,
            paymentMethod
        } = body;

        const totalAmount = basePrice + (includeMeasurements ? 500 : 0);

        // Insert order into Supabase
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: userId,
                    customer_name: customerName,
                    email: email,
                    design_title: designTitle,
                    amount: totalAmount,
                    status: 'pending',
                    payment_status: paymentMethod === 'cod' ? 'pending_cod' : 'paid',
                    payment_method: paymentMethod,
                    measurements: includeMeasurements ? { chest, waist, hips } : null
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Send confirmation email
        // Send confirmation email (fire and forget to avoid blocking)
        if (email && process.env.RESEND_API_KEY) {
            sendOrderConfirmation(data, email).catch(err =>
                console.error('Failed to send background email:', err)
            );
        }

        // Return success with order ID
        return NextResponse.json({
            success: true,
            orderId: data.id,
            url: `${request.headers.get('origin')}/track?order_id=${data.id}`
        });

    } catch (err: any) {
        console.error('Order creation error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
