import React from 'react';
import type { Order } from '../../types';

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pending',    cls: 'badge-warning' },
  processing: { label: 'Processing', cls: 'badge-info'    },
  dispatched: { label: 'Dispatched', cls: 'badge-info'    },
  delivered:  { label: 'Delivered',  cls: 'badge-success' },
  cancelled:  { label: 'Cancelled',  cls: 'badge-error'   },
  returned:   { label: 'Returned',   cls: 'badge-neutral' },
};

const OrderStatusBadge: React.FC<{ status: Order['orderStatus'] }> = ({ status }) => {
  const conf = statusConfig[status] || { label: status, cls: 'badge-neutral' };
  return <span className={`badge ${conf.cls}`}>{conf.label}</span>;
};

export default OrderStatusBadge;
