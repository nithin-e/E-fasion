import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, RotateCcw, Shield } from 'lucide-react';
import { getProductsApi } from '../../api/productApi';
import type { Product } from '../../types';
import ProductCard from '../../components/shared/ProductCard';
import './HomePage.css';

const perks = [
  { icon: <Truck size={24} />, label: 'Free Delivery', sub: 'On orders over ₹5,000' },
  { icon: <Shield size={24} />, label: '100% Authentic', sub: 'Certified genuine products' },
  { icon: <RotateCcw size={24} />, label: 'Easy Returns', sub: '7-day hassle-free returns' },
  { icon: <Star size={24} />, label: 'Top Rated', sub: 'By thousands of women' },
];

const HOMEPAGE_CATEGORIES = [
  { id: 'ethnic', name: 'Ethnic Wear', img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=200' },
  { id: 'western', name: 'Western Wear', img: 'https://images.unsplash.com/photo-1539109132314-d49c02d82267?auto=format&fit=crop&q=80&w=200' },
  { id: 'accessories', name: 'Accessories', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200' },
  { id: 'beauty', name: 'Beauty', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=200' },
  { id: 'footwear', name: 'Footwear', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200' },
  { id: 'jewellery', name: 'Jewellery', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200' },
];

const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pRes = await getProductsApi({ limit: 12 });
        setFeatured(pRes.data.products || []);
      } catch {
        // silently degrade
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="home-page">
      {/* ===== HERO CAROUSEL ===== */}
      <section className="home-hero-carousel">
        <div className="home-hero-slide">
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200" alt="Banner" className="home-hero-img" />
          <div className="home-hero-overlay">
            <div className="container">
              <h2>Fashion Carnival</h2>
              <p>50-80% OFF</p>
              <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY (Circles) ===== */}
      <section className="home-section container">
        <h3 className="home-section-title">SHOP BY CATEGORY</h3>
        <div className="home-category-circles">
          {HOMEPAGE_CATEGORIES.map((cat) => (
            <Link to={`/shop?category=${cat.id}`} key={cat.id} className="home-category-circle-item">
              <div className="home-category-circle-img">
                <img src={cat.img} alt={cat.name} />
              </div>
              <p>{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== PROMO TILES ===== */}
      <section className="home-section container">
        <div className="home-promo-grid">
          <Link to="/shop?sort=newest" className="home-promo-card">
            <img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&q=80&w=600" alt="New Arrivals" />
            <div className="home-promo-content">
              <h4>New Arrivals</h4>
              <p>Explore latest trends</p>
            </div>
          </Link>
          <Link to="/shop?category=western" className="home-promo-card">
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600" alt="Western Wear" />
            <div className="home-promo-content">
              <h4>Western Fusion</h4>
              <p>Under ₹999</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="home-section container">
        <div className="home-section__header">
          <h3 className="home-section-title">TRENDING PRODUCTS</h3>
          <Link to="/shop" className="home-section__see-all">View all <ArrowRight size={14} /></Link>
        </div>
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <div className="home-products-grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* ===== PERKS BAR ===== */}
      <section className="home-perks-bar">
        <div className="container home-perks-grid">
          {perks.map((p) => (
            <div key={p.label} className="home-perk-item">
              <span className="home-perk-icon">{p.icon}</span>
              <p className="home-perk-label">{p.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== APP BANNER ===== */}
      <section className="home-app-section">
        <div className="container home-app-inner">
          <div className="home-app-text">
            <h2>Experience Suruchi on Mobile</h2>
            <p>Get exclusive offers and faster checkout</p>
            <div className="home-app-badges">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" />
            </div>
          </div>
          <div className="home-app-visual">
             <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=400" alt="App Preview" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
