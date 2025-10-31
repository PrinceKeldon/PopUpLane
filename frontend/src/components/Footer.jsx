import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
    { label: 'Submit a Deal', href: '/merchant/signin' },
    { label: 'Browse', href: '#browse' },
    { label: 'Admin', href: '/admin/login' },
    { label: 'Privacy Policy', href: '#privacy' }
  ];

  return (
    <footer className="footer py-12 px-6" style={{ backgroundColor: '#111', borderTop: '1px solid rgba(250, 250, 250, 0.1)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {links.map((link, index) => (
            <React.Fragment key={link.href}>
              <a 
                href={link.href}
                className="text-sm transition-colors duration-300 hover:opacity-100"
                style={{ color: '#FAFAFA', opacity: 0.7 }}
              >
                {link.label}
              </a>
              {index < links.length - 1 && (
                <span style={{ color: '#FAFAFA', opacity: 0.3 }}>|</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center mb-4">
          <p className="text-sm" style={{ color: '#FAFAFA', opacity: 0.6 }}>
            © {currentYear} PopUp Lane
          </p>
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-sm italic" style={{ color: '#3A7BD5', fontFamily: 'Space Grotesk, sans-serif' }}>
            A seasonal street for small brands, creators, and indie merchants.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;