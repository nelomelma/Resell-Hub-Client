
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../context/AuthContext";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

/* =========================================================
   STRIPE PAYMENT FORM
   ========================================================= */

function StripePaymentForm({
  amount,
  deliveryInfo,
  paymentIntentId,
  setPaymentInProgress,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { API } = useAuth();

  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const token = localStorage.getItem("token");

  const handlePayment = async () => {
    if (!stripe || !elements || paying) return;

    setPaymentError("");

    const {
      name,
      email,
      phone,
      address,
      city,
      country,
    } = deliveryInfo;

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !country.trim()
    ) {
      setPaymentError(
        "Please complete all delivery information."
      );
      return;
    }

    const normalizedPhone = phone.replace(/[\s()-]/g, "");

    if (!/^(?:\+8801|01)[3-9]\d{8}$/.test(normalizedPhone)) {
      setPaymentError(
        "Please enter a valid Bangladeshi mobile number, such as 01712345678 or +8801712345678."
      );
      return;
    }

    if (
      country.trim().toLowerCase() !== "bangladesh"
    ) {
      setPaymentError(
        "Delivery is currently available within Bangladesh only."
      );
      return;
    }

    try {
      setPaying(true);
      setPaymentInProgress(true);

      const { error, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

      if (error) {
        setPaymentError(
          error.message || "Payment failed."
        );
        return;
      }

      if (
        !paymentIntent ||
        paymentIntent.status !== "succeeded"
      ) {
        setPaymentError(
          "Payment has not completed successfully."
        );
        return;
      }

      const { data } = await axios.post(
        `${API}/payments/complete`,
        {
          paymentIntentId:
            paymentIntent.id || paymentIntentId,
          deliveryInfo: {
            ...deliveryInfo,
            phone: normalizedPhone,
            country: "Bangladesh",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(
        `/payment-success/${data.order._id}`,
        {
          replace: true,
          state: {
            order: data.order,
            payment: data.payment,
          },
        }
      );
    } catch (err) {
      console.error("Payment error:", err);

      setPaymentError(
        err.response?.data?.message ||
          err.message ||
          "Payment could not be completed."
      );
    } finally {
      setPaying(false);
      setPaymentInProgress(false);
    }
  };

  return (
    <div className="checkout-payment-card">
      <div className="checkout-card-heading">
        <div>
          <span className="checkout-section-number">
            2
          </span>
          <h2>Payment Details</h2>
        </div>

        <span className="checkout-secure">
          🔒 Secure Stripe Payment
        </span>
      </div>

      <p className="checkout-payment-note">
        Your card information is securely handled by
        Stripe. ReSell Hub does not store your card
        details. Payments are processed in USD ($).
      </p>

      <div className="stripe-element-box">
        <PaymentElement />
      </div>

      {paymentError && (
        <div className="checkout-error" role="alert">
          {paymentError}
        </div>
      )}

      <div className="stripe-security-note">
        🔒 Secure checkout powered by Stripe
      </div>

      <button
        type="button"
        className="checkout-pay-mobile"
        onClick={handlePayment}
        disabled={!stripe || !elements || paying}
      >
        {paying
          ? "Processing Payment..."
          : `Pay $${Number(amount).toFixed(2)} USD`}
      </button>

      <button
        id="stripe-payment-submit"
        type="button"
        onClick={handlePayment}
        disabled={!stripe || !elements || paying}
        style={{ display: "none" }}
      />
    </div>
  );
}

/* =========================================================
   CHECKOUT CONTENT
   ========================================================= */

function CheckoutContent({
  product,
  quantity,
  setQuantity,
  amount,
  paymentIntentId,
  setPaymentInProgress,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    country: "Bangladesh",
  });

  const changeDelivery = (event) => {
    const { name, value } = event.target;

    setDeliveryInfo((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const triggerPayment = () => {
    document
      .getElementById("stripe-payment-submit")
      ?.click();
  };

  const image =
    product.images?.[0] ||
    `https://picsum.photos/seed/${product._id}/500/400`;

  const stock = Number(product.stock);
  const maximumQuantity =
    Number.isFinite(stock) && stock > 0
      ? stock
      : 1;

  return (
    <div className="checkout-page">
      <button
        type="button"
        className="checkout-back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="checkout-heading">
        <span className="eyebrow">
          SECURE CHECKOUT
        </span>

        <h1>Checkout</h1>

        <p>
          Review your order and complete your
          purchase securely.
        </p>
      </div>

      <div className="checkout-layout">
        {/* LEFT SIDE */}
        <div className="checkout-left">
          <div className="checkout-delivery-card">
            <div className="checkout-card-heading">
              <div>
                <span className="checkout-section-number">
                  1
                </span>
                <h2>Delivery Information</h2>
              </div>
            </div>

            <div className="checkout-form-grid">
              <label>
                <span>Full Name</span>
                <input
                  name="name"
                  value={deliveryInfo.name}
                  onChange={changeDelivery}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </label>

              <label>
                <span>Phone Number</span>
                <input
                  name="phone"
                  type="tel"
                  value={deliveryInfo.phone}
                  onChange={changeDelivery}
                  placeholder="+880 1712 345678"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>

              <label className="checkout-full">
                <span>Email Address</span>
                <input
                  name="email"
                  type="email"
                  value={deliveryInfo.email}
                  onChange={changeDelivery}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>

              <label className="checkout-full">
                <span>Delivery Address</span>
                <input
                  name="address"
                  value={deliveryInfo.address}
                  onChange={changeDelivery}
                  placeholder="House number, road, area, district"
                  autoComplete="street-address"
                />
              </label>

              <label>
                <span>City</span>
                <input
                  name="city"
                  value={deliveryInfo.city}
                  onChange={changeDelivery}
                  placeholder="Dhaka"
                  autoComplete="address-level2"
                />
              </label>

              <label>
                <span>Country</span>
                <input
                  name="country"
                  value={deliveryInfo.country}
                  readOnly
                  autoComplete="country-name"
                />
              </label>
            </div>
          </div>

          <StripePaymentForm
            amount={amount}
            deliveryInfo={deliveryInfo}
            paymentIntentId={paymentIntentId}
            setPaymentInProgress={setPaymentInProgress}
          />
        </div>

        {/* RIGHT SIDE */}
        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-product">
            <img src={image} alt={product.title} />

            <div>
              <strong>{product.title}</strong>
              <span>
                {product.condition || "Pre-owned"}
              </span>
              <small>{product.category}</small>
            </div>
          </div>

          <div className="checkout-quantity">
            <span>Quantity</span>

            <div>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.max(1, q - 1))
                }
                disabled={quantity <= 1}
              >
                −
              </button>

              <strong>{quantity}</strong>

              <button
                type="button"
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(maximumQuantity, q + 1)
                  )
                }
                disabled={quantity >= maximumQuantity}
              >
                +
              </button>
            </div>
          </div>

          <div className="checkout-summary-lines">
            <div>
              <span>Product Price</span>
              <strong>
                ${Number(product.price).toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Quantity</span>
              <strong>× {quantity}</strong>
            </div>

            <div>
              <span>Shipping</span>
              <strong className="checkout-free">
                Free
              </strong>
            </div>
          </div>

          <div className="checkout-total">
            <span>Total Amount (USD)</span>
            <strong>
              ${Number(amount).toFixed(2)}
            </strong>
          </div>

          <button
            type="button"
            className="checkout-main-pay"
            onClick={triggerPayment}
          >
            🔒 Proceed to Payment
          </button>

          <Link
            to={`/products/${product._id}`}
            className="checkout-cancel"
          >
            Cancel Checkout
          </Link>

          <div className="checkout-trust">
            <span>✓ Secure Payment</span>
            <span>✓ Buyer Protection</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* =========================================================
   CHECKOUT PAGE
   ========================================================= */

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API, user, loading: authLoading } =
    useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentInProgress, setPaymentInProgress] =
    useState(false);

  const token = localStorage.getItem("token");

  const amount = useMemo(() => {
    if (!product) return 0;

    return (
      Number(product.price || 0) *
      Number(quantity || 1)
    );
  }, [product, quantity]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "buyer") {
      navigate("/products", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setQuantity(1);

        const { data } = await axios.get(
          `${API}/products/${id}`
        );

        if (active) setProduct(data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Could not load this product."
          );
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [API, id]);

  useEffect(() => {
    if (
      !product ||
      !user ||
      user.role !== "buyer" ||
      !token ||
      paymentInProgress
    ) {
      return;
    }

    let cancelled = false;

    async function createIntent() {
      try {
        setLoading(true);
        setError("");
        setClientSecret("");
        setPaymentIntentId("");

        const { data } = await axios.post(
          `${API}/payments/create-intent`,
          {
            productId: product._id,
            quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Could not initialize Stripe payment."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    createIntent();

    return () => {
      cancelled = true;
    };
  }, [
    API,
    product,
    quantity,
    token,
    user,
    paymentInProgress,
  ]);

  if (authLoading) {
    return (
      <div className="loader">
        Checking account…
      </div>
    );
  }

  if (!product) {
    if (error) {
      return (
        <section className="checkout-error-page">
          <h2>Checkout unavailable</h2>
          <p>{error}</p>
          <Link to="/products" className="btn">
            Back to Products
          </Link>
        </section>
      );
    }

    return (
      <div className="loader">
        Loading checkout…
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <section className="checkout-error-page">
        <h2>Checkout unavailable</h2>
        <p>{error}</p>
        <Link
          to={`/products/${product._id}`}
          className="btn"
        >
          Return to Product
        </Link>
      </section>
    );
  }

  if (loading || !clientSecret) {
    return (
      <div className="loader">
        Preparing secure checkout…
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#0d8b62",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements
      stripe={stripePromise}
      options={options}
      key={clientSecret}
    >
      <CheckoutContent
        product={product}
        quantity={quantity}
        setQuantity={setQuantity}
        amount={amount}
        paymentIntentId={paymentIntentId}
        setPaymentInProgress={setPaymentInProgress}
      />
    </Elements>
  );
}
