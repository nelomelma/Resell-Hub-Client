import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
export default function Home() {
  const { API } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    products: 0,
    sellers: 0,
    buyers: 0,
    orders: 0,
  });
  const [trustedSellers, setTrustedSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [sellersError, setSellersError] = useState(false);
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storiesError, setStoriesError] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);
  useEffect(() => {
    let active = true;
    const loadHomeData = async () => {
      const results = await Promise.allSettled([
        axios.get(`${API}/products?limit=6`),
        axios.get(`${API}/marketplace/stats`),
        axios.get(`${API}/marketplace/trusted-sellers`),
        axios.get(`${API}/marketplace/success-stories`),
        axios.get(`${API}/marketplace/categories`),
      ]);
      if (!active) return;
      const [
        productsResult,
        statsResult,
        sellersResult,
        storiesResult,
        categoriesResult,
      ] = results;
      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.data.products || []);
      } else {
        console.error(
          "Could not load featured products:",
          productsResult.reason
        );
      }
      if (statsResult.status === "fulfilled") {
        const data = statsResult.value.data;
        setStats({
          products: Number(data.products) || 0,
          sellers: Number(data.sellers) || 0,
          buyers: Number(data.buyers) || 0,
          orders: Number(data.orders) || 0,
        });
      } else {
        console.error(
          "Could not load marketplace statistics:",
          statsResult.reason
        );
      }
      if (sellersResult.status === "fulfilled") {
        const data = sellersResult.value.data;
        setTrustedSellers(Array.isArray(data) ? data : []);
        setSellersError(false);
      } else {
        console.error(
          "Could not load trusted sellers:",
          sellersResult.reason
        );
        setSellersError(true);
      }
      if (storiesResult.status === "fulfilled") {
        const data = storiesResult.value.data;
        setStories(Array.isArray(data) ? data : []);
        setStoriesError(false);
      } else {
        console.error(
          "Could not load success stories:",
          storiesResult.reason
        );
        setStoriesError(true);
      }
      if (categoriesResult.status === "fulfilled") {
        const data = categoriesResult.value.data;
        setCategories(Array.isArray(data) ? data : []);
        setCategoriesError(false);
      } else {
        console.error("Could not load popular categories:", categoriesResult.reason);
        setCategoriesError(true);
      }

      setSellersLoading(false);
      setStoriesLoading(false);
      setCategoriesLoading(false);
    };
    loadHomeData();
    return () => {
      active = false;
    };
  }, [API]);
  /* Images and descriptions are presentation-only.
     Names and product counts come from MongoDB. */
  const categoryAppearance = {
    "Electronics": { image: "/products/dell-inspiron.jpg", text: "Laptops, cameras & electronics" },
    "Furniture": { image: "/products/sofa.jpg", text: "Furniture for your space" },
    "Home Appliances": { image: "/products/coffee-maker.jpg", text: "Appliances for everyday living" },
    "Mobile Phones": { image: "/products/samsung-s22.jpg", text: "Smartphones & accessories" },
    "Sports & Outdoors": { image: "/products/mountain-bike.jpg", text: "Gear for an active lifestyle" },
    "Fashion": { image: "/products/denim-jacket.jpg", text: "Clothing & accessories" },
    "Gaming": { image: "/products/ps5.jpg", text: "Consoles & gaming essentials" },
    "Musical Instruments": { image: "/products/acoustic-guitar.jpg", text: "Instruments & music gear" },
    "Vehicles": { image: "/products/yamaha-fz.jpg", text: "Motorcycles & vehicles" },
    "Baby & Kids": { image: "/products/baby-stroller.jpg", text: "Useful items for little ones" },
    "Books": { image: "/products/harry-potter-books.jpg", text: "Stories & learning" },
    "Home & Living": { image: "/products/floor-lamp.jpg", text: "Home décor & essentials" },
    "Tools & DIY": { image: "/products/bosch-drill.jpg", text: "Tools for your next project" },
    "Toys & Games": { image: "/products/lego-set.jpg", text: "Play & creativity" },
  };

  const popularCategories = categories.slice(0, 5).map((category) => ({
    ...category,
    ...(categoryAppearance[category.name] || {
      image: "/products/dell-inspiron.jpg",
      text: "Explore pre-owned products",
    }),
  }));

  /* =======================================================
     MARKETPLACE STATISTICS
     ======================================================= */
  const marketplaceStats = [
    {
      icon: "📦",
      number: `${stats.products}+`,
      title: "Products Listed",
      subtitle: "Active marketplace listings",
    },
    {
      icon: "👥",
      number: `${stats.sellers}+`,
      title: "Active Sellers",
      subtitle: "Marketplace seller accounts",
    },
    {
      icon: "😊",
      number: `${stats.buyers}+`,
      title: "Active Buyers",
      subtitle: "Growing marketplace community",
    },
    {
      icon: "✓",
      number: `${stats.orders}+`,
      title: "Orders Created",
      subtitle: "Marketplace deals",
    },
  ];
  return (
    <>
      {/* ===================================================
          HERO
          =================================================== */}
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <span className="eyebrow">
            SECOND-HAND. FIRST CHOICE.
          </span>
          <h1>
            Give great products a <em>second life.</em>
          </h1>
          <p>
            Buy quality pre-owned products at fair prices, or turn
            the things you no longer use into money through a trusted
            marketplace.
          </p>
          <div className="actions">
            <Link className="btn" to="/products">
              Explore Products
            </Link>
            <Link
              className="btn ghost"
              to="/dashboard/add-product"
            >
              Sell an Item
            </Link>
          </div>
          <div className="hero-trust">
            <span>✓ Secure marketplace</span>
            <span>✓ Trusted sellers</span>
            <span>✓ Sustainable shopping</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-card">
            <div className="hero-card-icon">♻️</div>
            <strong>Smart shopping</strong>
            <span>
              Save money while giving useful products another life.
            </span>
            <div className="hero-mini-stats">
              <div>
                <b>{stats.products}+</b>
                <span>Products</span>
              </div>
              <div>
                <b>{stats.sellers}+</b>
                <span>Sellers</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      {/* ===================================================
          FEATURED PRODUCTS
          =================================================== */}
      <section className="home-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">JUST ADDED</span>
            <h2>Featured Products</h2>
            <p>
              Discover some of the latest products in our marketplace.
            </p>
          </div>
          <Link to="/products" className="view-all">
            View all →
          </Link>
        </div>
        <div className="grid products">
          {products.map((product) => (
            <ProductCard key={product._id} p={product} />
          ))}
        </div>
      </section>
      {/* ===================================================
          MARKETPLACE STATISTICS
          =================================================== */}
      <motion.section
        className="marketplace-stats"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="marketplace-stats-inner">
          {marketplaceStats.map((item) => (
            <div className="market-stat" key={item.title}>
              <div className="market-stat-icon">
                {item.icon}
              </div>
              <strong>{item.number}</strong>
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
          ))}
        </div>
      </motion.section>
      {/* ===================================================
          POPULAR CATEGORIES
          =================================================== */}
      <section className="home-section category-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">DISCOVER</span>
            <h2>Popular Categories</h2>
            <p>
              Explore popular categories and find what you need.
            </p>
          </div>
          <Link to="/categories" className="view-all">
            All categories →
          </Link>
        </div>
        <div className="home-category-grid">
          {categoriesLoading && <p>Loading popular categories...</p>}
          {!categoriesLoading && categoriesError && (
            <p>Popular categories are temporarily unavailable.</p>
          )}
          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <p>No categories are available yet.</p>
          )}
          {!categoriesLoading && !categoriesError && popularCategories.map((category) => (
            <Link
              key={category.name}
              className="home-category-card"
              to={`/products?category=${encodeURIComponent(
                category.name
              )}`}
            >
              <div className="home-category-image">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                />
                <span className="category-image-overlay" />
              </div>
              <div className="home-category-content">
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.count} {category.count === 1 ? "product" : "products"} · {category.text}</span>
                </div>
                <div className="category-arrow">→</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* ===================================================
          SUCCESS STORIES - MONGODB REVIEWS
          =================================================== */}
      <section className="home-section stories-section">
        <div className="story-heading">
          <span className="story-label">
            COMMUNITY REVIEWS
          </span>
          <h2>Success Stories</h2>
          <p>
            Read product feedback from members of the
            ReSell Hub marketplace community.
          </p>
        </div>
        <div className="home-story-grid">
          {storiesLoading && (
            <p>Loading community reviews...</p>
          )}
          {!storiesLoading && storiesError && (
            <p>
              Community reviews are temporarily unavailable.
            </p>
          )}
          {!storiesLoading &&
            !storiesError &&
            stories.length === 0 && (
              <p>No community reviews are available yet.</p>
            )}
          {!storiesLoading &&
            !storiesError &&
            stories.map((story) => {
              const name =
                story.reviewerName || "Marketplace Buyer";
              const rating = Math.min(
                5,
                Math.max(0, Number(story.rating) || 0)
              );
              return (
                <motion.article
                  className="home-story-card"
                  key={story._id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="story-stars"
                    aria-label={`${rating} out of 5 stars`}
                  >
                    {"★".repeat(Math.round(rating))}
                    {"☆".repeat(
                      5 - Math.round(rating)
                    )}
                  </div>
                  <p className="story-quote">
                    “{story.comment}”
                  </p>
                  <div className="story-person">
                    <div className="story-avatar">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{name}</strong>
                      <span>
                        {story.role || "Buyer"}
                      </span>
                      {story.productTitle && (
                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                            color: "#64748b",
                            fontSize: "12px",
                          }}
                        >
                          Reviewed: {story.productTitle}
                        </small>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
        </div>
      </section>
      {/* ===================================================
          SUSTAINABILITY
          =================================================== */}
      <motion.section
        className="impact"
        initial={{ opacity: 0.4, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="impact-content">
          <span className="eyebrow impact-eyebrow">
            SUSTAINABILITY IMPACT
          </span>
          <h2>
            Reuse today. Reduce tomorrow.
          </h2>
          <p>
            Choosing pre-owned products extends product life,
            reduces unnecessary waste and supports more sustainable
            consumption.
          </p>
          <Link to="/products" className="impact-link">
            Shop pre-owned →
          </Link>
        </div>
        <div className="impact-number">♻️</div>
      </motion.section>
      {/* ===================================================
          MEET OUR SELLERS - MONGODB DATA
          =================================================== */}
      <section className="home-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              MARKETPLACE COMMUNITY
            </span>
            <h2>Meet Our Sellers</h2>
            <p>
              Discover sellers who are part of the ReSell Hub
              marketplace community.
            </p>
          </div>
        </div>
        <div className="home-seller-grid">
          {sellersLoading && (
            <p>Loading marketplace sellers...</p>
          )}
          {!sellersLoading && sellersError && (
            <p>
              Seller information is temporarily unavailable.
            </p>
          )}
          {!sellersLoading &&
            !sellersError &&
            trustedSellers.length === 0 && (
              <p>No sellers are available right now.</p>
            )}
          {!sellersLoading &&
            !sellersError &&
            trustedSellers.map((seller) => {
              const name = seller.name || "ReSell Seller";
              const rating = Number(seller.rating);
              const hasRating =
                Number.isFinite(rating) && rating > 0;
              return (
                <div
                  className="home-seller-card"
                  key={seller._id}
                >
                  <div className="seller-avatar">
                    {seller.photo ? (
                      <img
                        src={seller.photo}
                        alt={name}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="seller-information">
                    <div className="seller-name-row">
                      <strong>{name}</strong>
                      {seller.verified === true && (
                        <span
                          className="verified-badge"
                          title="Verified seller"
                          aria-label="Verified seller"
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="seller-location">
                      {seller.location ||
                        "Location not provided"}
                    </span>
                    <div className="seller-rating">
                      {hasRating ? (
                        <>
                          <span>★</span>
                          <b>{rating.toFixed(1)}</b>
                        </>
                      ) : (
                        <small>No ratings yet</small>
                      )}
                      {seller.verified === true && (
                        <small>Verified seller</small>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
      {/* ===================================================
          FINAL CTA
          =================================================== */}
      <section className="home-cta">
        <div>
          <span className="eyebrow">
            READY TO GET STARTED?
          </span>
          <h2>
            Find your next great deal.
          </h2>
          <p>
            Browse quality pre-owned products or list something you
            no longer need.
          </p>
        </div>
        <div className="home-cta-actions">
          <Link className="btn" to="/products">
            Browse Products
          </Link>
          <Link
            className="btn ghost"
            to="/dashboard/add-product"
          >
            Start Selling
          </Link>
        </div>
      </section>
    </>
  );
}
