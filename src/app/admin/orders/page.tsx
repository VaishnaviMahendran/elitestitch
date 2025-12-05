'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

interface Order {
    id: string;
    customer_name: string;
    design_title: string;
    amount: number;
    status: string;
    delivery_status: string;
    assigned_to: string | null;
    created_at: string;
}

interface Driver {
    id: string;
    name: string;
    personnel_number: string;
    current_location?: { lat: number, lng: number }; // Mock location
    distance?: number;
}

// Shop Location (Salem)
const SHOP_LOCATION = { lat: 11.6643, lng: 78.1460 };

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();

        // Realtime subscription for new orders
        const channel = supabase
            .channel('admin-orders-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchData(); // Refresh data on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchData = async () => {
        const { data: ordersData } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: driversData } = await supabase
            .from('delivery_personnel')
            .select('id, name, personnel_number') // Add current_location when available in DB
            .eq('status', 'active');

        if (ordersData) setOrders(ordersData);

        if (driversData) {
            // Mock random locations for drivers around Salem to demonstrate distance sorting
            const driversWithDistance = driversData.map((driver: any) => {
                const mockLat = SHOP_LOCATION.lat + (Math.random() - 0.5) * 0.1;
                const mockLng = SHOP_LOCATION.lng + (Math.random() - 0.5) * 0.1;
                const dist = calculateDistance(SHOP_LOCATION.lat, SHOP_LOCATION.lng, mockLat, mockLng);

                return {
                    ...driver,
                    current_location: { lat: mockLat, lng: mockLng },
                    distance: parseFloat(dist.toFixed(1))
                };
            }).sort((a: any, b: any) => a.distance - b.distance); // Sort by nearest

            setDrivers(driversWithDistance);
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            alert('Error updating status');
        } else {
            // Optimistic update
            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            ));
        }
    };

    const handleAssignDriver = async (orderId: string, driverId: string) => {
        if (!driverId) return;

        const { error } = await supabase
            .from('orders')
            .update({
                assigned_to: driverId,
                delivery_status: 'assigned'
            })
            .eq('id', orderId);

        if (error) {
            alert('Error assigning driver');
        } else {
            // Optimistic update
            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, assigned_to: driverId, delivery_status: 'assigned' } : o
            ));
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--foreground)' }}>Manage Orders</h1>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {orders.map(order => (
                    <div key={order.id} style={{
                        backgroundColor: 'var(--secondary)',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: 'var(--primary)',
                                        color: '#000',
                                        fontWeight: 'bold'
                                    }}>
                                        #{order.id.slice(0, 8)}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 style={{ color: 'var(--foreground)', marginBottom: '0.25rem' }}>{order.design_title}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Customer: {order.customer_name}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{order.amount}</p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    justifyContent: 'flex-end',
                                    marginTop: '0.25rem',
                                    fontSize: '0.85rem',
                                    color: (order as any).payment_status === 'paid' ? '#10b981' : '#eab308'
                                }}>
                                    <span>Payment: {(order as any).payment_status === 'pending_cod' ? 'Pending (COD)' : 'Paid'}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    justifyContent: 'flex-end',
                                    marginTop: '0.5rem',
                                    color: order.status === 'confirmed' ? '#10b981' : '#eab308'
                                }}>
                                    {order.status === 'confirmed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                    <span style={{ textTransform: 'capitalize' }}>{order.status.replace(/_/g, ' ')}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            borderTop: '1px solid var(--border)',
                            paddingTop: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            {/* Status Management */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--foreground)',
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="stitching">Stitching</option>
                                    <option value="stitched">Stitched</option>
                                    <option value="ready_for_delivery">Ready for Delivery</option>
                                </select>
                            </div>

                            {/* Driver Assignment */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Truck size={18} color="var(--text-muted)" />
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: order.delivery_status === 'delivered' ? '#10b981' :
                                            order.delivery_status === 'assigned' ? '#eab308' :
                                                order.delivery_status === 'picked_up' ? '#3b82f6' : '#eab308',
                                        textTransform: 'capitalize'
                                    }}>
                                        {order.delivery_status ? order.delivery_status.replace(/_/g, ' ') : 'Pending'}
                                    </span>
                                </div>

                                <select
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--foreground)',
                                        border: '1px solid var(--border)',
                                        minWidth: '200px',
                                        opacity: order.status === 'ready_for_delivery' ? 1 : 0.5,
                                        pointerEvents: order.status === 'ready_for_delivery' ? 'auto' : 'none'
                                    }}
                                    value={order.assigned_to || ''}
                                    onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                                    disabled={order.delivery_status === 'delivered' || order.status !== 'ready_for_delivery'}
                                    title={order.status !== 'ready_for_delivery' ? "Mark as 'Ready for Delivery' first" : "Assign Driver"}
                                >
                                    <option value="">
                                        {order.status !== 'ready_for_delivery' ? "Wait for Stitching..." : "Assign Driver..."}
                                    </option>
                                    {drivers.map(driver => (
                                        <option key={driver.id} value={driver.id}>
                                            {driver.name} ({driver.distance} km away)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
