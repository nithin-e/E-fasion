import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import type { Product } from '../../types';
import { addToWishlistApi } from '../../api/userApi';
import { toast } from '../../hooks/useToast';
import './ProductCard.css';

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const firstVariant = product.variants?.[0];
  const price = firstVariant?.price ?? product.basePrice;
  const mrp = firstVariant?.price ? firstVariant.price * 1.5 : product.basePrice * 1.5; 
  const brandName = typeof product.brand === 'object' ? (product.brand as any).name : product.brand;
  const isNew = new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  const discount = firstVariant?.discountPrice ? Math.round(((price - firstVariant.discountPrice) / price) * 100) : 33;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToWishlistApi(product._id);
      toast.success('Added to wishlist!');
    } catch {
      toast.error('Please log in first');
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card__image-container">
        <img
          src={firstVariant?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400'}
          alt={product.name}
          className="product-card__image"
        />
        {isNew && <div className="product-card__tag-new">NEW</div>}
        
        <div className="product-card__rating">
          {product.avgRating || 4.2} <Star size={10} fill="currentColor" /> | {product.numReviews ? (product.numReviews > 1000 ? (product.numReviews/1000).toFixed(1) + 'k' : product.numReviews) : '2.1k'}
        </div>

        <div className="product-card__hover-actions">
          <button className="product-card__wishlist-btn-large" onClick={handleWishlist}>
             <Heart size={18} /> WISHLIST
          </button>
        </div>
      </div>

      <div className="product-card__info">
        <div className="product-card__hover-sizes">
          <span>Sizes: {Array.from(new Set(product.variants?.map(v => v.size))).filter(Boolean).sort().slice(0, 5).join(', ') || 'S, M, L, XL'}</span>
        </div>
        <h4 className="product-card__brand">{brandName?.toUpperCase() || 'E-FASHION'}</h4>
        <p className="product-card__name">{product.name}</p>
        <div className="product-card__price-row">
          <span className="product-card__price-current">Rs. {Math.floor(price)}</span>
          <span className="product-card__price-mrp">Rs. {Math.floor(mrp)}</span>
          <span className="product-card__discount">({discount}% OFF)</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
