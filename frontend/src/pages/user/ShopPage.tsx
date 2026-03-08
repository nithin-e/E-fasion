import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { getProductsApi, getCategoriesApi } from '../../api/productApi';
import { getBrandsApi } from '../../api/brandApi';
import type { Product, Category, Brand } from '../../types';
import ProductCard from '../../components/shared/ProductCard';
import './ShopPage.css';

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Customer Rating', value: 'rating' },
];

const DISCOUNT_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80];

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States from URL
  const fParam = searchParams.get('f') || '';
  const currentSort = searchParams.get('sort') || 'recommended';
  const currentSearch = searchParams.get('q') || '';

  const parsedFilters = React.useMemo(() => {
    const filters: { brand: string[], color: string[], category: string[], minPrice: string, maxPrice: string, discount: string } = {
      brand: [], color: [], category: [], minPrice: '', maxPrice: '', discount: ''
    };
    if (!fParam) return filters;
    
    const parts = fParam.split('::');
    parts.forEach(part => {
      const [key, value] = part.split(':');
      if (!key || !value) return;
      
      const vItems = value.split(',');
      if (key === 'Brand') filters.brand = vItems;
      else if (key === 'Color') filters.color = vItems;
      else if (key === 'Category') filters.category = vItems;
      else if (key === 'Price') {
         const [min, max] = value.split(' TO ');
         filters.minPrice = min || '';
         filters.maxPrice = max || '';
      }
      else if (key === 'Discount Range') {
         const [min] = value.split(' TO ');
         filters.discount = min || '';
      }
    });
    return filters;
  }, [fParam]);

  const { brand: selectedBrands, color: selectedColors, category: selectedCategories, minPrice, maxPrice, discount } = parsedFilters;
  const mainCategoryName = selectedCategories[0] || '';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        getProductsApi({
          q: currentSearch,
          category: selectedCategories.length ? selectedCategories : undefined,
          brand: selectedBrands,
          color: selectedColors,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          discount: discount ? parseFloat(discount) : undefined,
          sort: currentSort,
        }),
        getCategoriesApi(),
        getBrandsApi(),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
      setBrands(brandRes.data.brands || []);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, selectedCategories.join(','), selectedBrands.join(','), selectedColors.join(','), minPrice, maxPrice, discount, currentSort]);

  useEffect(() => { loadData(); }, [loadData]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const updateFParam = (newFilters: typeof parsedFilters) => {
    const parts: string[] = [];
    if (newFilters.brand.length) parts.push(`Brand:${newFilters.brand.join(',')}`);
    if (newFilters.category.length) parts.push(`Category:${newFilters.category.join(',')}`);
    if (newFilters.color.length) parts.push(`Color:${newFilters.color.join(',')}`);
    if (newFilters.minPrice && newFilters.maxPrice) parts.push(`Price:${newFilters.minPrice} TO ${newFilters.maxPrice}`);
    if (newFilters.discount) parts.push(`Discount Range:${newFilters.discount} TO 100.0`);
    
    setParam('f', parts.join('::'));
  };

  const toggleArrayFilter = (key: keyof typeof parsedFilters, value: string) => {
    const current = parsedFilters[key] as string[];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    updateFParam({ ...parsedFilters, [key]: updated });
  };

  return (
    <div className="shop-page container" style={{ maxWidth: '1600px' }}>
      <div className="shop-breadcrumbs">
        <span onClick={() => navigate('/')}>Home</span> / <span>Clothing</span> / 
        <span className="current">{mainCategoryName ? mainCategoryName : 'All Products'}</span>
      </div>

      <div className="shop-title-row">
        <h3>
          {mainCategoryName ? mainCategoryName : 'All Products'} 
          <span className="item-count"> - {products.length} items</span>
        </h3>
      </div>

      <div className="shop-secondary-header">
        <div className="shop-filters-header">FILTERS</div>
        <div className="shop-horizontal-filters">
           <div className="h-filter-item">Bundles <ChevronDown size={14} className="arrow" /></div>
           <div className="h-filter-item">Country of Origin <ChevronDown size={14} className="arrow" /></div>
           <div className="h-filter-item">Size <ChevronDown size={14} className="arrow" /></div>
        </div>
        <div className="shop-toolbar-right">
           <div className="shop-toolbar__sort">
              <select value={currentSort} onChange={(e) => setParam('sort', e.target.value)}>
                 {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
           </div>
        </div>
      </div>

      <div className="shop-layout">
        <aside className="shop-filters">
          <div className="shop-filters__section">
            <p className="shop-filters__label">CATEGORIES</p>
            <div className="shop-filters__options">
              {categories.slice(0, 8).map((cat) => (
                <label key={cat._id} className="shop-filters__checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat.name)} 
                    onChange={() => toggleArrayFilter('category', cat.name)} 
                  />
                  {cat.name}
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
              {brands.slice(0, 8).map(brand => (
                <label key={brand._id} className="shop-filters__checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(brand.name)} 
                    onChange={() => toggleArrayFilter('brand', brand.name)} 
                  />
                  {brand.name}
                </label>
              ))}
              {brands.length > 8 && <div className="more-link">+ {brands.length - 8} more</div>}
            </div>
          </div>

          <div className="divider" />

          <div className="shop-filters__section">
            <p className="shop-filters__label">PRICE</p>
            <div className="shop-filters__options">
              {[
                { label: 'Rs. 499 to Rs. 999', min: '499.0', max: '999.0' },
                { label: 'Rs. 999 to Rs. 1499', min: '999.0', max: '1499.0' },
                { label: 'Rs. 1499 to Rs. 2499', min: '1499.0', max: '2499.0' },
                { label: 'Rs. 2499 to Rs. 4999', min: '2499.0', max: '4999.0' },
              ].map(range => (
                <label key={range.label} className="shop-filters__checkbox">
                  <input 
                    type="checkbox" 
                    checked={minPrice === range.min && maxPrice === range.max}
                    onChange={() => {
                        if (minPrice === range.min) {
                           updateFParam({ ...parsedFilters, minPrice: '', maxPrice: '' });
                        } else {
                           updateFParam({ ...parsedFilters, minPrice: range.min, maxPrice: range.max });
                        }
                    }}
                  />
                  {range.label}
                </label>
              ))}
            </div>
          </div>

          <div className="divider" />

          <div className="shop-filters__section">
            <p className="shop-filters__label">COLOR</p>
            <div className="shop-filters__options">
              {[
                { name: 'Black', hex: '#000' },
                { name: 'Pink', hex: '#ff3f6c' },
                { name: 'White', hex: '#fff' },
                { name: 'Blue', hex: '#245dc2' },
              ].map(color => (
                <label key={color.name} className="shop-filters__checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedColors.includes(color.name)} 
                    onChange={() => toggleArrayFilter('color', color.name)} 
                  />
                  <span className="color-dot" style={{ backgroundColor: color.hex, border: color.name === 'White' ? '1px solid #ddd' : 'none' }}></span>
                  {color.name}
                </label>
              ))}
            </div>
          </div>

          <div className="divider" />

          <div className="shop-filters__section">
            <p className="shop-filters__label">DISCOUNT RANGE</p>
            <div className="shop-filters__options">
              {DISCOUNT_OPTIONS.map(d => (
                <label key={d} className="shop-filters__checkbox">
                  <input 
                    type="radio" 
                    name="discount" 
                    checked={discount === d.toString() + '.0'} 
                    onChange={() => updateFParam({ ...parsedFilters, discount: d.toString() + '.0' })} 
                  />
                  {d}% and above
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="shop-main">
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
