import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-box text-primary">S</div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-bold">SURUCHI</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar__links">
          <div className="navbar__link-container">
            <NavLink to="/shop?category=women" className="navbar__link">WOMEN</NavLink>
            <div className="navbar__mega-menu">
              <div className="container navbar__mega-grid">
                <div className="navbar__mega-col">
                  <h4>Indian & Fusion Wear</h4>
                  <Link to="/shop?category=kurtas">Kurtas & Suits</Link>
                  <Link to="/shop?category=ethnic-dresses">Ethnic Dresses</Link>
                  <Link to="/shop?category=sarees">Sarees</Link>
                  <Link to="/shop?category=lehengas">Lehengas</Link>
                </div>
                <div className="navbar__mega-col">
                  <h4>Western Wear</h4>
                  <Link to="/shop?category=dresses">Dresses</Link>
                  <Link to="/shop?category=tops">Tops</Link>
                  <Link to="/shop?category=jeans">Jeans</Link>
                  <Link to="/shop?category=skirts">Skirts</Link>
                </div>
                <div className="navbar__mega-col">
                  <h4>Accessories</h4>
                  <Link to="/shop?category=handbags">Handbags</Link>
                  <Link to="/shop?category=jewellery">Jewellery</Link>
                  <Link to="/shop?category=watches">Watches</Link>
                  <Link to="/shop?category=footwear">Footwear</Link>
                </div>
                <div className="navbar__mega-col navbar__mega-col--highlight">
                  <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=300" alt="New Trends" />
                  <p>New Season Trends</p>
                </div>
              </div>
            </div>
          </div>
          <NavLink to="/shop?category=accessories" className="navbar__link">ACCESSORIES</NavLink>
          <NavLink to="/shop?category=beauty" className="navbar__link">BEAUTY</NavLink>
        </nav>

        {/* Search */}
        <div className="navbar__search-container">
          <form className="navbar__search" onSubmit={handleSearch}>
            <Search size={18} className="navbar__search-icon" />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar__search-input"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Profile */}
          <div className="navbar__action-item navbar__user-menu">
            <Link to={user ? "/profile" : "/login"} className="navbar__action-link">
              <User size={20} />
              <span>Profile</span>
            </Link>
            <div className="navbar__dropdown">
              {user ? (
                <>
                  <div className="navbar__dropdown-header">
                    <p className="font-bold">Hello {user.name.split(' ')[0]}</p>
                    <p className="text-xs text-soft">{user.mobile}</p>
                  </div>
                  
                  <div className="divider" style={{ margin: '8px 0' }} />
                  <div className="navbar__dropdown-group">
                    <Link to="/profile?tab=orders" className="navbar__dropdown-item">Orders</Link>
                    <Link to="/wishlist" className="navbar__dropdown-item">Wishlist</Link>
                    <Link to="/profile?tab=giftcards" className="navbar__dropdown-item">Gift Cards</Link>
                    <Link to="/profile?tab=contactus" className="navbar__dropdown-item">Contact Us</Link>
                    <Link to="/profile?tab=insider" className="navbar__dropdown-item">Myntra Insider <span className="badge-new">New</span></Link>
                  </div>

                  <div className="divider" style={{ margin: '8px 0' }} />
                  <div className="navbar__dropdown-group">
                    <Link to="/profile?tab=credit" className="navbar__dropdown-item">Myntra Credit</Link>
                    <Link to="/profile?tab=coupons" className="navbar__dropdown-item">Coupons</Link>
                    <Link to="/profile?tab=cards" className="navbar__dropdown-item">Saved Cards</Link>
                    <Link to="/profile?tab=upi" className="navbar__dropdown-item">Saved VPA</Link>
                    <Link to="/profile?tab=addresses" className="navbar__dropdown-item">Saved Addresses</Link>
                  </div>

                  <div className="divider" style={{ margin: '8px 0' }} />
                  <div className="navbar__dropdown-group">
                    <Link to="/profile?tab=edit" className="navbar__dropdown-item">Edit Profile</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="navbar__dropdown-item">Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="navbar__dropdown-item">Logout</button>
                  </div>
                </>
              ) : (
                <div className="navbar__dropdown-auth">
                  <p className="font-bold mb-2">Welcome</p>
                  <p className="text-xs text-soft mb-4">To access account and manage orders</p>
                  <Link to="/login" className="btn btn-primary btn-sm w-full">LOGIN / SIGNUP</Link>
                </div>
              )}
            </div>
          </div>

          {/* Wishlist */}
          <Link to="/wishlist" className="navbar__action-link navbar__action-item">
            <Heart size={20} />
            <span>Wishlist</span>
          </Link>

          {/* Bag */}
          <Link to="/cart" className="navbar__action-link navbar__action-item">
            <div className="navbar__bag-icon">
              <ShoppingBag size={20} />
              {count > 0 && <span className="navbar__bag-badge">{count}</span>}
            </div>
            <span>Bag</span>
          </Link>

          {/* Mobile toggle */}
          <button className="navbar__mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="navbar__mobile-menu">
          <div className="navbar__mobile-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          <NavLink to="/shop?category=women" onClick={() => setMenuOpen(false)}>Women</NavLink>
          <NavLink to="/shop?category=accessories" onClick={() => setMenuOpen(false)}>Accessories</NavLink>
          <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</NavLink>
          {user ? (
            <>
              <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
              <NavLink to="/orders" onClick={() => setMenuOpen(false)}>Orders</NavLink>
              <button onClick={handleLogout} className="text-error">Logout</button>
            </>
          ) : (
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
