import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { getWishlistApi, removeFromWishlistApi } from '../../api/userApi';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import type { Product } from '../../types';
import './WishlistPage.css';

const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, fetchCart } = useCart();

  const fetchWishlist = async () => {
    try {
      const res = await getWishlistApi();
      setItems(res.data.wishlist || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlistApi(id);
      setItems(items.filter(i => i._id !== id));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const handleMoveToBag = async (product: Product) => {
    try {
      if (!product.variants || product.variants.length === 0) {
        return toast.error('No variants available');
      }
      const variantId = product.variants[0]._id;
      await addItem(product._id, variantId, 1);
      await removeFromWishlistApi(product._id);
      setItems(items.filter(i => i._id !== product._id));
      await fetchCart();
      toast.success('Moved to Bag');
    } catch (err) {
      toast.error('Failed to move to bag');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="wishlist-page container">
      <div className="wishlist-header">
         <h1>My Wishlist <span className="item-count">{items.length} Items</span></h1>
      </div>

      {items.length === 0 ? (
        <div className="empty-wishlist">
           <h3>YOUR WISHLIST IS EMPTY</h3>
           <p>Add items that you like to your wishlist. Review them anytime and easily move them to the bag.</p>
           <Link to="/shop" className="btn-continue">CONTINUE SHOPPING</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => (
            <div key={item._id} className="wishlist-card">
              <div className="wishlist-img-box">
                <img src={item.variants?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200'} alt={item.name} />
                <button className="btn-remove-wishlist" onClick={() => handleRemove(item._id)}>
                   <X size={18} />
                </button>
              </div>
              <div className="wishlist-info">
                <p className="item-brand">{item.brand || 'Suruchi Fashion'}</p>
                <p className="item-name">{item.name}</p>
                <p className="item-price">
                   <span className="price-now">₹{item.variants?.[0]?.price}</span>
                   <span className="price-mrp">₹{Math.floor((item.variants?.[0]?.price || 0) * 1.5)}</span>
                   <span className="price-disc">(50% OFF)</span>
                </p>
              </div>
              <button className="btn-move-to-bag" onClick={() => handleMoveToBag(item)}>
                 MOVE TO BAG
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
