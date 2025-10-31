import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import MinimalistHero from "./components/MinimalistHero";
import AboutSection from "./components/AboutSection";
import HowItWorks from "./components/HowItWorks";
import DiscoveryGrid from "./components/DiscoveryGrid";
import NewsletterSection from "./components/NewsletterSection";
import Footer from "./components/Footer";
import MerchantSubmission from "./pages/MerchantSubmission";
import MerchantSignIn from "./pages/MerchantSignIn";
import MerchantRegister from "./pages/MerchantRegister";
import MerchantDashboard from "./pages/MerchantDashboard";
import ShopperSignIn from "./pages/ShopperSignIn";
import ShopperRegister from "./pages/ShopperRegister";
import MyFinds from "./pages/MyFinds";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { Toaster } from "./components/ui/toaster";

const Home = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Hero 
        onGetNotified={() => scrollToSection('newsletter')}
        onExplore={() => scrollToSection('discovery')}
      />
      <div id="about">
        <AboutSection />
      </div>
      <HowItWorks 
        onShopperCTA={() => scrollToSection('discovery')}
        onMerchantCTA={() => navigate('/merchant/signin')}
      />
      <div id="discovery">
        <DiscoveryGrid />
      </div>
      <div id="newsletter">
        <NewsletterSection />
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merchant/signin" element={<MerchantSignIn />} />
          <Route path="/merchant/register" element={<MerchantRegister />} />
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="/merchant/submit" element={<MerchantSubmission />} />
          <Route path="/shopper/signin" element={<ShopperSignIn />} />
          <Route path="/shopper/register" element={<ShopperRegister />} />
          <Route path="/my-finds" element={<MyFinds />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
