import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getOrderByIdApi } from '../../api/orderApi';
import type { Order } from '../../types';
import './OrderDetailPage.css';

// Fix Leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const agentIcon = L.divIcon({
  className: '',
  html: `<div style="background:#C8A97E;width:36px;height:36px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🛵</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const MapUpdater: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => { map.panTo([lat, lng], { animate: true }); }, [lat, lng, map]);
  return null;
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [agentPos, setAgentPos] = useState<[number, number] | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!id) return;
    getOrderByIdApi(id).then((r) => {
      const o = r.data.order as Order;
      setOrder(o);
      const coords = o.deliveryAgentLocation?.coordinates;
      if (coords) setAgentPos([coords[1], coords[0]]);
    });

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000');
    socketRef.current = socket;
    socket.emit('join-order-tracking', id);
    socket.on('agent-location-updated', (data: { latitude: number; longitude: number }) => {
      setAgentPos([data.latitude, data.longitude]);
    });
    socket.on('order-status-changed', (data: { status: Order['orderStatus'] }) => {
      setOrder((prev) => prev ? { ...prev, orderStatus: data.status } : prev);
    });

    return () => { socket.disconnect(); };
  }, [id]);

  if (!order) return <div className="page-loader"><div className="spinner" /></div>;

  const defaultPos: [number, number] = agentPos || [28.7041, 77.1025];
  const showMap = ['dispatched'].includes(order.orderStatus) || !!agentPos;

  const steps = ['placed', 'dispatched', 'shipped', 'delivered'];
  const currentStepIdx = steps.indexOf(order.orderStatus);

  return (
    <div className="order-details-page container">
      <div className="order-details-header">
         <div className="order-id-meta">
            <h1>Order ID: #{order._id.toUpperCase()}</h1>
            <p>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
         </div>
         <div className="order-actions-top">
            <button className="btn-help">HELP</button>
         </div>
      </div>

      <div className="order-details-layout">
         <div className="order-details-main">
            {/* Status Stepper */}
            <div className="order-stepper od-card">
               <div className="stepper-track">
                  {steps.map((step, idx) => (
                    <div key={step} className={`step-item ${idx <= currentStepIdx ? 'active' : ''} ${idx === currentStepIdx ? 'current' : ''}`}>
                       <div className="step-point"></div>
                       <span className="step-label">{step.toUpperCase()}</span>
                    </div>
                  ))}
               </div>
               <div className="stepper-info">
                  <p>Your order is currently <strong>{order.orderStatus.toUpperCase()}</strong>.</p>
               </div>
            </div>

            {/* Product Card */}
            <div className="od-card">
               <div className="od-card-header">Items in this Order</div>
               <div className="order-products-wrapper">
                 {order.products.map((p, idx) => {
                    const prod = p.productId as any;
                    const variant = p.variantId as any;
                    return (
                      <div key={idx} className="order-p-row">
                         <div className="order-p-img">
                            <img src={variant?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=100'} alt="" />
                         </div>
                         <div className="order-p-info">
                            <h4 className="item-brand">{prod?.brand || 'Suruchi Fashion'}</h4>
                            <p className="item-name">{prod?.name || 'Women Fashion Item'}</p>
                            <p className="item-meta">Size: {variant?.size} • Qty: {p.quantity}</p>
                            <p className="item-price">₹{p.priceAtPurchase}</p>
                         </div>
                      </div>
                    );
                 })}
               </div>
            </div>

            {/* Map Tracking */}
            {showMap && (
               <div className="order-map-section">
                  <div className="map-header">
                     <span className="live-dot" /> LIVE TRACKING
                  </div>
                  <div className="map-container-wrapper">
                    <MapContainer center={defaultPos} zoom={14} style={{ height: '300px', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {agentPos && (
                        <>
                          <MapUpdater lat={agentPos[0]} lng={agentPos[1]} />
                          <Marker position={agentPos} icon={agentIcon}>
                            <Popup>Delivery Agent!</Popup>
                          </Marker>
                        </>
                      )}
                    </MapContainer>
                  </div>
               </div>
            )}
         </div>

         <div className="order-details-summary">
            <div className="address-summary od-card">
               <h4>Delivery Address</h4>
               <p className="addr-name">{order.shippingAddress.fullName}</p>
               <p className="addr-text">{order.shippingAddress.houseName}, {order.shippingAddress.locality}</p>
               <p className="addr-text">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
               <p className="addr-mobile">Phone: <span>{order.shippingAddress.mobile}</span></p>
            </div>

            <div className="price-summary od-card">
               <h4>Total Price</h4>
               <div className="p-row"><span>Subtotal</span><span>₹{order.subTotal}</span></div>
               <div className="p-row"><span>Delivery Charge</span><span>₹{order.deliveryCharge}</span></div>
               <div className="p-divider" />
               <div className="p-row total"><span>Total Amount</span><span>₹{order.grandTotal}</span></div>
               <div className="payment-status-badge" data-status={order.paymentStatus}>
                  {order.paymentStatus.toUpperCase()}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
