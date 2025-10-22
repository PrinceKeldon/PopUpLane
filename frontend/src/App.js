import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import HowItWorks from "./components/HowItWorks";
import DiscoveryGrid from "./components/DiscoveryGrid";
import NewsletterSection from "./components/NewsletterSection";
import Footer from "./components/Footer";
import { Toaster } from "./components/ui/toaster";

const Home = () => {
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
        onMerchantCTA={() => scrollToSection('newsletter')}
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
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
