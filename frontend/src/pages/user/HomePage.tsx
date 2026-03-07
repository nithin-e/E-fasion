import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductsApi, getBannersApi, getBrandsApi } from '../../api/productApi';
import type { Product, Banner, Brand } from '../../types';
import ProductCard from '../../components/shared/ProductCard';
import './HomePage.css';

const perks = [
  { icon: <Truck size={24} />, label: 'Free Delivery', sub: 'Calculated at checkout' },
  { icon: <Shield size={24} />, label: '100% Authentic', sub: 'Genuine Products Only' },
  { icon: <RotateCcw size={24} />, label: 'Easy Returns', sub: '7 Days Return Policy' },
  { icon: <Star size={24} />, label: 'Top Rated', sub: 'Trusted by Millions' },
];

const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, bRes, brRes] = await Promise.all([
          getProductsApi({ limit: 10 }),
          getBannersApi(),
          getBrandsApi()
        ]);
        setFeatured(pRes.data.products || []);
        setBanners(bRes.data.banners || []);
        setBrands(brRes.data.brands || []);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const itv = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(itv);
  }, [banners.length]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="home-page">
      {/* ===== HERO CAROUSEL ===== */}
      {banners.length > 0 && (
        <section className="home-hero-carousel">
          <div className="carousel-track" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
            {banners.map((ban, idx) => (
              <div key={ban._id || idx} className="hero-slide">
                <Link to={ban.link}>
                  <img src={ban.image} alt={ban.title} className="hero-img" />
                </Link>
              </div>
            ))}
          </div>
          {banners.length > 1 && (
            <div className="carousel-controls">
              <button className="ctrl-btn prev" onClick={() => setCurrentBanner(c => (c - 1 + banners.length) % banners.length)}>
                <ChevronLeft size={30} />
              </button>
              <button className="ctrl-btn next" onClick={() => setCurrentBanner(c => (c + 1) % banners.length)}>
                <ChevronRight size={30} />
              </button>
            </div>
          )}
        </section>
      )}

      {/* ===== BRAND SHOWCASE ===== */}
      <section className="home-section container">
        <h4 className="section-label">MEDAL WORTHY BRANDS TO BAG</h4>
        <div className="home-brands-grid">
           {brands.slice(0, 12).map((brand) => (
             <Link to={`/shop?brand=${brand.name}`} key={brand._id} className="brand-tile">
                <img src={brand.logo} alt={brand.name} />
                <div className="brand-overlay">
                   <span>{brand.name}</span>
                </div>
             </Link>
           ))}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="home-section container">
        <div className="section-title-bar">
          <h4 className="section-label">TRENDING NOW</h4>
          <Link to="/shop" className="see-all">VIEW ALL <ArrowRight size={14} /></Link>
        </div>
        <div className="home-products-row">
           {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* ===== PERKS BAR ===== */}
      <section className="home-perks-section">
        <div className="container perks-flex">
          {perks.map((p) => (
            <div key={p.label} className="perk-box">
              <div className="perk-icon">{p.icon}</div>
              <div className="perk-info">
                 <p className="p-label">{p.label}</p>
                 <p className="p-sub">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== APP BANNER ===== */}
      <section className="home-app-promo container">
         <img src="https://assets.myntassets.com/f_webp,w_980,c_limit,fl_progressive,dpr_2.0/assets/img/2021/3/30/6283b77a-2483-4ee1-97ed-a84126305a2e1617112046892-Banner-App-Landing-Page.jpg" alt="App Promo" className="w-100" />
      </section>
    </div>
  );
};

export default HomePage;
