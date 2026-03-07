import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ArrowRight, Truck } from 'lucide-react';
import { getProductByIdApi } from '../../api/productApi';
import { addToWishlistApi } from '../../api/userApi';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import type { Product, Variant } from '../../types';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [addingToBag, setAddingToBag] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductByIdApi(id)
      .then((res) => {
        const p = res.data.product as Product;
        setProduct(p);
        if (p.variants?.length) setSelectedVariant(p.variants[0]);
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToBag = async () => {
    if (!product || !selectedVariant) return;
    setAddingToBag(true);
    try {
      await addItem(product._id, selectedVariant._id, 1);
      toast.success('Added to Bag!');
    } catch {
      toast.error('Please log in to continue');
    } finally {
      setAddingToBag(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!product) return null;

  const images = selectedVariant?.images?.length
    ? selectedVariant.images
    : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'];
  
  const price = selectedVariant?.price || product.basePrice;
  const mrp = price * 1.5;
  const discount = 33;

  return (
    <div className="pdp-page container">
      <div className="pdp-grid">
        {/* Gallery Grid */}
        <div className="pdp-gallery">
          {images.map((img, i) => (
            <div key={i} className="pdp-gallery-item">
              <img src={img} alt={`${product.name} ${i+1}`} />
            </div>
          ))}
        </div>

        {/* Product Info */}
        <div className="pdp-info">
          <div className="pdp-brand-area">
             <h1 className="pdp-brand">{product.brand}</h1>
             <h2 className="pdp-name">{product.name}</h2>
             <div className="pdp-rating-badge">
                4.2 <Star size={14} fill="currentColor" /> | 2.5k Ratings
             </div>
          </div>

          <div className="pdp-price-area">
             <span className="pdp-price-current">₹{Math.floor(price)}</span>
             <span className="pdp-price-mrp">MRP ₹{Math.floor(mrp)}</span>
             <span className="pdp-discount">({discount}% OFF)</span>
             <p className="pdp-tax-info">inclusive of all taxes</p>
          </div>

          {/* Size Selection */}
          <div className="pdp-sizes">
             <div className="pdp-sizes-header">
                <h3>SELECT SIZE</h3>
                <button className="pdp-size-chart">SIZE CHART <ArrowRight size={14} /></button>
             </div>
             <div className="pdp-size-chips">
                {product.variants?.map((v) => (
                  <button 
                    key={v._id} 
                    className={`pdp-size-chip ${selectedVariant?._id === v._id ? 'active' : ''} ${v.stock === 0 ? 'oos' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock === 0}
                  >
                    {v.size}
                  </button>
                ))}
             </div>
          </div>

          <div className="pdp-actions">
             <button className="btn-pdp-primary" onClick={handleAddToBag} disabled={addingToBag || selectedVariant?.stock === 0}>
                <ShoppingBag size={20} /> {addingToBag ? 'ADDING...' : 'ADD TO BAG'}
             </button>
             <button className="btn-pdp-secondary" onClick={() => addToWishlistApi(product._id).then(() => toast.success('Wishlisted!'))}>
                <Heart size={20} /> WISHLIST
             </button>
          </div>

          <div className="pdp-delivery">
             <h3>DELIVERY OPTIONS <Truck size={18} /></h3>
             <div className="pdp-pincode-box">
                <input type="text" placeholder="Enter Pincode" />
                <button>Check</button>
             </div>
             <p className="pdp-delivery-perks">
                Please enter PIN code to check delivery time & Pay on Delivery Availability
             </p>
          </div>

          <div className="pdp-details">
             <h3>PRODUCT DETAILS</h3>
             <p className="pdp-description">{product.description}</p>
             <div className="pdp-spec-grid">
                <div className="pdp-spec-item"><span>Brand</span><strong>{product.brand}</strong></div>
                <div className="pdp-spec-item"><span>Category</span><strong>Accessories</strong></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
