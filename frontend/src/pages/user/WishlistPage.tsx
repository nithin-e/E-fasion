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
  
  // Modal State
  const [selectedProductForSize, setSelectedProductForSize] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [addingToBag, setAddingToBag] = useState(false);

  const fetchWishlist = async () => {
    try {
      const res = await getWishlistApi();
      setItems(res.data.products || []);
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

  const handleOpenSizeModal = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      return toast.error('Product is out of stock');
    }
    // If only one variant, auto-add
    if (product.variants.length === 1) {
       handleConfirmMoveToBag(product, product.variants[0]._id);
       return;
    }
    setSelectedProductForSize(product);
    setSelectedVariantId('');
  };

  const handleConfirmMoveToBag = async (product: Product, variantId: string) => {
    if (!variantId) return toast.error('Please select a size');
    setAddingToBag(true);
    try {
      await addItem(product._id, variantId, 1);
      await removeFromWishlistApi(product._id);
      setItems(items.filter(i => i._id !== product._id));
      await fetchCart();
      toast.success('Moved to Bag');
      setSelectedProductForSize(null);
    } catch (err) {
      toast.error('Failed to move to bag');
    } finally {
      setAddingToBag(false);
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
           <div className="empty-icon-circle">❤️</div>
           <h3>YOUR WISHLIST IS EMPTY</h3>
           <p>Add items that you like to your wishlist. Review them anytime and easily move them to the bag.</p>
           <Link to="/shop" className="btn-continue">CONTINUE SHOPPING</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => {
            const variant = item.variants?.[0];
            const price = variant?.price || item.basePrice;
            const brandName = typeof item.brand === 'object' ? (item.brand as any).name : item.brand;
            
            return (
              <div key={item._id} className="wishlist-card">
                <div className="wishlist-img-box">
                  <img src={variant?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300'} alt={item.name} />
                  <button className="btn-remove-wishlist" onClick={() => handleRemove(item._id)}>
                     <X size={20} />
                  </button>
                </div>
                <div className="wishlist-info">
                  <p className="item-brand">{brandName?.toUpperCase() || 'E-FASHION'}</p>
                  <p className="item-name text-truncate">{item.name}</p>
                  <p className="item-price">
                     <span className="price-now">₹{Math.floor(price)}</span>
                     <span className="price-mrp">₹{Math.floor(price * 1.5)}</span>
                     <span className="price-disc">(33% OFF)</span>
                  </p>
                </div>
                <button className="btn-move-to-bag" onClick={() => handleOpenSizeModal(item)}>
                   MOVE TO BAG
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Size Selector Modal */}
      {selectedProductForSize && (
        <div className="wishlist-modal-overlay" onClick={() => setSelectedProductForSize(null)}>
          <div className="wishlist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="wishlist-modal-header">
               <div className="modal-product-info">
                  <img src={selectedProductForSize.variants?.[0]?.images?.[0] || ''} alt="" />
                  <div>
                     <p className="modal-title">Select Size</p>
                     <p className="modal-subtitle">{selectedProductForSize.name}</p>
                  </div>
               </div>
               <button className="btn-close-modal" onClick={() => setSelectedProductForSize(null)}><X size={20}/></button>
            </div>
            
            <div className="modal-size-grid">
               {selectedProductForSize.variants?.map(v => (
                 <button 
                   key={v._id} 
                   className={`modal-size-btn ${selectedVariantId === v._id ? 'active' : ''} ${v.stock === 0 ? 'oos' : ''}`}
                   onClick={() => setSelectedVariantId(v._id)}
                   disabled={v.stock === 0}
                 >
                   {v.size} {v.stock === 0 ? <span className="oos-text">Left</span> : ''}
                 </button>
               ))}
            </div>

            <button 
              className="btn-modal-done" 
              onClick={() => handleConfirmMoveToBag(selectedProductForSize, selectedVariantId)}
              disabled={!selectedVariantId || addingToBag}
            >
              {addingToBag ? 'MOVING...' : 'DONE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
