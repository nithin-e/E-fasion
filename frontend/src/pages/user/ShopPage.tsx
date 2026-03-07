import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { getProductsApi, getCategoriesApi } from '../../api/productApi';
import type { Product, Category } from '../../types';
import ProductCard from '../../components/shared/ProductCard';
import './ShopPage.css';

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Sort by: Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_low' },
  { label: 'Price: High to Low', value: 'price_high' },
];
const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentSearch = searchParams.get('q') || '';

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (currentCategory) params.category = currentCategory;
      if (currentSort) params.sort = currentSort;
      if (currentSearch) params.q = currentSearch;
      const res = await getProductsApi(params);
      setProducts(res.data.products || []);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentSort, currentSearch]);

  useEffect(() => {
    getCategoriesApi().then((r) => setCategories(r.data.categories || []));
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
  };

  return (
    <div className="shop-page container" style={{ maxWidth: '1600px' }}>
      {/* Breadcrumbs */}
      {/* Breadcrumbs */}
      <div className="shop-breadcrumbs">
        <span onClick={() => navigate('/')}>Home</span> / <span>Clothing</span> / <span className="current">{currentCategory ? categories.find(c => c._id === currentCategory)?.name : 'All Products'}</span>
      </div>

      <div className="shop-title-row">
        <h3>{currentCategory ? categories.find(c => c._id === currentCategory)?.name : 'All Products'} <span className="item-count">- {products.length} items</span></h3>
      </div>

      <div className="shop-secondary-header">
        <div className="shop-filters-header">
           <span className="filters-label">FILTERS</span>
        </div>
        <div className="shop-horizontal-filters">
           <div className="h-filter-item">Bundles <ChevronDown size={14} className="arrow" /></div>
           <div className="h-filter-item">Country of Origin <ChevronDown size={14} className="arrow" /></div>
           <div className="h-filter-item">Size <ChevronDown size={14} className="arrow" /></div>
        </div>
        <div className="shop-toolbar-right">
           <div className="shop-toolbar__sort">
              <select value={currentSort} onChange={(e) => setParam('sort', e.target.value)}>
                 <option value="">Sort by: Recommended</option>
                 {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
           </div>
        </div>
      </div>

      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className="shop-filters">
          <div className="shop-filters__title-section">
            <span className="shop-filters__title">FILTERS</span>
          </div>
          
          <div className="divider" />

          <div className="shop-filters__section">
            <p className="shop-filters__label">CATEGORIES</p>
            <div className="shop-filters__options">
              {categories.map((cat) => (
                <label key={cat._id} className="shop-filters__checkbox">
                  <input type="checkbox" checked={currentCategory === cat._id} onChange={() => setParam('category', currentCategory === cat._id ? '' : cat._id)} />
                  {cat.name} <span className="count">({Math.floor(Math.random() * 5000) + 100})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="divider" />

          <div className="shop-filters__section">
            <div className="label-with-search">
               <p className="shop-filters__label">BRAND</p>
               <div className="search-circle"><Search size={12} /></div>
            </div>
            <div className="shop-filters__options">
              <label className="shop-filters__checkbox"><input type="checkbox" /> Suruchi Exclusive <span className="count">(420)</span></label>
              <label className="shop-filters__checkbox"><input type="checkbox" /> Diva Fashion <span className="count">(150)</span></label>
              <label className="shop-filters__checkbox"><input type="checkbox" /> Anouk <span className="count">(10375)</span></label>
              <label className="shop-filters__checkbox"><input type="checkbox" /> Sangria <span className="count">(9254)</span></label>
              <div className="more-link">+ 12 more</div>
            </div>
          </div>

          <div className="divider" />

          <div className="shop-filters__section">
            <p className="shop-filters__label">PRICE</p>
            <div className="shop-filters__options">
              <label className="shop-filters__checkbox"><input type="checkbox" /> Rs. 499 to Rs. 999 <span className="count">(1204)</span></label>
              <label className="shop-filters__checkbox"><input type="checkbox" /> Rs. 999 to Rs. 1999 <span className="count">(3502)</span></label>
              <label className="shop-filters__checkbox"><input type="checkbox" /> Rs. 1999 to Rs. 4999 <span className="count">(850)</span></label>
            </div>
          </div>

          <div className="divider" />

          <div className="shop-filters__section">
            <div className="label-with-search">
               <p className="shop-filters__label">COLOR</p>
               <div className="search-circle"><Search size={12} /></div>
            </div>
            <div className="shop-filters__options">
              <label className="shop-filters__checkbox">
                <input type="checkbox" /> 
                <span className="color-dot" style={{ background: '#000' }}></span> Black <span className="count">(850)</span>
              </label>
              <label className="shop-filters__checkbox">
                <input type="checkbox" /> 
                <span className="color-dot" style={{ background: '#ff3f6c' }}></span> Pink <span className="count">(420)</span>
              </label>
              <label className="shop-filters__checkbox">
                <input type="checkbox" /> 
                <span className="color-dot" style={{ background: '#fff', border: '1px solid #ddd' }}></span> White <span className="count">(310)</span>
              </label>
            </div>
          </div>

          <div className="divider" />

          <div className="shop-filters__section">
            <p className="shop-filters__label">DISCOUNT RANGE</p>
            <div className="shop-filters__options">
              <label className="shop-filters__checkbox"><input type="radio" name="discount" /> 10% and above</label>
              <label className="shop-filters__checkbox"><input type="radio" name="discount" /> 20% and above</label>
              <label className="shop-filters__checkbox"><input type="radio" name="discount" /> 30% and above</label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="shop-main">
          {/* Promo Ribbon */}
          <div className="promo-ribbon-sticky">
             UPTO ₹500 OFF
          </div>

          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
