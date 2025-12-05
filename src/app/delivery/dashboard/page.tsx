'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Package, MapPin, CheckCircle, Navigation, LogOut, Phone, Ruler } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import MapComponent
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => <div style={{ height: '300px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
});

interface Order {
    id: string;
    customer_name: string;
    amount: number;
    delivery_status: string;
    delivery_location: any;
    address?: string;
    phone?: string;
    measurements?: any;
    payment_status?: string;
}

export default function DeliveryDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [driverId, setDriverId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
    const [showMeasurementModal, setShowMeasurementModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [measurements, setMeasurements] = useState({ chest: '', waist: '', hips: '', length: '' });

    const router = useRouter();

    useEffect(() => {
        // Get driver ID from cookie
        const match = document.cookie.match(/driver_token=([^;]+)/);
        if (match) {
            setDriverId(match[1]);
            fetchOrders(match[1]);
        } else {
            router.push('/delivery/login');
        }
    }, []);

    // Simulate location tracking
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (trackingOrderId && driverId) {
            let lat = 11.6643;
            let lng = 78.1460;

            interval = setInterval(async () => {
                // Random movement
                lat += (Math.random() - 0.5) * 0.001;
                lng += (Math.random() - 0.5) * 0.001;

                await supabase
                    .from('orders')
                    .update({
                        delivery_location: {
                            lat,
                            lng,
                            updated_at: new Date().toISOString()
                        }
                    })
                    .eq('id', trackingOrderId);
            }, 3000); // Update every 3 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [trackingOrderId, driverId]);

    const fetchOrders = async (id: string) => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('assigned_to', id)
            .neq('delivery_status', 'delivered') // Hide completed orders
            .order('created_at', { ascending: false });

        if (data) setOrders(data);
        setLoading(false);
    };

    const updateStatus = async (orderId: string, status: string) => {
        // Check for COD payment before marking as delivered
        if (status === 'delivered') {
            const order = orders.find(o => o.id === orderId);
            if (order && (order as any).payment_status === 'pending_cod') {
                const confirmed = window.confirm(
                    `Amount to Collect: ₹${order.amount}\n\nHave you collected the cash payment from the customer?`
                );

                if (!confirmed) return;

                // Update payment status to 'paid' along with delivery status
                const { error } = await supabase
                    .from('orders')
                    .update({
                        delivery_status: status,
                        payment_status: 'paid'
                    })
                    .eq('id', orderId);

                if (!error) {
                    handleSuccess(orderId, status);
                } else {
                    alert('Error updating status');
                }
                return;
            }
        }

        const { error } = await supabase
            .from('orders')
            .update({ delivery_status: status })
            .eq('id', orderId);

        if (!error) {
            handleSuccess(orderId, status);
        }
    };

    const handleSuccess = (orderId: string, status: string) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, delivery_status: status } : o));

        if (status === 'out_for_delivery') {
            setTrackingOrderId(orderId);
        } else if (status === 'delivered') {
            setTrackingOrderId(null);
            alert('Order delivered and payment recorded successfully!');
            fetchOrders(driverId!); // Refresh list
        } else if (status === 'picked_up') {
            alert('Pickup confirmed! You can now start the delivery.');
        }
    };

    const handleSaveMeasurements = async () => {
        if (!selectedOrder) return;
        const { error } = await supabase
            .from('orders')
            .update({ measurements: measurements })
            .eq('id', selectedOrder.id);

        if (error) {
            alert('Error saving measurements');
        } else {
            alert('Measurements saved successfully!');
            setShowMeasurementModal(false);
            setMeasurements({ chest: '', waist: '', hips: '', length: '' });
        }
    };

    const handleLogout = () => {
        document.cookie = 'driver_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/delivery/login');
    };

    // Prepare locations for map
    const mapLocations = orders.map(order => ({
        lat: 11.6643 + (Math.random() - 0.5) * 0.05, // Mock location around Salem
        lng: 78.1460 + (Math.random() - 0.5) * 0.05,
        title: order.customer_name,
        description: order.address || 'No address provided'
    }));

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '1rem', paddingBottom: '5rem', backgroundColor: 'var(--background)', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', color: 'var(--foreground)' }}>My Deliveries</h1>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--error)' }}>
                    <LogOut size={24} />
                </button>
            </div>

            {/* Map View */}
            {orders.length > 0 && (
                <div style={{ marginBottom: '2rem', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <MapComponent locations={mapLocations} />
                </div>
            )}

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
                    <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No pending deliveries.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{
                            backgroundColor: 'var(--secondary)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--foreground)' }}>{order.customer_name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order #{order.id.slice(0, 8)}</p>
                                </div>
                                <div style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    backgroundColor:
                                        order.delivery_status === 'assigned' ? 'rgba(234, 179, 8, 0.1)' :
                                            order.delivery_status === 'picked_up' ? 'rgba(59, 130, 246, 0.1)' :
                                                'rgba(16, 185, 129, 0.1)',
                                    color:
                                        order.delivery_status === 'assigned' ? '#eab308' :
                                            order.delivery_status === 'picked_up' ? '#3b82f6' :
                                                '#10b981',
                                    height: 'fit-content',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {order.delivery_status === 'assigned' ? 'Pickup Pending' : order.delivery_status.replace(/_/g, ' ')}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                    <MapPin size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                                        {order.address || '123, Gandhi Road, Salem, Tamil Nadu - 636007'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Phone size={18} />
                                    <p style={{ fontSize: '0.95rem' }}>{order.phone || '9876543210'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {order.delivery_status === 'assigned' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowMeasurementModal(true);
                                            }}
                                            className="btn btn-outline"
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        >
                                            <Ruler size={18} /> Measure
                                        </button>
                                        <button
                                            onClick={() => updateStatus(order.id, 'picked_up')}
                                            className="btn btn-primary"
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#eab308', borderColor: '#eab308', color: '#000' }}
                                        >
                                            <Package size={18} /> Pickup
                                        </button>
                                    </>
                                )}

                                {order.delivery_status === 'picked_up' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'out_for_delivery')}
                                        className="btn btn-primary"
                                        style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Navigation size={18} /> Start Delivery
                                    </button>
                                )}

                                {order.delivery_status === 'out_for_delivery' && (
                                    <>
                                        <button
                                            className="btn btn-outline"
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=11.6643,78.1460`)}
                                        >
                                            <MapPin size={18} /> Nav
                                        </button>
                                        <button
                                            onClick={() => updateStatus(order.id, 'delivered')}
                                            className="btn btn-primary"
                                            style={{ backgroundColor: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        >
                                            <CheckCircle size={18} /> Delivered
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Measurement Modal */}
            {showMeasurementModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--secondary)', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '400px', border: '1px solid var(--border)'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground)' }}>Take Measurements</h2>
                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                            <input type="text" placeholder="Chest (in)" value={measurements.chest} onChange={e => setMeasurements({ ...measurements, chest: e.target.value })} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
                            <input type="text" placeholder="Waist (in)" value={measurements.waist} onChange={e => setMeasurements({ ...measurements, waist: e.target.value })} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
                            <input type="text" placeholder="Hips (in)" value={measurements.hips} onChange={e => setMeasurements({ ...measurements, hips: e.target.value })} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
                            <input type="text" placeholder="Length (in)" value={measurements.length} onChange={e => setMeasurements({ ...measurements, length: e.target.value })} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowMeasurementModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleSaveMeasurements} className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
