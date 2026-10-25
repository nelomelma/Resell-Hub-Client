import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const sellerLinks = [
    ["▦", "Overview", "/dashboard"],
    ["＋", "Add Product", "/dashboard/add-product"],
    ["▣", "My Products", "/dashboard/my-products"],
    ["▤", "Manage Orders", "/dashboard/orders"],
    ["▥", "Sales Analytics", "/dashboard/analytics"],
    ["○", "Profile", "/dashboard/profile"],
  ];

  const adminLinks = [
    ["▦", "Overview", "/dashboard"],
    ["♙", "Manage Users", "/dashboard/users"],
    ["▣", "Manage Products", "/dashboard/my-products"],
    ["▤", "Manage Orders", "/dashboard/orders"],
    ["▥", "Platform Analytics", "/dashboard/analytics"],
    ["○", "Profile", "/dashboard/profile"],
  ];

  const buyerLinks = [
    ["▦", "Overview", "/dashboard"],
    ["▣", "My Orders", "/dashboard/orders"],
    ["♡", "Wishlist", "/dashboard/wishlist"],
    ["▭", "Payments", "/dashboard/payments"],
    ["○", "Profile", "/dashboard/profile"],
  ];

  const links =
    user?.role === "seller"
      ? sellerLinks
      : user?.role === "admin"
      ? adminLinks
      : buyerLinks;

  const initial =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  const roleName =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "seller"
      ? "Seller"
      : "Buyer";

  return (
    <div className="dashboard-shell">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">R</div>

          <div className="dashboard-brand-name">
            ReSell<span>Hub</span>
          </div>
        </div>

        <div className="dashboard-user">
          <div className="dashboard-avatar">
            {initial}
          </div>

          <div className="dashboard-user-info">
            <strong>{user?.name || "User"}</strong>

            <span>
              {user?.role
                ? user.role.charAt(0).toUpperCase() +
                  user.role.slice(1)
                : "Buyer"}
            </span>
          </div>
        </div>

        <nav className="dashboard-menu">
          {links.map(([icon, name, path]) => (
            <NavLink
              key={name}
              end={path === "/dashboard"}
              to={path}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <span className="dashboard-menu-icon">
                {icon}
              </span>

              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <span>ReSell Hub</span>
          <small>Second-hand. First choice.</small>
        </div>
      </aside>

      {/* DASHBOARD CONTENT */}
      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-title">
            <strong>Dashboard</strong>
            <span>{roleName} Account</span>
          </div>

          <div className="dashboard-topbar-user">
            <div className="dashboard-topbar-avatar">
              {initial}
            </div>

            <div>
              <strong>
                {user?.name || "ReSell Hub User"}
              </strong>

              <span>{roleName}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <Outlet />
        </main>
      </section>
    </div>
  );
}