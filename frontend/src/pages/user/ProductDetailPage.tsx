import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Truck, Tag, CheckCircle2, ChevronRight } from 'lucide-react';
import { getProductByIdApi, getProductRecommendationsApi } from '../../api/productApi';
import { addToWishlistApi, getCouponsApi } from '../../api/userApi';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import type { Product, Variant } from '../../types';
import ProductCard from '../../components/shared/ProductCard';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection States
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [addingToBag, setAddingToBag] = useState(false);
  
  // Delivery States
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    // Fetch Product Details
    getProductByIdApi(id)
      .then((res) => {
        const p = res.data.product as Product;
        setProduct(p);
        if (p.variants?.length) setSelectedVariant(p.variants[0]);
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));

    // Fetch Recommendations (Customers Also Liked)
    getProductRecommendationsApi(id)
      .then((res) => {
        setRecommendations(res.data.recommendations || []);
      })
      .catch((err) => console.error("Could not load recommendations", err));

    // Fetch live coupons
    getCouponsApi()
      .then((res) => {
        // filter active coupons only
        const active = (res.data.coupons || []).filter((c: any) => c.isActive && new Date(c.expiryDate) > new Date());
        setCoupons(active);
      })
      .catch((err) => console.log("Could not load coupons", err));
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

  const checkDelivery = async () => {
    if (pincode.length < 6) return;
    setDeliveryStatus('loading');
    
    // In a real sophisticated app, we'd have a pincode database validator. 
    // Here we will use our existing geospatial `/api/v1/delivery/check-serviceable` by assuming Bangalore Palace center
    // We mock the coordinate conversion for the sake of the demo
    
    try {
      // Simulate network request delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await api.get(`/delivery/check-serviceable?lat=12.9988&lng=77.5921`);
      
      if (res.data.isServiceable) {
         setDeliveryStatus('success');
         // Generate a mock estimated delivery date (3 days from now)
         const d = new Date();
         d.setDate(d.getDate() + 3);
         const dateString = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
         setDeliveryEstimate(`Get it by ${dateString}`);
      } else {
         throw new Error("Not serviceable");
      }
    } catch (err) {
      setDeliveryStatus('error');
      setDeliveryMessage("Unfortunately we do not ship to your pincode.");
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!product) return null;

  const images = selectedVariant?.images?.length
    ? selectedVariant.images
    : product.variants?.[0]?.images?.length ? product.variants[0].images 
    : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'];
  
  const price = selectedVariant?.price || product.basePrice;
  const mrp = price * 1.5;
  const discount = Math.round(((mrp - price) / mrp) * 100);

  return (
    <div className="pdp-page container">
      
      <div className="pdp-breadcrumbs">
        Home / Clothing / Women / {typeof product.brand === 'string' ? product.brand : product.brand.name} / <span>{product.name}</span>
      </div>

      <div className="pdp-grid">
        {/* Left Column: Masonry Image Gallery */}
        <div className="pdp-gallery-masonry">
          {images.map((img, i) => (
            <div key={i} className={`pdp-masonry-item item-${i}`}>
              <img src={img} alt={`${product.name} View ${i+1}`} loading="lazy" />
            </div>
          ))}
        </div>

        {/* Right Column: Product Core Info */}
        <div className="pdp-info-stream">
          
          <div className="pdp-brand-area">
             <h1 className="pdp-brand">{typeof product.brand === 'string' ? product.brand : product.brand.name}</h1>
             <h2 className="pdp-name">{product.name}</h2>
             <div className="pdp-rating-badge">
                4.2 <Star size={14} fill="currentColor" /> | <span className="pdp-rating-count">2.5k Ratings</span>
             </div>
          </div>

          <hr className="pdp-divider" />

          <div className="pdp-price-area">
             <div className="pdp-price-hero">
                <span className="pdp-price-current">₹{Math.floor(price)}</span>
                <span className="pdp-price-mrp">MRP <span className="pdp-strike">₹{Math.floor(mrp)}</span></span>
                <span className="pdp-discount">({discount}% OFF)</span>
             </div>
             <p className="pdp-tax-info">inclusive of all taxes</p>
          </div>

          {/* Size Selection */}
          <div className="pdp-sizes-block">
             <div className="pdp-sizes-header">
                <h3>SELECT SIZE</h3>
                <button className="pdp-size-chart">SIZE CHART <ChevronRight size={14} /></button>
             </div>
             <div className="pdp-size-chips">
                {product.variants?.map((v) => (
                  <button 
                    key={v._id} 
                    className={`pdp-size-chip ${selectedVariant?._id === v._id ? 'active' : ''} ${v.stock === 0 ? 'oos' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock === 0}
                  >
                    <span>{v.size}</span>
                    {v.stock > 0 && v.stock < 5 && <span className="pdp-stock-left">{v.stock} left</span>}
                  </button>
                ))}
             </div>
             {selectedVariant?.stock === 0 && <p className="pdp-error-text">Item is currently out of stock</p>}
          </div>

          <div className="pdp-actions">
             <button className="btn-pdp-primary" onClick={handleAddToBag} disabled={addingToBag || selectedVariant?.stock === 0}>
                <ShoppingBag size={20} className={addingToBag ? 'bounce' : ''} /> {addingToBag ? 'ADDING...' : 'ADD TO BAG'}
             </button>
             <button className="btn-pdp-secondary" onClick={() => addToWishlistApi(product._id).then(() => toast.success('Wishlisted!'))}>
                <Heart size={20} /> WISHLIST
             </button>
          </div>

          <hr className="pdp-divider line-padded" />

          {/* Delivery Options Engine */}
          <div className="pdp-delivery-engine">
             <div className="pdp-delivery-header">
               <h3>DELIVERY OPTIONS <Truck size={20} /></h3>
             </div>
             
             <div className={`pdp-pincode-wrapper ${deliveryStatus === 'loading' ? 'loading' : ''} ${deliveryStatus === 'error' ? 'error' : ''}`}>
                <input 
                  type="text" 
                  placeholder="Enter a PIN code" 
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                />
                <button onClick={checkDelivery} disabled={pincode.length < 6 || deliveryStatus === 'loading'}>
                   {deliveryStatus === 'loading' ? 'Checking...' : 'Check'}
                </button>
             </div>
             
             {deliveryStatus === 'idle' && (
               <p className="pdp-delivery-hint">Please enter PIN code to check delivery time & Pay on Delivery Availability</p>
             )}
             
             {deliveryStatus === 'error' && (
               <p className="pdp-delivery-error">{deliveryMessage}</p>
             )}

             {deliveryStatus === 'success' && (
               <ul className="pdp-delivery-perks">
                  <li><CheckCircle2 size={16} color="#0c1d" /> <strong>{deliveryEstimate}</strong></li>
                  <li><CheckCircle2 size={16} color="#0c1d" /> Pay on delivery might be available</li>
                  <li><CheckCircle2 size={16} color="#0c1d" /> Easy 14 days return & exchange available</li>
                  <li><CheckCircle2 size={16} color="#0c1d" /> 100% Original Products</li>
               </ul>
             )}
          </div>

          <hr className="pdp-divider line-padded" />

          {/* BEST OFFERS Block */}
          {coupons.length > 0 && (
            <div className="pdp-best-offers">
               <div className="pdp-section-title">
                 <h3>BEST OFFERS <Tag size={18} /></h3>
               </div>
               <div className="pdp-offer-card">
                 <h4>Coupon code: <strong>{coupons[0].code}</strong></h4>
                 <ul>
                   <li>Applicable on: Orders above Rs. {coupons[0].minPurchaseAmount}</li>
                   <li>Discount percentage: {coupons[0].discountPercentage}% OFF</li>
                   <li>Max Saving: Rs. {coupons[0].maxDiscountAmount}</li>
                   <li>Expires on: {new Date(coupons[0].expiryDate).toLocaleDateString()}</li>
                 </ul>
                 <span className="pdp-offer-apply">{coupons.length > 1 ? `+ ${coupons.length - 1} More Offers Available` : 'Check cart for final savings'}</span>
               </div>
            </div>
          )}

          {coupons.length > 0 && <hr className="pdp-divider line-padded" />}

          {/* PRODUCT DETAILS Specifications */}
          <div className="pdp-details-block">
             <div className="pdp-section-title">
               <h3>PRODUCT DETAILS</h3>
             </div>
             <p className="pdp-description-raw">{product.description}</p>
             
             <h4 className="pdp-spec-heading">Size & Fit</h4>
             <p className="pdp-spec-text">The model (height 5'8") is wearing a size S</p>

             <h4 className="pdp-spec-heading">Material & Care</h4>
             <p className="pdp-spec-text">100% Cotton<br/>Machine Wash</p>
             
             <h4 className="pdp-spec-heading">Specifications</h4>
             <div className="pdp-spec-grid-rich">
                <div className="pdp-spec-item-rich">
                   <span className="spec-label">Sleeve Length</span>
                   <span className="spec-value">Three-Quarter Sleeves</span>
                </div>
                <div className="pdp-spec-item-rich">
                   <span className="spec-label">Shape</span>
                   <span className="spec-value">A-Line</span>
                </div>
                <div className="pdp-spec-item-rich">
                   <span className="spec-label">Neck</span>
                   <span className="spec-value">V-Neck</span>
                </div>
                <div className="pdp-spec-item-rich">
                   <span className="spec-label">Print or Pattern Type</span>
                   <span className="spec-value">Floral</span>
                </div>
                <div className="pdp-spec-item-rich">
                   <span className="spec-label">Occasion</span>
                   <span className="spec-value">Daily</span>
                </div>
                <div className="pdp-spec-item-rich">
                   <span className="spec-label">Weave Pattern</span>
                   <span className="spec-value">Regular</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Recommended Carousel (Customers Also Liked) */}
      {recommendations.length > 0 && (
         <div className="pdp-recommendations-section">
            <h2 className="pdp-section-header-large">SIMILAR PRODUCTS</h2>
            <div className="pdp-scroll-carousel">
               {recommendations.map(rec => (
                 <div key={rec._id} className="pdp-carousel-card">
                   <ProductCard product={rec} />
                 </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
