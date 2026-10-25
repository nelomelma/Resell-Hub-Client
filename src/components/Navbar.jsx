import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(false);

  const location = useLocation();
  const profileRef = useRef(null);

  const links = [
    ["Home", "/"],
    ["Products", "/products"],
    ["Categories", "/categories"],
    ["Dashboard", "/dashboard"],
  ];

  /* Close mobile menu whenever route changes */
  useEffect(() => {
    setOpen(false);
    setProfile(false);
  }, [location.pathname]);

  /* Close profile dropdown when clicking outside */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfile(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* Reset mobile menu when returning to desktop */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 760) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  const closeMenu = () => {
    setOpen(false);
    setProfile(false);
  };

  const handleLogout = () => {
    setProfile(false);
    setOpen(false);
    logout();
  };

  return (
    <header className="nav">
      <div className="nav-inner">

        {/* BRAND */}
        <Link
          className="brand"
          to="/"
          onClick={closeMenu}
        >
          <span className="logo">
            R
          </span>

          <span>
            ReSell <b>Hub</b>
          </span>
        </Link>

        {/* DESKTOP + MOBILE NAVIGATION */}
        <nav
          className={`navlinks ${
            open ? "open" : ""
          }`}
          aria-label="Main navigation"
        >
          {links.map(([name, path]) => (
            <NavLink
              key={name}
              to={path}
              onClick={closeMenu}
              end={path === "/"}
            >
              {name}
            </NavLink>
          ))}
        </nav>

        {/* AUTH AREA */}
        <div className="autharea">
          {!user ? (
            <>
              <Link
                className="btn ghost"
                to="/login"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                className="btn"
                to="/register"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          ) : (
            <div
              className="profile"
              ref={profileRef}
            >
              <button
                type="button"
                className="profile-btn"
                onClick={() =>
                  setProfile((prev) => !prev)
                }
                aria-expanded={profile}
              >
                <span className="avatar">
                  <User size={18} />
                </span>

                <span className="profile-name">
                  {user.name}
                </span>

                <ChevronDown
                  size={16}
                  className={
                    profile
                      ? "profile-chevron open"
                      : "profile-chevron"
                  }
                />
              </button>

              {profile && (
                <div className="dropdown">
                  <Link
                    to="/dashboard/profile"
                    onClick={closeMenu}
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/dashboard/orders"
                    onClick={closeMenu}
                  >
                    Orders
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          type="button"
          className="menu"
          onClick={() =>
            setOpen((prev) => !prev)
          }
          aria-label={
            open
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={open}
        >
          {open ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>
    </header>
  );
}