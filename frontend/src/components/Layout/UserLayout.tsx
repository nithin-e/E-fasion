import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const UserLayout: React.FC = () => (
  <div className="user-layout">
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 80px)' }}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default UserLayout;
