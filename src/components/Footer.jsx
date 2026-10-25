import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* =========================
            BRAND / ABOUT
        ========================== */}
        <div className="footer-brand-column">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">R</span>

            <span>
              ReSell <strong>Hub</strong>
            </span>
          </Link>

          <p className="footer-description">
            A trusted international marketplace for buying and selling
            quality pre-owned products. Save money, reduce waste, and
            give great products a second life.
          </p>

          <div className="footer-contact-list">
            <a href="mailto:support@resell.com">
              <span className="footer-contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
                </svg>
              </span>

              support@resell.com
            </a>

            <a href="mailto:resellhub.official@gmail.com">
              <span className="footer-contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
                </svg>
              </span>

              resellhub.official@gmail.com
            </a>

            <div className="footer-global">
              <span className="footer-contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm6.92 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.06 8.06 0 0 1 18.92 8ZM12 4c.83 1.2 1.48 2.53 1.91 4h-3.82A13.6 13.6 0 0 1 12 4ZM4.26 14a7.8 7.8 0 0 1 0-4h3.38a16.4 16.4 0 0 0 0 4H4.26Zm.82 2h2.95c.32 1.27.79 2.47 1.38 3.56A8.06 8.06 0 0 1 5.08 16ZM8.03 8H5.08a8.06 8.06 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.03 8ZM12 20a13.6 13.6 0 0 1-1.91-4h3.82A13.6 13.6 0 0 1 12 20Zm2.32-6H9.68a14.4 14.4 0 0 1 0-4h4.64a14.4 14.4 0 0 1 0 4Zm.27 5.56A15.7 15.7 0 0 0 15.97 16h2.95a8.06 8.06 0 0 1-4.33 3.56ZM16.36 14a16.4 16.4 0 0 0 0-4h3.38a7.8 7.8 0 0 1 0 4h-3.38Z" />
                </svg>
              </span>

              Global Marketplace
            </div>
          </div>

          {/* SOCIAL ICONS */}
          <div className="footer-socials">

            {/* Facebook */}
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07C2 17.1 5.66 21.27 10.44 22v-7.03H7.9v-2.9h2.54V9.86c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.9h2.77l-.44 2.9h-2.33V22C18.34 21.27 22 17.1 22 12.07Z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5ZM17 5.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M6.5 8.5H3.25V19H6.5V8.5ZM4.88 3A1.88 1.88 0 1 0 4.88 6.76 1.88 1.88 0 0 0 4.88 3ZM19.5 13.05c0-3.16-1.68-4.63-3.93-4.63-1.81 0-2.62.99-3.07 1.69V8.5H9.25V19h3.25v-5.2c0-1.37.26-2.7 1.96-2.7 1.68 0 1.7 1.57 1.7 2.79V19h3.34v-5.95Z" />
              </svg>
            </a>
          </div>
        </div>

        {/* =========================
            QUICK LINKS
        ========================== */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <nav className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>

        {/* =========================
            ACCOUNT
        ========================== */}
        <div className="footer-column">
          <h3>Account</h3>

          <nav className="footer-links">
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/dashboard/orders">My Orders</Link>
            <Link to="/dashboard/wishlist">Wishlist</Link>
          </nav>
        </div>

        {/* =========================
            CATEGORIES
        ========================== */}
        <div className="footer-column">
          <h3>Categories</h3>

          <nav className="footer-links">
            <Link to="/products?category=Electronics">
              Electronics
            </Link>

            <Link to="/products?category=Mobile%20Phones">
              Mobile Phones
            </Link>

            <Link to="/products?category=Furniture">
              Furniture
            </Link>

            <Link to="/products?category=Vehicles">
              Vehicles
            </Link>

            <Link to="/products?category=Fashion">
              Fashion
            </Link>
          </nav>
        </div>
      </div>

      {/* =========================
          FOOTER BOTTOM
      ========================== */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>
            © {new Date().getFullYear()} ReSell Hub. All rights reserved.
          </p>

          <p className="footer-sustainability">
            ♻ Sustainable Marketplace
          </p>
        </div>
      </div>
    </footer>
  );
}