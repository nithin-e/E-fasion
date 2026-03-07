import { Order } from '../models/orderModel';
import { User } from '../models/userModel';
import { Product } from '../models/productModel';

export const getDashboardStats = async () => {
  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    revenueAgg,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'user', is_deleted: false }),
    Product.countDocuments({ is_deleted: false }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean(),
  ]);

  return {
    totalOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
    totalCustomers,
    totalProducts,
    recentOrders,
  };
};

export const getSalesReport = async (from: Date, to: Date) => {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
        paymentStatus: 'paid',
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$grandTotal' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};
