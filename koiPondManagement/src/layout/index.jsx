import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';


function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <main className="content-wrapper">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;