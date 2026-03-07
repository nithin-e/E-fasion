import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-v2">
      <div className="container footer-content-grid">
        <div className="footer-column">
          <h4 className="footer-title">ONLINE SHOPPING</h4>
          <Link to="/shop?category=women">Men</Link>
          <Link to="/shop?category=women">Women</Link>
          <Link to="/shop?category=kids">Kids</Link>
          <Link to="/shop?category=home-living">Home & Living</Link>
          <Link to="/shop?category=beauty">Beauty</Link>
          <Link to="/gift-cards">Gift Cards</Link>
        </div>

        <div className="footer-column">
          <h4 className="footer-title">CUSTOMER POLICIES</h4>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/t&c">T&C</Link>
          <Link to="/terms-of-use">Terms Of Use</Link>
          <Link to="/shipping">Track Orders</Link>
          <Link to="/shipping-policy">Shipping</Link>
          <Link to="/returns">Cancellation</Link>
          <Link to="/returns-policy">Returns</Link>
          <Link to="/privacy-policy">Privacy policy</Link>
        </div>

        <div className="footer-column experience-column">
          <h4 className="footer-title">EXPERIENCE SURUCHI APP</h4>
          <div className="app-badges">
             <div className="badge-placeholder">GET IT ON <br/> <strong>Google Play</strong></div>
             <div className="badge-placeholder">Download on the <br/> <strong>App Store</strong></div>
          </div>
          <h4 className="footer-title mt-8">KEEP IN TOUCH</h4>
          <div className="social-icons">
             <Facebook size={20} />
             <Twitter size={20} />
             <Instagram size={20} />
          </div>
        </div>

        <div className="footer-column features-column">
           <div className="feature-item">
              <img src="https://constant.myntassets.com/web/assets/img/6c330058-60a2-42bc-86a1-0ea9036887a71534415999395-check.png" alt="100% Original" width="40" />
              <p><strong>100% ORIGINAL</strong> guarantee for all products at suruchifashion.com</p>
           </div>
           <div className="feature-item">
              <img src="https://constant.myntassets.com/web/assets/img/efbf6859-f2d0-4fd3-a159-fec00b0d32461534415999305-30days.png" alt="30 Days Return" width="40" />
              <p><strong>Return within 30days</strong> of receiving your order</p>
           </div>
        </div>
      </div>

      <div className="container footer-bottom">
         <p className="copyright-text">In case of any concern, <strong>Contact Us</strong></p>
         <p className="copyright-info">© {new Date().getFullYear()} www.suruchifashion.com. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
