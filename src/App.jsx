
import {
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";

import {
  Login,
  Register,
} from "./pages/AuthPages";

import {
  About,
  Contact,
  NotFound,
} from "./pages/SimplePages";

import PrivateRoute from "./routes/PrivateRoute";

import Dashboard from "./dashboard/Dashboard";

import {
  Overview,
  AddProduct,
  GenericList,
  Analytics,
  Profile,
} from "./dashboard/DashboardPages";

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/categories"
            element={<Categories />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Protected Buyer Checkout */}
          <Route
            path="/checkout/:id"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />

          {/* Protected Payment Success */}
          <Route
            path="/payment-success/:orderId"
            element={
              <PrivateRoute>
                <PaymentSuccess />
              </PrivateRoute>
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route
              index
              element={<Overview />}
            />

            <Route
              path="add-product"
              element={<AddProduct />}
            />

            <Route
              path="my-products"
              element={
                <GenericList type="products" />
              }
            />

            <Route
              path="orders"
              element={
                <GenericList type="orders" />
              }
            />
            
            <Route
              path="wishlist"
              element={
                <GenericList type="wishlist" />
              }
            />

            <Route
              path="payments"
              element={
                <GenericList type="payments" />
              }
            />

            <Route
              path="users"
              element={
                <GenericList type="users" />
              }
            />

            <Route
              path="analytics"
              element={<Analytics />}
            />

            <Route
              path="profile"
              element={<Profile />}
            />
          </Route>

          <Route
            path="*"
            element={<NotFound />}
          />
        </Route>
      </Routes>
    </GoogleOAuthProvider>
  );
}
