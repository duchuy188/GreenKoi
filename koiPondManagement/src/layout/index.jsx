import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import Icon from '../components/Icon';

function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="main-layout">
      <Header />
      <main className="content-wrapper">
        <Outlet />
      </main>
      <Icon/>
      <Footer />      
    </div>
  );
}

export default MainLayout;
