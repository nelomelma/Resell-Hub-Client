
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [reviewData, setReviewData] = useState({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // LOAD PRODUCT
  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setSelectedImageIndex(0);
        setMessage("");

        const { data } = await axios.get(`${API}/products/${id}`);

        if (active) setProduct(data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Could not load product."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [API, id]);

  // LOAD PRODUCT REVIEWS
  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError("");
      setReviewData({
        averageRating: 0,
        totalReviews: 0,
        reviews: [],
      });

      try {
        const { data } = await axios.get(
          `${API}/products/${id}/reviews`
        );

        if (active) {
          setReviewData({
            averageRating: Number(data.averageRating) || 0,
            totalReviews: Number(data.totalReviews) || 0,
            reviews: Array.isArray(data.reviews) ? data.reviews : [],
          });
        }
      } catch (err) {
        if (active) {
          setReviewsError(
            err.response?.data?.message ||
              "Could not load customer reviews."
          );
        }
      } finally {
        if (active) setReviewsLoading(false);
      }
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, [API, id]);

  // CHECK WISHLIST
  useEffect(() => {
    let active = true;
    setInWishlist(false);

    if (!user || user.role !== "buyer" || !token) {
      return () => {
        active = false;
      };
    }

    async function checkWishlist() {
      try {
        const { data } = await axios.get(
          `${API}/wishlist/${id}/check`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (active) setInWishlist(Boolean(data.inWishlist));
      } catch (err) {
        console.error("Wishlist check failed:", err);
      }
    }

    checkWishlist();

    return () => {
      active = false;
    };
  }, [API, id, user, token]);

  // ADD OR REMOVE WISHLIST
  const handleWishlist = async () => {
    setMessage("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "buyer") {
      setMessage("Wishlist is available for buyer accounts only.");
      return;
    }

    try {
      setWishlistLoading(true);

      if (inWishlist) {
        await axios.delete(`${API}/wishlist/${id}`, authConfig);
        setInWishlist(false);
        setMessage("Product removed from your wishlist.");
      } else {
        await axios.post(`${API}/wishlist/${id}`, {}, authConfig);
        setInWishlist(true);
        setMessage("Product added to your wishlist.");
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Could not update wishlist."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // BUY NOW
  const handleBuyNow = () => {
    setMessage("");

    if (!user) {
      navigate("/login", {
        state: { from: `/products/${id}` },
      });
      return;
    }

    if (user.role !== "buyer") {
      setMessage("Only buyer accounts can purchase products.");
      return;
    }

    const stock = Number(product?.stock);
    const hasStock =
      product?.stock == null ||
      (Number.isFinite(stock) && stock > 0);

    const statusAvailable =
      !product?.status ||
      String(product.status).toLowerCase() === "available";

    if (!statusAvailable || !hasStock) {
      setMessage("This product is currently unavailable.");
      return;
    }

    navigate(`/checkout/${id}`);
  };

  if (loading) {
    return <div className="loader">Loading product…</div>;
  }

  if (error || !product) {
    return (
      <section className="product-details-error">
        <h2>Product unavailable</h2>
        <p>{error || "This product could not be found."}</p>
        <Link to="/products" className="btn">
          Back to Products
        </Link>
      </section>
    );
  }

  const images = Array.isArray(product.images)
    ? product.images.filter(
        (image) =>
          typeof image === "string" && image.trim()
      )
    : [];

  const fallbackImage =
    `https://picsum.photos/seed/${product._id}/900/650`;

  const selectedImage =
    images[selectedImageIndex] ||
    images[0] ||
    fallbackImage;

  const stock = Number(product.stock);

  const hasStock =
    product.stock == null ||
    (Number.isFinite(stock) && stock > 0);

  const statusAvailable =
    !product.status ||
    String(product.status).toLowerCase() === "available";

  const available = statusAvailable && hasStock;

  const location =
    product.location ||
    product.sellerInfo?.location ||
    "Location not provided";

  const formatReviewDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    const roundedRating = Math.max(
      0,
      Math.min(5, Math.round(Number(rating) || 0))
    );

    return (
      <span
        aria-label={`${rating} out of 5 stars`}
        style={{ color: "#e5a400", letterSpacing: "2px" }}
      >
        {"★".repeat(roundedRating)}
        <span style={{ color: "#cbd5d1" }}>
          {"★".repeat(5 - roundedRating)}
        </span>
      </span>
    );
  };

  return (
    <section className="product-details-page">
      <Link
        to="/products"
        className="product-back-link"
      >
        ← Back to Products
      </Link>

      <div className="product-details-card">
        {/* PRODUCT IMAGE AND GALLERY */}
        <div>
          <div className="product-details-image-wrap">
            <img
              className="product-details-image"
              src={selectedImage}
              alt={`${product.title}${
                images.length > 1
                  ? ` - photo ${selectedImageIndex + 1}`
                  : ""
              }`}
            />

            <span
              className={`product-availability ${
                available ? "available" : "unavailable"
              }`}
            >
              {available ? "Available" : "Unavailable"}
            </span>
          </div>

          {images.length > 1 && (
            <div
              aria-label="Product image gallery"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "14px",
              }}
            >
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`View product photo ${
                    index + 1
                  } of ${images.length}`}
                  aria-pressed={selectedImageIndex === index}
                  style={{
                    width: "76px",
                    height: "76px",
                    padding: "4px",
                    background: "#fff",
                    border:
                      selectedImageIndex === index
                        ? "2px solid #079669"
                        : "1px solid #dbe5df",
                    borderRadius: "10px",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={image}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="product-details-content">
          <div className="product-details-top">
            <span className="product-condition">
              {product.condition || "Pre-owned"}
            </span>

            <span className="product-category-label">
              {product.category}
            </span>
          </div>

          <h1>{product.title}</h1>

          <div className="product-details-price">
            $
            {Number(product.price || 0).toLocaleString()}
          </div>

          <p className="product-details-description">
            {product.description ||
              "No product description available."}
          </p>

          <div className="product-information-box">
            <h3>Product Information</h3>

            <div className="product-info-row">
              <span>Category</span>
              <strong>{product.category || "N/A"}</strong>
            </div>

            <div className="product-info-row">
              <span>Condition</span>
              <strong>{product.condition || "N/A"}</strong>
            </div>

            <div className="product-info-row">
              <span>Seller</span>
              <strong>
                {product.sellerInfo?.name || "ReSell Seller"}
              </strong>
            </div>

            <div className="product-info-row">
              <span>Location</span>
              <strong>{location}</strong>
            </div>

            <div className="product-info-row">
              <span>Stock</span>
              <strong
                className={
                  available
                    ? "product-status-green"
                    : "product-status-red"
                }
              >
                {product.stock == null
                  ? "Not specified"
                  : `${Number(product.stock) || 0} ${
                      Number(product.stock) === 1
                        ? "unit"
                        : "units"
                    }`}
              </strong>
            </div>

            <div className="product-info-row">
              <span>Status</span>
              <strong
                className={
                  available
                    ? "product-status-green"
                    : "product-status-red"
                }
              >
                {available ? "Available" : "Unavailable"}
              </strong>
            </div>
          </div>

          {message && (
            <div className="product-action-message">
              {message}
            </div>
          )}

          <div className="product-details-actions">
            <button
              type="button"
              className={`product-wishlist-btn ${
                inWishlist ? "active" : ""
              }`}
              onClick={handleWishlist}
              disabled={wishlistLoading}
            >
              {wishlistLoading
                ? "Please wait..."
                : inWishlist
                  ? "♥ Added to Wishlist"
                  : "♡ Add to Wishlist"}
            </button>

            <button
              type="button"
              className="product-buy-btn"
              onClick={handleBuyNow}
              disabled={!available}
            >
              {available ? "Buy Now →" : "Unavailable"}
            </button>
          </div>

          {user?.role === "buyer" && (
            <Link
              to="/dashboard/wishlist"
              className="view-wishlist-link"
            >
              View My Wishlist
            </Link>
          )}
        </div>
      </div>

      {/* CUSTOMER REVIEWS SECTION */}
      <div
        className="product-reviews-section"
        style={{
          marginTop: "42px",
          padding: "28px",
          background: "#fff",
          border: "1px solid #e0e9e4",
          borderRadius: "18px",
        }}
      >
        <div style={{ marginBottom: "22px" }}>
          <span
            style={{
              color: "#078e68",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.5px",
            }}
          >
            CUSTOMER FEEDBACK
          </span>

          <h2
            style={{
              fontSize: "26px",
              margin: "8px 0 10px",
              color: "#102a2b",
            }}
          >
            Customer Reviews & Ratings
          </h2>

          {!reviewsLoading &&
            !reviewsError &&
            reviewData.totalReviews > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <strong style={{ fontSize: "28px" }}>
                  {reviewData.averageRating.toFixed(1)}
                </strong>

                {renderStars(reviewData.averageRating)}

                <span style={{ color: "#64748b" }}>
                  Based on {reviewData.totalReviews}{" "}
                  {reviewData.totalReviews === 1
                    ? "review"
                    : "reviews"}
                </span>
              </div>
            )}
        </div>

        {reviewsLoading ? (
          <p style={{ color: "#64748b" }}>
            Loading customer reviews…
          </p>
        ) : reviewsError ? (
          <p style={{ color: "#b91c1c" }}>
            {reviewsError}
          </p>
        ) : reviewData.reviews.length === 0 ? (
          <div
            style={{
              padding: "32px 18px",
              textAlign: "center",
              background: "#f8fbf9",
              border: "1px dashed #dbe7df",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>
              ☆
            </div>

            <h3 style={{ margin: "0 0 8px" }}>
              No reviews yet
            </h3>

            <p style={{ color: "#64748b", margin: 0 }}>
              This product has not received any customer
              reviews yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {reviewData.reviews.map((review) => (
              <article
                key={review._id}
                style={{
                  padding: "20px",
                  border: "1px solid #e2e8e5",
                  borderRadius: "12px",
                  background: "#fbfdfc",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <strong>
                    {review.reviewerName || "Marketplace Buyer"}
                  </strong>

                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    {formatReviewDate(review.createdAt)}
                  </span>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  {renderStars(review.rating)}
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    {review.rating}/5
                  </span>
                </div>

                {review.comment && (
                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.7,
                      color: "#475569",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {review.comment}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
