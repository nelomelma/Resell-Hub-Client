
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login, googleLogin } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState({
    email: "",
    password: "",
  });

  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Demo accounts created by seed.js
  const demoAccounts = [
    {
      role: "Admin",
      email: "admin@resellhub.com",
      password: "123456",
      className: "admin",
    },
    {
      role: "Seller",
      email: "seller@resellhub.com",
      password: "123456",
      className: "seller",
    },
    {
      role: "Buyer",
      email: "buyer@resellhub.com",
      password: "123456",
      className: "buyer",
    },
  ];

  const selectDemoAccount = (account) => {
    setF({
      email: account.email,
      password: account.password,
    });

    setErr("");
  };

  // Email and Password Login
  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await login(f.email, f.password);
      nav("/dashboard");
    } catch (error) {
      setErr(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  // Google Login
  const handleGoogleSuccess = async (credentialResponse) => {
    setErr("");

    if (!credentialResponse.credential) {
      setErr("Google credential was not received.");
      return;
    }

    try {
      await googleLogin(credentialResponse.credential);
      nav("/dashboard");
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          "Google login failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <form
        className="auth-card login-card"
        onSubmit={submit}
      >
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">R</div>

          <div>
            <h2>
              ReSell<span>Hub</span>
            </h2>
          </div>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1>Welcome back</h1>
          <p>Sign in to your ReSell Hub account</p>
        </div>

        {/* Demo Login */}
        <div className="demo-login">
          <p className="demo-title">Quick Demo Login</p>

          <div className="demo-options">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                className={`demo-account ${account.className}`}
                onClick={() => selectDemoAccount(account)}
              >
                <span
                  className={`role-badge ${account.className}`}
                >
                  {account.role}
                </span>

                <span className="demo-email">
                  {account.email}
                </span>
              </button>
            ))}
          </div>

          <p className="demo-hint">
            Select a role to fill in the demo credentials.
          </p>
        </div>

        {/* Email */}
        <div className="auth-field">
          <label htmlFor="login-email">Email</label>

          <input
            id="login-email"
            required
            type="email"
            placeholder="you@example.com"
            value={f.email}
            onChange={(e) =>
              setF({
                ...f,
                email: e.target.value,
              })
            }
          />
        </div>

        {/* Password */}
        <div className="auth-field">
          <label htmlFor="login-password">
            Password
          </label>

          <div className="password-wrapper">
            <input
              id="login-password"
              required
              minLength="6"
              type={
                showPassword ? "text" : "password"
              }
              placeholder="Enter your password"
              value={f.password}
              onChange={(e) =>
                setF({
                  ...f,
                  password: e.target.value,
                })
              }
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Error */}
        {err && <p className="error">{err}</p>}

        {/* Sign In */}
        <button
          className="btn auth-submit"
          type="submit"
        >
          Sign In
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Google Sign In */}
        <div
          className="google-login-wrapper"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "12px",
            marginBottom: "12px",
          }}
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              setErr("Google sign-in failed.")
            }
            text="continue_with"
            theme="outline"
            size="large"
            width="300"
          />
        </div>

        {/* Register */}
        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}

export function Register() {
  const { register, googleLogin } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email and Password Registration
  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await register(f);
      nav("/dashboard");
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  // Google Registration / Login
  const handleGoogleSuccess = async (credentialResponse) => {
    setErr("");

    if (!credentialResponse.credential) {
      setErr("Google credential was not received.");
      return;
    }

    try {
      await googleLogin(credentialResponse.credential);
      nav("/dashboard");
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          "Google registration failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={submit}
      >
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">R</div>

          <h2>
            ReSell<span>Hub</span>
          </h2>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1>Create your account</h1>

          <p>
            Join the second-hand marketplace
          </p>
        </div>

        {/* Full Name */}
        <div className="auth-field">
          <label htmlFor="register-name">
            Full Name
          </label>

          <input
            id="register-name"
            required
            placeholder="Enter your full name"
            value={f.name}
            onChange={(e) =>
              setF({
                ...f,
                name: e.target.value,
              })
            }
          />
        </div>

        {/* Email */}
        <div className="auth-field">
          <label htmlFor="register-email">
            Email
          </label>

          <input
            id="register-email"
            required
            type="email"
            placeholder="you@example.com"
            value={f.email}
            onChange={(e) =>
              setF({
                ...f,
                email: e.target.value,
              })
            }
          />
        </div>

        {/* Password */}
        <div className="auth-field">
          <label htmlFor="register-password">
            Password
          </label>

          <div className="password-wrapper">
            <input
              id="register-password"
              required
              minLength="6"
              type={
                showPassword ? "text" : "password"
              }
              placeholder="Minimum 6 characters"
              value={f.password}
              onChange={(e) =>
                setF({
                  ...f,
                  password: e.target.value,
                })
              }
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Account Type */}
        <div className="auth-field">
          <label htmlFor="register-role">
            Account Type
          </label>

          <select
            id="register-role"
            value={f.role}
            onChange={(e) =>
              setF({
                ...f,
                role: e.target.value,
              })
            }
          >
            <option value="buyer">
              Buyer
            </option>

            <option value="seller">
              Seller
            </option>
          </select>
        </div>

        {/* Error */}
        {err && <p className="error">{err}</p>}

        {/* Create Account */}
        <button
          className="btn auth-submit"
          type="submit"
        >
          Create Account
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Google Registration */}
        <div
          className="google-login-wrapper"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "12px",
            marginBottom: "12px",
          }}
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              setErr("Google sign-in failed.")
            }
            text="continue_with"
            theme="outline"
            size="large"
            width="300"
          />
        </div>

        {/* Login Link */}
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
