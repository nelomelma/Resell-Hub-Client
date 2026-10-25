
import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./routes/PrivateRoute";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Categories = lazy(() => import("./pages/Categories"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

const Login = lazy(() =>
  import("./pages/AuthPages").then((module) => ({
    default: module.Login,
  }))
);

const Register = lazy(() =>
  import("./pages/AuthPages").then((module) => ({
    default: module.Register,
  }))
);

const About = lazy(() =>
  import("./pages/SimplePages").then((module) => ({
    default: module.About,
  }))
);

const Contact = lazy(() =>
  import("./pages/SimplePages").then((module) => ({
    default: module.Contact,
  }))
);

const NotFound = lazy(() =>
  import("./pages/SimplePages").then((module) => ({
    default: module.NotFound,
  }))
);

// Dashboard
const Dashboard = lazy(() => import("./dashboard/Dashboard"));

const Overview = lazy(() =>
  import("./dashboard/DashboardPages").then((module) => ({
    default: module.Overview,
  }))
);

const AddProduct = lazy(() =>
  import("./dashboard/DashboardPages").then((module) => ({
    default: module.AddProduct,
  }))
);

const GenericList = lazy(() =>
  import("./dashboard/DashboardPages").then((module) => ({
    default: module.GenericList,
  }))
);

const Analytics = lazy(() =>
  import("./dashboard/DashboardPages").then((module) => ({
    default: module.Analytics,
  }))
);

const Profile = lazy(() =>
  import("./dashboard/DashboardPages").then((module) => ({
    default: module.Profile,
  }))
);

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

const PageLoader = () => (
  <div
    role="status"
    aria-live="polite"
    style={{
      padding: "48px 20px",
      textAlign: "center",
    }}
  >
    Loading page...
  </div>
);

const Layout = () => (
  <>
    <Navbar />
    <main className="container">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/checkout/:id"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />

            <Route
              path="/payment-success/:orderId"
              element={
                <PrivateRoute>
                  <PaymentSuccess />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route
                path="my-products"
                element={<GenericList type="products" />}
              />
              <Route
                path="orders"
                element={<GenericList type="orders" />}
              />
              <Route
                path="wishlist"
                element={<GenericList type="wishlist" />}
              />
              <Route
                path="payments"
                element={<GenericList type="payments" />}
              />
              <Route
                path="users"
                element={<GenericList type="users" />}
              />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </GoogleOAuthProvider>
  );
}
