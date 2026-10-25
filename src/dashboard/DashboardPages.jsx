import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* =========================================================
   COMMON HELPERS
   ========================================================= */

const formatCurrency = (amount) => {
  return `$${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "N/A";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "N/A";
  }

  return value.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const capitalize = (value = "") => {
  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).toLowerCase()
  );
};

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "U";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getToken = () => {
  return localStorage.getItem("token") || "";
};

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

const normalizeModerationStatus = (product) => {
  return (
    product?.moderationStatus || "approved"
  ).toLowerCase();
};

const normalizeOrderStatus = (order) => {
  return (
    order?.orderStatus ||
    order?.status ||
    "pending"
  ).toLowerCase();
};

const getOrderAmount = (order) => {
  if (Number.isFinite(Number(order?.totalAmount))) {
    return Number(order.totalAmount);
  }

  if (Number.isFinite(Number(order?.total))) {
    return Number(order.total);
  }

  if (Number.isFinite(Number(order?.amount))) {
    return Number(order.amount);
  }

  if (Number.isFinite(Number(order?.price))) {
    return (
      Number(order.price) *
      Number(order.quantity || 1)
    );
  }

  return 0;
};

const getOrderProductName = (order) => {
  return (
    order?.productInfo?.title ||
    order?.productTitle ||
    order?.product?.title ||
    order?.title ||
    "Marketplace Order"
  );
};

const getOrderId = (order) => {
  if (order?.orderId) {
    return order.orderId;
  }

  if (order?._id) {
    return `RH${String(order._id)
      .slice(-6)
      .toUpperCase()}`;
  }

  return "N/A";
};

/* =========================================================
   REUSABLE UI
   ========================================================= */

function DashboardLoader({ text = "Loading data..." }) {
  return (
    <div className="dashboard-state-card">
      <div className="loader">{text}</div>
    </div>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <div className="dashboard-state-card">
      <h3>Unable to load data</h3>

      <p>{message}</p>

      {onRetry && (
        <button
          type="button"
          className="btn"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

function EmptyState({
  title = "No data found",
  text = "There is nothing to display yet.",
}) {
  return (
    <div className="dashboard-empty">
      <div className="dashboard-empty-icon">
        ◇
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(
    status || "unknown"
  ).toLowerCase();

  return (
    <span
      className={`status-badge status-${normalized}`}
    >
      {capitalize(normalized)}
    </span>
  );
}

function RoleBadge({ role }) {
  const normalized = String(
    role || "buyer"
  ).toLowerCase();

  return (
    <span
      className={`role-badge role-${normalized}`}
    >
      {capitalize(normalized)}
    </span>
  );
}

function DashboardPageHeader({
  eyebrow,
  title,
  description,
  right,
}) {
  return (
    <div className="dashboard-page-header">
      <div>
        {eyebrow && (
          <span className="dashboard-eyebrow">
            {eyebrow}
          </span>
        )}

        <h1>{title}</h1>

        {description && <p>{description}</p>}
      </div>

      {right && (
        <div className="dashboard-header-actions">
          {right}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
}) {
  return (
    <article className="dashboard-stat-card">
      <div className="dashboard-stat-icon">
        {icon}
      </div>

      <div className="dashboard-stat-content">
        <span>{label}</span>

        <strong>{value}</strong>

        {note && <small>{note}</small>}
      </div>
    </article>
  );
}

/* =========================================================
   ADMIN OVERVIEW
   ========================================================= */

function AdminOverview() {
  const { API } = useAuth();

  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API}/admin/analytics`,
        authConfig()
      );

      setAnalytics(data);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Could not load admin overview."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [API]);

  if (loading) {
    return (
      <DashboardLoader text="Loading admin overview..." />
    );
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={loadAnalytics}
      />
    );
  }

  const summary = analytics?.summary || {};

  const revenueData =
    analytics?.revenueOverview || [];

  const userGrowth =
    analytics?.userGrowth || [];

  const categories =
    analytics?.categoryPerformance || [];

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="ADMIN DASHBOARD"
        title="Overview"
        description="Live marketplace statistics calculated from your website data."
      />

      <div className="dashboard-stat-grid admin-stat-grid">
        <MetricCard
          icon="👥"
          label="Total Users"
          value={summary.totalUsers || 0}
          note={`${summary.activeUsers || 0} active users`}
        />

        <MetricCard
          icon="📦"
          label="Total Products"
          value={summary.totalProducts || 0}
          note={`${summary.pendingProducts || 0} pending approval`}
        />

        <MetricCard
          icon="🧾"
          label="Total Orders"
          value={summary.totalOrders || 0}
          note={`${summary.deliveredOrders || 0} delivered`}
        />

        <MetricCard
          icon="$"
          label="Total Revenue"
          value={formatCurrency(
            summary.totalRevenue
          )}
          note="From delivered paid orders"
        />
      </div>

      <div className="admin-overview-grid">
        <article className="dashboard-panel admin-chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue Overview</h2>
              <p>
                Revenue from delivered and paid
                orders
              </p>
            </div>
          </div>

          {revenueData.length ? (
            <div className="dashboard-chart">
              <ResponsiveContainer
                width="100%"
                height={290}
              >
                <BarChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No revenue yet"
              text="Revenue will appear after paid orders are delivered."
            />
          )}
        </article>

        <article className="dashboard-panel admin-chart-panel">
          <div className="panel-heading">
            <div>
              <h2>User Growth</h2>
              <p>
                Registered users over the last
                six months
              </p>
            </div>
          </div>

          {userGrowth.length ? (
            <div className="dashboard-chart">
              <ResponsiveContainer
                width="100%"
                height={290}
              >
                <LineChart data={userGrowth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="month" />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="users"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No user growth data"
              text="New registrations will appear here."
            />
          )}
        </article>
      </div>

      <article className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Category Performance</h2>

            <p>
              Product distribution across the
              marketplace
            </p>
          </div>
        </div>

        {categories.length ? (
          <div className="category-performance-grid">
            {categories.map((item) => {
              const percentage =
                summary.totalProducts > 0
                  ? Math.round(
                      (item.count /
                        summary.totalProducts) *
                        100
                    )
                  : 0;

              return (
                <div
                  className="category-performance-item"
                  key={item.category}
                >
                  <div className="category-performance-top">
                    <strong>
                      {item.category}
                    </strong>

                    <span>
                      {item.count} product
                      {item.count !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div className="category-progress">
                    <div
                      className="category-progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <small>
                    {percentage}% of all products
                  </small>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No categories yet"
            text="Category performance will appear when products are added."
          />
        )}
      </article>
    </section>
  );
}

/* =========================================================
   ADMIN USERS
   ========================================================= */

function AdminUsers() {
  const { API, user: currentUser } =
    useAuth();

  const [users, setUsers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [workingId, setWorkingId] =
    useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API}/admin/users`,
        authConfig()
      );

      setUsers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Could not load users."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [API]);

  const filteredUsers = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name
          ?.toLowerCase()
          .includes(term) ||
        user.email
          ?.toLowerCase()
          .includes(term) ||
        user.location
          ?.toLowerCase()
          .includes(term);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const status =
        user.status || "active";

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const changeUserStatus = async (
    targetUser
  ) => {
    const currentStatus =
      targetUser.status || "active";

    const nextStatus =
      currentStatus === "blocked"
        ? "active"
        : "blocked";

    const action =
      nextStatus === "blocked"
        ? "block"
        : "unblock";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${targetUser.name}?`
    );

    if (!confirmed) return;

    try {
      setWorkingId(targetUser._id);
      setError("");

      await axios.patch(
        `${API}/admin/users/${targetUser._id}/status`,
        {
          status: nextStatus,
        },
        authConfig()
      );

      setUsers((current) =>
        current.map((user) =>
          user._id === targetUser._id
            ? {
                ...user,
                status: nextStatus,
              }
            : user
        )
      );
    } catch (error) {
      alert(
        getErrorMessage(
          error,
          `Could not ${action} this user.`
        )
      );
    } finally {
      setWorkingId("");
    }
  };

  if (loading) {
    return (
      <DashboardLoader text="Loading users..." />
    );
  }

  if (error && !users.length) {
    return (
      <DashboardError
        message={error}
        onRetry={loadUsers}
      />
    );
  }

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="ADMIN"
        title="Users"
        description="Search users, review account roles and manage account access."
        right={
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadUsers}
          >
            Refresh
          </button>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search by name, email or location..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
        >
          <option value="all">
            All Roles
          </option>

          <option value="admin">
            Admin
          </option>

          <option value="seller">
            Seller
          </option>

          <option value="buyer">
            Buyer
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="blocked">
            Blocked
          </option>
        </select>
      </div>

      <div className="dashboard-panel admin-table-panel">
        <div className="admin-table-summary">
          <strong>
            {filteredUsers.length}
          </strong>

          <span>
            user
            {filteredUsers.length !== 1
              ? "s"
              : ""}{" "}
            found
          </span>
        </div>

        {filteredUsers.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (account) => {
                    const status =
                      account.status ||
                      "active";

                    const isCurrentAdmin =
                      account._id ===
                      currentUser?._id;

                    return (
                      <tr key={account._id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">
                              {getInitials(
                                account.name
                              )}
                            </div>

                            <div>
                              <strong>
                                {account.name ||
                                  "Unnamed User"}
                              </strong>

                              <span>
                                {account.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <RoleBadge
                            role={
                              account.role
                            }
                          />
                        </td>

                        <td>
                          <StatusBadge
                            status={status}
                          />
                        </td>

                        <td>
                          {account.location ||
                            "Not provided"}
                        </td>

                        <td>
                          {formatDate(
                            account.createdAt
                          )}
                        </td>

                        <td>
                          {isCurrentAdmin ? (
                            <span className="admin-self-label">
                              Current Admin
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={
                                status ===
                                "blocked"
                                  ? "btn-small approve"
                                  : "btn-small danger"
                              }
                              disabled={
                                workingId ===
                                account._id
                              }
                              onClick={() =>
                                changeUserStatus(
                                  account
                                )
                              }
                            >
                              {workingId ===
                              account._id
                                ? "Updating..."
                                : status ===
                                    "blocked"
                                  ? "Unblock"
                                  : "Block"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No users found"
            text="Try another name, email, role or status."
          />
        )}
      </div>
    </section>
  );
}

/* =========================================================
   ADMIN PRODUCTS
   ========================================================= */

function AdminProducts() {
  const { API } = useAuth();

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [workingId, setWorkingId] =
    useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API}/admin/products`,
        authConfig()
      );

      setProducts(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Could not load products."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [API]);

  const counts = useMemo(() => {
    return {
      all: products.length,

      pending: products.filter(
        (product) =>
          normalizeModerationStatus(
            product
          ) === "pending"
      ).length,

      approved: products.filter(
        (product) =>
          normalizeModerationStatus(
            product
          ) === "approved"
      ).length,

      rejected: products.filter(
        (product) =>
          normalizeModerationStatus(
            product
          ) === "rejected"
      ).length,
    };
  }, [products]);

  const filteredProducts =
    useMemo(() => {
      const term = search
        .trim()
        .toLowerCase();

      return products.filter(
        (product) => {
          const status =
            normalizeModerationStatus(
              product
            );

          const matchesFilter =
            filter === "all" ||
            status === filter;

          const matchesSearch =
            !term ||
            product.title
              ?.toLowerCase()
              .includes(term) ||
            product.category
              ?.toLowerCase()
              .includes(term) ||
            product.sellerInfo?.name
              ?.toLowerCase()
              .includes(term) ||
            product.sellerInfo?.email
              ?.toLowerCase()
              .includes(term);

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );
    }, [products, search, filter]);

  const moderateProduct = async (
    product,
    status
  ) => {
    const action =
      status === "approved"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${product.title}"?`
    );

    if (!confirmed) return;

    try {
      setWorkingId(product._id);

      await axios.patch(
        `${API}/admin/products/${product._id}/moderation`,
        {
          status,
        },
        authConfig()
      );

      setProducts((current) =>
        current.map((item) =>
          item._id === product._id
            ? {
                ...item,
                moderationStatus:
                  status,
              }
            : item
        )
      );
    } catch (error) {
      alert(
        getErrorMessage(
          error,
          `Could not ${action} this product.`
        )
      );
    } finally {
      setWorkingId("");
    }
  };

  if (loading) {
    return (
      <DashboardLoader text="Loading products..." />
    );
  }

  if (error && !products.length) {
    return (
      <DashboardError
        message={error}
        onRetry={loadProducts}
      />
    );
  }

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="ADMIN"
        title="Products"
        description="Review marketplace listings and approve or reject seller submissions."
        right={
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadProducts}
          >
            Refresh
          </button>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search product, category or seller..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      <div className="admin-filter-tabs">
        {[
          ["all", "All"],
          ["pending", "Pending"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            className={
              filter === value
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(value)
            }
          >
            {label}

            <span>
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      {filteredProducts.length ? (
        <div className="admin-product-list">
          {filteredProducts.map(
            (product) => {
              const status =
                normalizeModerationStatus(
                  product
                );

              return (
                <article
                  className="admin-product-card"
                  key={product._id}
                >
                  <img
                    src={
                      product.images?.[0] ||
                      `https://picsum.photos/seed/${product._id}/240/180`
                    }
                    alt={product.title}
                  />

                  <div className="admin-product-main">
                    <div className="admin-product-title-row">
                      <div>
                        <span className="product-category-label">
                          {product.category ||
                            "Other"}
                        </span>

                        <h3>
                          {product.title}
                        </h3>
                      </div>

                      <StatusBadge
                        status={status}
                      />
                    </div>

                    <div className="admin-product-meta">
                      <span>
                        <strong>
                          Price:
                        </strong>{" "}
                        {formatCurrency(
                          product.price
                        )}
                      </span>

                      <span>
                        <strong>
                          Condition:
                        </strong>{" "}
                        {product.condition ||
                          "N/A"}
                      </span>

                      <span>
                        <strong>
                          Seller:
                        </strong>{" "}
                        {product.sellerInfo
                          ?.name ||
                          "Unknown Seller"}
                      </span>

                      <span>
                        <strong>
                          Added:
                        </strong>{" "}
                        {formatDate(
                          product.createdAt
                        )}
                      </span>
                    </div>

                    <div className="admin-product-actions">
                      {status !==
                        "approved" && (
                        <button
                          type="button"
                          className="btn-small approve"
                          disabled={
                            workingId ===
                            product._id
                          }
                          onClick={() =>
                            moderateProduct(
                              product,
                              "approved"
                            )
                          }
                        >
                          Approve
                        </button>
                      )}

                      {status !==
                        "rejected" && (
                        <button
                          type="button"
                          className="btn-small danger"
                          disabled={
                            workingId ===
                            product._id
                          }
                          onClick={() =>
                            moderateProduct(
                              product,
                              "rejected"
                            )
                          }
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      ) : (
        <EmptyState
          title="No products found"
          text="There are no products matching this search or moderation status."
        />
      )}
    </section>
  );
}

/* =========================================================
   ADMIN ORDERS
   ========================================================= */

function AdminOrders() {
  const { API } = useAuth();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");

  const statuses = [
    "all",
    "pending",
    "accepted",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API}/orders`,
        authConfig()
      );

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Could not load orders."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [API]);

  const counts = useMemo(() => {
    const result = {
      all: orders.length,
      pending: 0,
      accepted: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status = normalizeOrderStatus(order);

      if (result[status] !== undefined) {
        result[status] += 1;
      }
    });

    return result;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = normalizeOrderStatus(order);

      const productName =
        getOrderProductName(order).toLowerCase();

      const orderId =
        getOrderId(order).toLowerCase();

      const buyerName = String(
        order?.buyerInfo?.name || ""
      ).toLowerCase();

      const sellerName = String(
        order?.sellerInfo?.name || ""
      ).toLowerCase();

      const matchesSearch =
        !term ||
        productName.includes(term) ||
        orderId.includes(term) ||
        buyerName.includes(term) ||
        sellerName.includes(term);

      const matchesFilter =
        filter === "all" || status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  const updateOrderStatus = async (
    order,
    nextStatus
  ) => {
    const currentStatus =
      normalizeOrderStatus(order);

    if (currentStatus === nextStatus) {
      return;
    }

    if (nextStatus === "cancelled") {
      const confirmed = window.confirm(
        `Are you sure you want to cancel order ${getOrderId(
          order
        )}?`
      );

      if (!confirmed) return;
    }

    if (nextStatus === "delivered") {
      const confirmed = window.confirm(
        `Mark order ${getOrderId(
          order
        )} as delivered?`
      );

      if (!confirmed) return;
    }

    try {
      setWorkingId(order._id);

      await axios.patch(
        `${API}/orders/${order._id}/status`,
        {
          status: nextStatus,
        },
        authConfig()
      );

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item._id === order._id
            ? {
                ...item,
                orderStatus: nextStatus,
              }
            : item
        )
      );
    } catch (error) {
      window.alert(
        getErrorMessage(
          error,
          "Could not update the order status."
        )
      );
    } finally {
      setWorkingId("");
    }
  };

  if (loading) {
    return (
      <DashboardLoader text="Loading orders..." />
    );
  }

  if (error && !orders.length) {
    return (
      <DashboardError
        message={error}
        onRetry={loadOrders}
      />
    );
  }

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="ADMIN"
        title="Orders"
        description="Review marketplace orders and manage their delivery status."
        right={
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadOrders}
          >
            Refresh
          </button>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search order, product, buyer or seller..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </div>

      <div className="admin-filter-tabs order-tabs">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            className={
              filter === status ? "active" : ""
            }
            onClick={() => setFilter(status)}
          >
            {capitalize(status)}

            <span>{counts[status]}</span>
          </button>
        ))}
      </div>

      {filteredOrders.length ? (
        <div className="admin-orders-list">
          {filteredOrders.map((order) => {
            const status =
              normalizeOrderStatus(order);

            const amount =
              getOrderAmount(order);

            const quantity = Number(
              order.quantity || 1
            );

            const buyer =
              order?.buyerInfo?.name ||
              order?.buyerInfo?.email ||
              "Buyer";

            const seller =
              order?.sellerInfo?.name ||
              order?.sellerInfo?.email ||
              "Seller";

            return (
              <article
                className="admin-order-card"
                key={order._id}
              >
                <div className="admin-order-top">
                  <div className="admin-order-product">
                    <div className="admin-order-icon">
                      ▣
                    </div>

                    <div>
                      <span className="admin-order-id">
                        {getOrderId(order)}
                      </span>

                      <h3>
                        {getOrderProductName(order)}
                      </h3>

                      <p>
                        {buyer}{" "}
                        <span className="order-arrow">
                          →
                        </span>{" "}
                        {seller}
                      </p>
                    </div>
                  </div>

                  <div className="admin-order-price">
                    <strong>
                      {formatCurrency(amount)}
                    </strong>

                    <StatusBadge status={status} />
                  </div>
                </div>

                <div className="admin-order-details">
                  <div>
                    <span>Order Date</span>

                    <strong>
                      {formatDate(order.createdAt)}
                    </strong>
                  </div>

                  <div>
                    <span>Quantity</span>

                    <strong>{quantity}</strong>
                  </div>

                  <div>
                    <span>Payment</span>

                    <StatusBadge
                      status={
                        order.paymentStatus ||
                        "pending"
                      }
                    />
                  </div>

                  <div>
                    <span>Current Status</span>

                    <StatusBadge status={status} />
                  </div>
                </div>

                <div className="admin-order-actions">
                  <div className="admin-status-select">
                    <label
                      htmlFor={`status-${order._id}`}
                    >
                      Update status
                    </label>

                    <select
                      id={`status-${order._id}`}
                      value={status}
                      disabled={
                        workingId === order._id
                      }
                      onChange={(event) =>
                        updateOrderStatus(
                          order,
                          event.target.value
                        )
                      }
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="accepted">
                        Accepted
                      </option>

                      <option value="processing">
                        Processing
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  <div className="admin-order-buttons">
                    {status !== "delivered" &&
                      status !== "cancelled" && (
                        <button
                          type="button"
                          className="btn-small approve"
                          disabled={
                            workingId === order._id
                          }
                          onClick={() =>
                            updateOrderStatus(
                              order,
                              "delivered"
                            )
                          }
                        >
                          {workingId === order._id
                            ? "Updating..."
                            : "Move to Delivered"}
                        </button>
                      )}

                    {status !== "cancelled" &&
                      status !== "delivered" && (
                        <button
                          type="button"
                          className="btn-small danger"
                          disabled={
                            workingId === order._id
                          }
                          onClick={() =>
                            updateOrderStatus(
                              order,
                              "cancelled"
                            )
                          }
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No orders found"
          text="There are no orders matching the current search or status filter."
        />
      )}
    </section>
  );
}

/* =========================================================
   ADMIN ANALYTICS
   ========================================================= */

function AdminAnalytics() {
  const { API } = useAuth();

  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API}/admin/analytics`,
        authConfig()
      );

      setAnalytics(data);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Could not load analytics."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [API]);

  if (loading) {
    return (
      <DashboardLoader text="Loading analytics..." />
    );
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={loadAnalytics}
      />
    );
  }

  const summary = analytics?.summary || {};

  const revenue =
    analytics?.revenueOverview || [];

  const users =
    analytics?.userGrowth || [];

  const monthlyOrders =
    analytics?.monthlyOrders || [];

  const categories =
    analytics?.categoryPerformance || [];

  const orderStatus =
    analytics?.orderStatus || {};

  const orderStatusData = Object.entries(
    orderStatus
  ).map(([status, count]) => ({
    status: capitalize(status),
    orders: count,
  }));

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="ADMIN"
        title="Analytics"
        description="Marketplace performance calculated from your users, products and orders."
        right={
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadAnalytics}
          >
            Refresh Data
          </button>
        }
      />

      <div className="dashboard-stat-grid admin-stat-grid">
        <MetricCard
          icon="👥"
          label="Users"
          value={summary.totalUsers || 0}
          note={`${summary.buyers || 0} buyers · ${
            summary.sellers || 0
          } sellers`}
        />

        <MetricCard
          icon="📦"
          label="Products"
          value={summary.totalProducts || 0}
          note={`${summary.pendingProducts || 0} awaiting review`}
        />

        <MetricCard
          icon="🧾"
          label="Orders"
          value={summary.totalOrders || 0}
          note={`${summary.deliveredOrders || 0} delivered`}
        />

        <MetricCard
          icon="$"
          label="Revenue"
          value={formatCurrency(
            summary.totalRevenue
          )}
          note="Delivered paid orders"
        />
      </div>

      <div className="analytics-dashboard-grid">
        <article className="dashboard-panel analytics-large-panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue Overview</h2>

              <p>
                Revenue generated during the last
                six months
              </p>
            </div>
          </div>

          <div className="dashboard-chart">
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={revenue}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value),
                    "Revenue",
                  ]}
                />

                <Bar
                  dataKey="revenue"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>User Growth</h2>

              <p>
                Registered users by month
              </p>
            </div>
          </div>

          <div className="dashboard-chart">
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <LineChart data={users}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="month" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="users"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Monthly Orders</h2>

              <p>
                Order activity during the last
                six months
              </p>
            </div>
          </div>

          <div className="dashboard-chart">
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={monthlyOrders}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="month" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="orders"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Order Status</h2>

              <p>
                Current order distribution
              </p>
            </div>
          </div>

          {orderStatusData.length ? (
            <div className="dashboard-chart">
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={orderStatusData}
                  layout="vertical"
                  margin={{
                    left: 20,
                    right: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="status"
                    width={85}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="orders"
                    radius={[0, 7, 7, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No order data"
              text="Order status statistics will appear here."
            />
          )}
        </article>
      </div>

      <article className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Category Performance</h2>

            <p>
              Number of products listed in each
              marketplace category
            </p>
          </div>
        </div>

        {categories.length ? (
          <div className="analytics-category-list">
            {categories.map((category) => {
              const percentage =
                summary.totalProducts > 0
                  ? Math.round(
                      (category.count /
                        summary.totalProducts) *
                        100
                    )
                  : 0;

              return (
                <div
                  className="analytics-category-row"
                  key={category.category}
                >
                  <div className="analytics-category-info">
                    <strong>
                      {category.category}
                    </strong>

                    <span>
                      {category.count} product
                      {category.count !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div className="analytics-category-progress">
                    <div
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <strong className="analytics-category-percent">
                    {percentage}%
                  </strong>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No category data"
            text="Product category statistics will appear here."
          />
        )}
      </article>
    </section>
  );
}


/* =========================================================
   SELLER SALES ANALYTICS
   ========================================================= */


function SellerAnalytics() {
  const { API } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API}/orders`,
        authConfig()
      );

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Could not load sales analytics."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [API]);

  const deliveredOrders = orders.filter(
    (order) =>
      normalizeOrderStatus(order) === "delivered"
  );

  const pendingOrders = orders.filter(
    (order) =>
      normalizeOrderStatus(order) === "pending"
  );

  const totalRevenue = deliveredOrders.reduce(
    (total, order) => total + getOrderAmount(order),
    0
  );

  // Last six months, including the current month
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      months.push({
        key: `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`,
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        revenue: 0,
        sales: 0,
      });
    }

    deliveredOrders.forEach((order) => {
      // Uses order date because a delivery timestamp
      // is not established in the current order data.
      const date = new Date(order.createdAt);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const month = months.find(
        (item) => item.key === key
      );

      if (month) {
        month.revenue += getOrderAmount(order);
        month.sales += 1;
      }
    });

    return months;
  }, [orders]);

  const statusData = useMemo(() => {
    const counts = {};

    orders.forEach((order) => {
      const status = capitalize(
        normalizeOrderStatus(order)
      );

      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(
      ([name, value]) => ({ name, value })
    );
  }, [orders]);

  const chartColors = [
    "#10a37f",
    "#2563eb",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
  ];

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="SELLER DASHBOARD"
        title="Sales Analytics"
        description="Track your sales, orders, and revenue."
        right={
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadOrders}
          >
            Refresh
          </button>
        }
      />

      {loading ? (
        <DashboardLoader text="Loading sales analytics..." />
      ) : error ? (
        <DashboardError
          message={error}
          onRetry={loadOrders}
        />
      ) : (
        <>
          <div className="dashboard-stat-grid">
            <MetricCard
              icon="📦"
              label="Total Orders"
              value={orders.length}
              note="Orders received"
            />

            <MetricCard
              icon="✅"
              label="Completed Sales"
              value={deliveredOrders.length}
              note="Successfully delivered"
            />

            <MetricCard
              icon="$"
              label="Total Revenue"
              value={formatCurrency(totalRevenue)}
              note="Revenue from delivered orders"
            />

            <MetricCard
              icon="◷"
              label="Pending Orders"
              value={pendingOrders.length}
              note="Waiting for processing"
            />
          </div>

          <div
            className="analytics-dashboard-grid"
            style={{ marginTop: 24 }}
          >
            <article className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>Monthly Revenue</h2>
                  <p>
                    Revenue from delivered orders
                    over the last six months
                  </p>
                </div>
              </div>

              <div
                className="dashboard-chart"
                style={{ minWidth: 0 }}
              >
                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#10a37f"
                      radius={[7, 7, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>Sales Trend</h2>
                  <p>
                    Number of delivered orders
                    by order month
                  </p>
                </div>
              </div>

              <div
                className="dashboard-chart"
                style={{ minWidth: 0 }}
              >
                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <LineChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis dataKey="month" />
                    <YAxis
                      allowDecimals={false}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      name="Completed Sales"
                      stroke="#2563eb"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article
              className="dashboard-panel"
              style={{ gridColumn: "1 / -1" }}
            >
              <div className="panel-heading">
                <div>
                  <h2>Order Status Distribution</h2>
                  <p>
                    Breakdown of your orders
                    by current status
                  </p>
                </div>
              </div>

              {statusData.length ? (
                <div
                  className="dashboard-chart"
                  style={{ minWidth: 0 }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height={320}
                  >
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={95}
                        label={({ name, value }) =>
                          `${name}: ${value}`
                        }
                      >
                        {statusData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={
                              chartColors[
                                index % chartColors.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title="No orders yet"
                  text="Order status statistics will appear here."
                />
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}


/* =========================================================
   BUYER / SELLER OVERVIEW
   ========================================================= */

function BuyerSellerOverview() {
  const { API, user } = useAuth();

  const role = user?.role || "buyer";

  const [orders, setOrders] = useState([]);
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadOverviewData = async () => {
    try {
      setLoading(true);

      const tokenConfig = authConfig();

      const orderRequest = axios.get(
        `${API}/orders`,
        tokenConfig
      );

      if (role === "seller") {
        const [orderResponse, productResponse] =
          await Promise.all([
            orderRequest,

            axios.get(`${API}/products`, {
              params: {
                limit: 50,
              },
            }),
          ]);

        setOrders(
          Array.isArray(orderResponse.data)
            ? orderResponse.data
            : []
        );

        const allProducts =
          productResponse.data?.products || [];

        const currentSellerProducts =
          allProducts.filter(
            (product) =>
              product.sellerId === user?._id ||
              product.sellerInfo?.userId ===
                user?._id ||
              product.sellerInfo?.email ===
                user?.email
          );

        setProducts(currentSellerProducts);
      } else {
        const orderResponse =
          await orderRequest;

        setOrders(
          Array.isArray(orderResponse.data)
            ? orderResponse.data
            : []
        );
      }
    } catch (error) {
      console.error(
        "Dashboard overview error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverviewData();
  }, [API, role, user?._id, user?.email]);

  if (loading) {
    return (
      <DashboardLoader text="Loading your dashboard..." />
    );
  }

  const deliveredOrders = orders.filter(
    (order) =>
      normalizeOrderStatus(order) ===
      "delivered"
  );

  const pendingOrders = orders.filter(
    (order) =>
      normalizeOrderStatus(order) ===
      "pending"
  );

  const totalValue = deliveredOrders.reduce(
    (total, order) =>
      total + getOrderAmount(order),
    0
  );

  if (role === "seller") {
    return (
      <section className="dashboard-section">
        <DashboardPageHeader
          eyebrow="SELLER DASHBOARD"
          title={`Welcome back${
            user?.name
              ? `, ${user.name.split(" ")[0]}`
              : ""
          }!`}
          description="Manage your products and marketplace orders."
        />

        <div className="dashboard-stat-grid">
          <MetricCard
            icon="📦"
            label="Total Products"
            value={products.length}
            note="Your approved marketplace listings"
          />

          <MetricCard
            icon="✓"
            label="Completed Sales"
            value={deliveredOrders.length}
            note="Delivered customer orders"
          />

          <MetricCard
            icon="$"
            label="Revenue"
            value={formatCurrency(totalValue)}
            note="From delivered orders"
          />

          <MetricCard
            icon="◷"
            label="Pending Orders"
            value={pendingOrders.length}
            note="Waiting for action"
          />
        </div>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Seller Activity</h2>

              <p>
                Your most recent customer orders
              </p>
            </div>
          </div>

          {orders.length ? (
            <div className="simple-order-list">
              {orders
                .slice(0, 5)
                .map((order) => (
                  <div
                    className="simple-order-row"
                    key={order._id}
                  >
                    <div>
                      <strong>
                        {getOrderProductName(
                          order
                        )}
                      </strong>

                      <span>
                        {getOrderId(order)} ·{" "}
                        {formatDate(
                          order.createdAt
                        )}
                      </span>
                    </div>

                    <div>
                      <strong>
                        {formatCurrency(
                          getOrderAmount(order)
                        )}
                      </strong>

                      <StatusBadge
                        status={normalizeOrderStatus(
                          order
                        )}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              title="No orders yet"
              text="Customer orders will appear here."
            />
          )}
        </article>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="BUYER DASHBOARD"
        title={`Welcome back${
          user?.name
            ? `, ${user.name.split(" ")[0]}`
            : ""
        }!`}
        description="Track your purchases and marketplace activity."
      />

      <div className="dashboard-stat-grid">
        <MetricCard
          icon="🛍"
          label="Total Orders"
          value={orders.length}
          note="All marketplace purchases"
        />

        <MetricCard
          icon="✓"
          label="Completed Orders"
          value={deliveredOrders.length}
          note="Successfully delivered"
        />

        <MetricCard
          icon="$"
          label="Total Spent"
          value={formatCurrency(totalValue)}
          note="From delivered orders"
        />

        <MetricCard
          icon="◷"
          label="Pending Orders"
          value={pendingOrders.length}
          note="Waiting for processing"
        />
      </div>

      <article className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Orders</h2>

            <p>
              Your latest marketplace purchases
            </p>
          </div>
        </div>

        {orders.length ? (
          <div className="simple-order-list">
            {orders
              .slice(0, 5)
              .map((order) => (
                <div
                  className="simple-order-row"
                  key={order._id}
                >
                  <div>
                    <strong>
                      {getOrderProductName(order)}
                    </strong>

                    <span>
                      {getOrderId(order)} ·{" "}
                      {formatDate(
                        order.createdAt
                      )}
                    </span>
                  </div>

                  <div>
                    <strong>
                      {formatCurrency(
                        getOrderAmount(order)
                      )}
                    </strong>

                    <StatusBadge
                      status={normalizeOrderStatus(
                        order
                      )}
                    />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            title="No orders yet"
            text="Your marketplace purchases will appear here."
          />
        )}
      </article>
    </section>
  );
}

/* =========================================================
   EXPORTED OVERVIEW
   ========================================================= */

export function Overview() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminOverview />;
  }

  return <BuyerSellerOverview />;
}

/* =========================================================
   ADD PRODUCT
   ========================================================= */

export function AddProduct() {
  const { API, user } = useAuth();

  const initialForm = {
    title: "",
    category: "Electronics",
    condition: "Good",
    price: "",
    stock: "1",
    description: "",
    image: "",
  };

  const [form, setForm] =
    useState(initialForm);

  const [submitting, setSubmitting] =
    useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.price ||
      !form.description.trim()
    ) {
      window.alert(
        "Please enter the product title, price and description."
      );

      return;
    }

    if (Number(form.price) <= 0) {
      window.alert(
        "Product price must be greater than 0."
      );

      return;
    }

    if (Number(form.stock) < 1) {
      window.alert(
        "Stock must be at least 1."
      );

      return;
    }

    try {
      setSubmitting(true);

      await axios.post(
        `${API}/products`,
        {
          title: form.title.trim(),
          category: form.category,
          condition: form.condition,
          price: Number(form.price),
          stock: Number(form.stock),

          description:
            form.description.trim(),

          images: form.image.trim()
            ? [form.image.trim()]
            : [],

          sellerInfo: {
            name: user?.name || "",
            email: user?.email || "",
          },
        },
        authConfig()
      );

      window.alert(
        user?.role === "seller"
          ? "Product submitted successfully. It is now waiting for admin approval."
          : "Product added successfully."
      );

      setForm(initialForm);
    } catch (error) {
      console.error(
        "Add product error:",
        error
      );

      window.alert(
        getErrorMessage(
          error,
          "Could not add the product."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="SELLER DASHBOARD"
        title="Add Product"
        description="Add a new pre-owned item to the ReSell Hub marketplace."
      />

      <form
        className="dashboard-panel form"
        onSubmit={handleSubmit}
      >
        <label htmlFor="product-title">
          Product Title
        </label>

        <input
          id="product-title"
          name="title"
          type="text"
          value={form.title}
          onChange={updateField}
          placeholder="Example: Samsung Galaxy S23"
          required
        />

        <label htmlFor="product-category">
          Category
        </label>

        <select
          id="product-category"
          name="category"
          value={form.category}
          onChange={updateField}
        >
          <option>Electronics</option>
          <option>Fashion</option>
          <option>Furniture</option>
          <option>Books</option>
          <option>Sports</option>
          <option>Accessories</option>
          <option>Other</option>
        </select>

        <label htmlFor="product-condition">
          Condition
        </label>

        <select
          id="product-condition"
          name="condition"
          value={form.condition}
          onChange={updateField}
        >
          <option>Like New</option>
          <option>Excellent</option>
          <option>Good</option>
          <option>Fair</option>
        </select>

        <label htmlFor="product-price">
          Price (USD)
        </label>

        <input
          id="product-price"
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={updateField}
          placeholder="Enter product price"
          required
        />

        <label htmlFor="product-stock">
          Stock
        </label>

        <input
          id="product-stock"
          name="stock"
          type="number"
          min="1"
          value={form.stock}
          onChange={updateField}
          required
        />

        <label htmlFor="product-image">
          Image URL
        </label>

        <input
          id="product-image"
          name="image"
          type="url"
          value={form.image}
          onChange={updateField}
          placeholder="https://example.com/product-image.jpg"
        />

        <label htmlFor="product-description">
          Description
        </label>

        <textarea
          id="product-description"
          name="description"
          value={form.description}
          onChange={updateField}
          placeholder="Describe the product and its condition..."
          required
        />

        <button
          className="btn"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Adding Product..."
            : "Add Product"}
        </button>
      </form>
    </section>
  );
}

/* =========================================================
   BUYER / SELLER ORDERS
   ========================================================= */

function UserOrdersPage() {
  const { API, user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] =
    useState("");

  const statuses = [
    "all",
    "pending",
    "accepted",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API}/orders`,
        authConfig()
      );

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Could not load your orders."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [API]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = normalizeOrderStatus(order);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      const matchesSearch =
        !term ||
        getOrderProductName(order)
          .toLowerCase()
          .includes(term) ||
        getOrderId(order)
          .toLowerCase()
          .includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const sellerUpdateStatus = async (
    order,
    nextStatus
  ) => {
    if (user?.role !== "seller") return;

    if (nextStatus === "cancelled") {
      const confirmed = window.confirm(
        `Cancel order ${getOrderId(order)}?`
      );

      if (!confirmed) return;
    }

    try {
      setWorkingId(order._id);

      await axios.patch(
        `${API}/orders/${order._id}/status`,
        {
          status: nextStatus,
        },
        authConfig()
      );

      setOrders((current) =>
        current.map((item) =>
          item._id === order._id
            ? {
                ...item,
                orderStatus: nextStatus,
              }
            : item
        )
      );
    } catch (error) {
      window.alert(
        getErrorMessage(
          error,
          "Could not update this order."
        )
      );
    } finally {
      setWorkingId("");
    }
  };

  if (loading) {
    return (
      <DashboardLoader text="Loading orders..." />
    );
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={loadOrders}
      />
    );
  }

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow={
          user?.role === "seller"
            ? "SELLER DASHBOARD"
            : "BUYER DASHBOARD"
        }
        title={
          user?.role === "seller"
            ? "Manage Orders"
            : "My Orders"
        }
        description={
          user?.role === "seller"
            ? "Review customer orders and update their progress."
            : "Track your marketplace purchases and delivery progress."
        }
        right={
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadOrders}
          >
            Refresh
          </button>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-search">
          <span>⌕</span>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search product or order ID..."
          />
        </div>
      </div>

      <div className="admin-filter-tabs order-tabs">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            className={
              statusFilter === status
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter(status)
            }
          >
            {capitalize(status)}
          </button>
        ))}
      </div>

      {filteredOrders.length ? (
        <div className="admin-orders-list">
          {filteredOrders.map((order) => {
            const status =
              normalizeOrderStatus(order);

            return (
              <article
                className="admin-order-card"
                key={order._id}
              >
                <div className="admin-order-top">
                  <div className="admin-order-product">
                    <div className="admin-order-icon">
                      ▣
                    </div>

                    <div>
                      <span className="admin-order-id">
                        {getOrderId(order)}
                      </span>

                      <h3>
                        {getOrderProductName(order)}
                      </h3>

                      <p>
                        Ordered on{" "}
                        {formatDate(
                          order.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="admin-order-price">
                    <strong>
                      {formatCurrency(
                        getOrderAmount(order)
                      )}
                    </strong>

                    <StatusBadge status={status} />
                  </div>
                </div>

                <div className="admin-order-details">
                  <div>
                    <span>Quantity</span>
                    <strong>
                      {Number(
                        order.quantity || 1
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>

                    <StatusBadge
                      status={
                        order.paymentStatus ||
                        "pending"
                      }
                    />
                  </div>

                  {user?.role === "buyer" && (
                    <div>
                      <span>Seller</span>

                      <strong>
                        {order?.sellerInfo?.name ||
                          "Seller"}
                      </strong>
                    </div>
                  )}

                  {user?.role === "seller" && (
                    <div>
                      <span>Buyer</span>

                      <strong>
                        {order?.buyerInfo?.name ||
                          "Buyer"}
                      </strong>
                    </div>
                  )}
                </div>

                {user?.role === "seller" &&
                  status !== "cancelled" &&
                  status !== "delivered" && (
                    <div className="admin-order-actions">
                      <div className="admin-status-select">
                        <label
                          htmlFor={`seller-status-${order._id}`}
                        >
                          Update Status
                        </label>

                        <select
                          id={`seller-status-${order._id}`}
                          value={status}
                          disabled={
                            workingId === order._id
                          }
                          onChange={(event) =>
                            sellerUpdateStatus(
                              order,
                              event.target.value
                            )
                          }
                        >
                          <option value="pending">
                            Pending
                          </option>

                          <option value="accepted">
                            Accepted
                          </option>

                          <option value="processing">
                            Processing
                          </option>

                          <option value="shipped">
                            Shipped
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>
                      </div>
                    </div>
                  )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No orders found"
          text="No orders match the selected search or status."
        />
      )}
    </section>
  );
}


/* =========================================================
   SELLER MY PRODUCTS
   ========================================================= */

function SellerProductsPage() {
  const { API, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    stock: "",
    description: "",
    image: "",
  });

  const startEditing = (product) => {
    setEditingProduct(product);

    setEditForm({
      title: product.title || "",
      category: product.category || "",
      condition: product.condition || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 1),
      description: product.description || "",
      image: product.images?.[0] || "",
    });
  };

  
const saveProduct = async (event) => {
  event.preventDefault();

  if (!editingProduct || savingProduct) return;

  const price = Number(editForm.price);
  const stock = Number(editForm.stock);

  if (
    !editForm.title.trim() ||
    !editForm.category.trim() ||
    !editForm.condition.trim() ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    window.alert("Please enter valid product information.");
    return;
  }

  try {
    setSavingProduct(true);

    const payload = {
      title: editForm.title.trim(),
      category: editForm.category.trim(),
      condition: editForm.condition.trim(),
      description: editForm.description.trim(),
      price,
      stock,
      images: editForm.image.trim()
        ? [editForm.image.trim()]
        : [],
    };

    await axios.patch(
      `${API}/products/${editingProduct._id}`,
      payload,
      authConfig()
    );

    setEditingProduct(null);
    await loadProducts();

    window.alert(
      "Product updated successfully! Waiting for admin approval."
    );
  } catch (error) {
    window.alert(
      getErrorMessage(error, "Could not save product changes.")
    );
  } finally {
    setSavingProduct(false);
  }
};


  // Load all products belonging to the logged-in seller,
  // including Approved, Pending, and Rejected products.
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API}/seller/products`,
        authConfig()
      );

      setProducts(data?.products || []);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Could not load your products."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [API, user?._id, user?.email]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      return (
        !term ||
        product.title?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.title}"?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API}/products/${product._id}`,
        authConfig()
      );

      setProducts((current) =>
        current.filter(
          (item) => item._id !== product._id
        )
      );

      if (editingProduct?._id === product._id) {
        setEditingProduct(null);
      }
    } catch (error) {
      window.alert(
        getErrorMessage(
          error,
          "Could not delete the product."
        )
      );
    }
  };

  if (loading) {
    return (
      <DashboardLoader text="Loading your products..." />
    );
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={loadProducts}
      />
    );
  }

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="SELLER DASHBOARD"
        title="My Products"
        description="Review and manage the products you have listed."
        right={
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadProducts}
          >
            Refresh
          </button>
        }
      />

      {/* EDIT PRODUCT FORM */}
      {editingProduct && (
        <div
          className="panel"
          style={{ marginBottom: "24px" }}
        >
          <h3>
            Edit Product: {editingProduct.title}
          </h3>

          <form
            onSubmit={saveProduct}
            style={{
              display: "grid",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            {[
              ["title", "Product Title"],
              ["category", "Category"],
              ["condition", "Condition"],
              ["price", "Price (USD)"],
              ["stock", "Stock"],
              ["image", "Image URL"],
            ].map(([name, label]) => (
              <label key={name}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </span>

                <input
                  className="form-control"
                  type={
                    name === "price" || name === "stock"
                      ? "number"
                      : "text"
                  }
                  min={
                    name === "price"
                      ? "0.01"
                      : name === "stock"
                      ? "0"
                      : undefined
                  }
                  step={
                    name === "price" ? "0.01" : "1"
                  }
                  value={editForm[name]}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      [name]: event.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d9e3df",
                    borderRadius: "8px",
                  }}
                />
              </label>
            ))}

            <label>
              <span
                style={{
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Description
              </span>

              <textarea
                value={editForm.description}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d9e3df",
                  borderRadius: "8px",
                }}
              />
            </label>

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <button
  type="submit"
  className="btn btn-primary"
  disabled={savingProduct}
>
  {savingProduct ? "Saving..." : "Save Changes"}
</button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  setEditingProduct(null)
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search your products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </div>

      {/* PRODUCT LIST */}
      {filteredProducts.length ? (
        <div className="admin-product-list">
          {filteredProducts.map((product) => (
            <article
              className="admin-product-card"
              key={product._id}
            >
              <img
                src={
                  product.images?.[0] ||
                  `https://picsum.photos/seed/${product._id}/240/180`
                }
                alt={product.title}
              />

              <div className="admin-product-main">
                <div className="admin-product-title-row">
                  <div>
                    <span className="product-category-label">
                      {product.category || "Other"}
                    </span>

                    <h3>{product.title}</h3>
                  </div>

                  <StatusBadge
                    status={normalizeModerationStatus(
                      product
                    )}
                  />
                </div>

                <div className="admin-product-meta">
                  <span>
                    <strong>Price:</strong>{" "}
                    {formatCurrency(product.price)}
                  </span>

                  <span>
                    <strong>Condition:</strong>{" "}
                    {product.condition || "N/A"}
                  </span>

                  <span>
                    <strong>Stock:</strong>{" "}
                    {product.stock ?? 1}
                  </span>

                  <span>
                    <strong>Added:</strong>{" "}
                    {formatDate(product.createdAt)}
                  </span>
                </div>

                <div className="admin-product-actions">
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() =>
                      startEditing(product)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn-small danger"
                    onClick={() =>
                      deleteProduct(product)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No products found"
          text="Your products will appear here after you add them."
        />
      )}
    </section>
  );
}


/* =========================================================
   BUYER WISHLIST
   ========================================================= */

function WishlistPage() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${API}/wishlist`, authConfig());
      const entries = Array.isArray(data)
        ? data
        : Array.isArray(data?.wishlist)
          ? data.wishlist
          : Array.isArray(data?.products)
            ? data.products
            : Array.isArray(data?.items)
              ? data.items
              : [];

      const resolved = await Promise.all(entries.map(async (entry) => {
        const embedded = entry?.product || entry?.productDetails || entry;
        if (embedded?.title && embedded?._id) return embedded;
        const productId = typeof entry?.productId === "object"
          ? entry.productId?._id
          : entry?.productId || entry?._id;
        if (!productId) return null;
        try {
          const response = await axios.get(`${API}/products/${productId}`);
          return response.data?.product || response.data;
        } catch {
          return null;
        }
      }));

      const unique = new Map();
      resolved.forEach((product) => {
        if (product?._id) unique.set(String(product._id), product);
      });
      setWishlist([...unique.values()]);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your wishlist."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [API]);

  const removeItem = async (productId) => {
    try {
      setWorkingId(productId);
      setError("");
      await axios.delete(`${API}/wishlist/${productId}`, authConfig());
      setWishlist((current) => current.filter((product) =>
        String(product._id) !== String(productId)
      ));
    } catch (err) {
      setError(getErrorMessage(err, "Could not remove this product."));
    } finally {
      setWorkingId("");
    }
  };

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="BUYER DASHBOARD"
        title="My Wishlist"
        description="Products you have saved for later."
        right={
          <button type="button" className="btn btn-outline" onClick={loadWishlist}>
            Refresh
          </button>
        }
      />

      {error && (
        <div className="product-action-message" role="alert">{error}</div>
      )}

      {loading ? (
        <DashboardLoader text="Loading your wishlist..." />
      ) : wishlist.length ? (
        <div className="wishlist-grid">
          {wishlist.map((product) => {
            const productId = String(product._id);
            const stock = Number(product.stock);
            const available =
              (!product.status || String(product.status).toLowerCase() === "available") &&
              (product.stock == null || (Number.isFinite(stock) && stock > 0));
            return (
              <article className="wishlist-item" key={productId}>
                <div className="wishlist-image">
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.title}
                    loading="lazy"
                    onClick={() => navigate(`/products/${productId}`)}
                    style={{ cursor: "pointer" }}
                  />
                  <span className="wishlist-condition">
                    {product.condition || "Pre-owned"}
                  </span>
                </div>
                <div className="wishlist-info">
                  <h3>{product.title}</h3>
                  <p>Sold by {product.sellerInfo?.name || "Marketplace seller"}</p>
                  <strong className="wishlist-price">
                    {formatCurrency(product.price)}
                  </strong>
                  <div className="wishlist-actions">
                    <button
                      type="button"
                      className="buy-now-btn"
                      onClick={() => navigate(`/checkout/${productId}`)}
                      disabled={!available}
                    >
                      {available ? "Buy Now" : "Unavailable"}
                    </button>
                    <button
                      type="button"
                      className="remove-wishlist-btn"
                      onClick={() => removeItem(productId)}
                      disabled={workingId === productId}
                      title="Remove from wishlist"
                      aria-label={`Remove ${product.title}`}
                    >
                      {workingId === productId ? "…" : "×"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : !error ? (
        <EmptyState
          title="Your wishlist is empty"
          text="Products you save will appear here."
        />
      ) : null}
    </section>
  );
}

/* =========================================================
   PAYMENT HISTORY
   ========================================================= */

function PaymentsPage() {
  const { API } = useAuth();

  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API}/payments`,
        authConfig()
      );

      setPayments(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Could not load payment history."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [API]);

  const paidTotal = payments
    .filter((payment) =>
      ["paid", "completed"].includes(
        String(
          payment.status ||
            payment.paymentStatus ||
            ""
        ).toLowerCase()
      )
    )
    .reduce(
      (total, payment) =>
        total +
        Number(
          payment.amount ||
            payment.total ||
            0
        ),
      0
    );

  const pendingTotal = payments
    .filter(
      (payment) =>
        String(
          payment.status ||
            payment.paymentStatus ||
            ""
        ).toLowerCase() === "pending"
    )
    .reduce(
      (total, payment) =>
        total +
        Number(
          payment.amount ||
            payment.total ||
            0
        ),
      0
    );

  const refundedTotal = payments
    .filter(
      (payment) =>
        String(
          payment.status ||
            payment.paymentStatus ||
            ""
        ).toLowerCase() === "refunded"
    )
    .reduce(
      (total, payment) =>
        total +
        Number(
          payment.amount ||
            payment.total ||
            0
        ),
      0
    );

  if (loading) {
    return (
      <DashboardLoader text="Loading payment history..." />
    );
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={loadPayments}
      />
    );
  }

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="BUYER DASHBOARD"
        title="Payment History"
        description="Review your marketplace payments and transactions."
      />

      <div className="payment-summary-grid">
        <div className="payment-summary-card total">
          <span>Total Paid</span>

          <strong>
            {formatCurrency(paidTotal)}
          </strong>

          <small>
            Successful transactions
          </small>
        </div>

        <div className="payment-summary-card refund">
          <span>Refunded</span>

          <strong>
            {formatCurrency(refundedTotal)}
          </strong>

          <small>
            Returned payments
          </small>
        </div>

        <div className="payment-summary-card pending">
          <span>Pending</span>

          <strong>
            {formatCurrency(pendingTotal)}
          </strong>

          <small>
            Awaiting completion
          </small>
        </div>
      </div>

      <article className="transactions-panel">
        <div className="transactions-title">
          <h2>Transactions</h2>

          <span>
            {payments.length} transaction
            {payments.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {payments.length ? (
          payments.map((payment) => {
            const status =
              payment.status ||
              payment.paymentStatus ||
              "paid";

            return (
              <div
                className="transaction-row"
                key={payment._id}
              >
                <div className="transaction-icon">
                  $
                </div>

                <div className="transaction-info">
                  <strong>
  {payment.productName ||
    payment.productTitle ||
    payment.productInfo?.title ||
    payment.product?.title ||
    (typeof payment.product === "string"
      ? payment.product
      : null) ||
    "Marketplace Payment"}
</strong>

                  <span>
                    {payment.orderId ||
                      String(
                        payment._id
                      ).slice(-8)}{" "}
                    •{" "}
                    {formatDate(
                      payment.paymentDate ||
                        payment.createdAt
                    )}
                  </span>
                </div>

                <div className="transaction-amount">
                  <strong>
                    {formatCurrency(
                      payment.amount ||
                        payment.total ||
                        0
                    )}
                  </strong>

                  <StatusBadge
                    status={status}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No payments yet"
            text="Completed marketplace payments will appear here."
          />
        )}
      </article>
    </section>
  );
}

/* =========================================================
   GENERIC FALLBACK
   ========================================================= */

function GenericFallback({ type }) {
  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="RESELL HUB"
        title={capitalize(type)}
        description="This dashboard section is currently unavailable."
      />

      <EmptyState
        title="Nothing to display"
        text="There is no information available in this section."
      />
    </section>
  );
}

/* =========================================================
   GENERIC LIST ROUTER

   IMPORTANT:
   App.jsx already uses:
   <GenericList type="users" />
   <GenericList type="products" />
   <GenericList type="orders" />
   etc.

   This function sends each role to the correct page.
   ========================================================= */

export function GenericList({ type }) {
  const { user } = useAuth();

  const role = user?.role || "buyer";

  if (role === "admin") {
    if (type === "users") {
      return <AdminUsers />;
    }

    if (
      type === "products" ||
      type === "my-products"
    ) {
      return <AdminProducts />;
    }

    if (type === "orders") {
      return <AdminOrders />;
    }
  }

  if (role === "seller") {
    if (
      type === "products" ||
      type === "my-products"
    ) {
      return <SellerProductsPage />;
    }

    if (type === "orders") {
      return <UserOrdersPage />;
    }
  }

  if (role === "buyer") {
    if (type === "orders") {
      return <UserOrdersPage />;
    }

    if (type === "wishlist") {
      return <WishlistPage />;
    }

    if (type === "payments") {
      return <PaymentsPage />;
    }
  }

  return <GenericFallback type={type} />;
}

/* =========================================================
   EXPORTED ANALYTICS
   ========================================================= */

export function Analytics() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminAnalytics />;
  }
  if (user?.role === "seller") {
    return <SellerAnalytics />;
  }
  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="PERFORMANCE"
        title="Analytics"
        description="Marketplace performance information."
      />

      <EmptyState
        title="Analytics unavailable"
        text="Detailed platform analytics are available to administrators."
      />
    </section>
  );
}

/* =========================================================
   PROFILE
   ========================================================= */

export function Profile() {
  const { user } = useAuth();
const profileStorageKey = `resellhubProfile_${user?._id || user?.email || "guest"}`;
  const [profile, setProfile] =
    useState({
      name: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
    });

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    let storedProfile = {};

    try {
      storedProfile = JSON.parse(
  localStorage.getItem(profileStorageKey) || "{}"
);
    } catch {
      storedProfile = {};
    }

    setProfile({
      name:
        storedProfile.name ||
        user?.name ||
        "",

      email:
        user?.email ||
        storedProfile.email ||
        "",

      phone:
        storedProfile.phone ||
        "",

      location:
        storedProfile.location ||
        user?.location ||
        "",

      bio:
        storedProfile.bio ||
        "",
    });
  }, [
     profileStorageKey,
    user?.name,
    user?.email,
    user?.location,
  ]);

  const updateProfile = (event) => {
    const { name, value } =
      event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  };

  const saveProfile = (event) => {
    event.preventDefault();

    const cleanedProfile = {
      ...profile,
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      location:
        profile.location.trim(),
      bio: profile.bio.trim(),
    };

    setProfile(cleanedProfile);

    localStorage.setItem(
      profileStorageKey,
      JSON.stringify(cleanedProfile)
    );

    setSaved(true);
  };

  return (
    <section className="dashboard-section">
      <DashboardPageHeader
        eyebrow="ACCOUNT SETTINGS"
        title="Profile Settings"
        description="Manage your personal ReSell Hub account information."
      />

      <div className="profile-summary">
        <div className="profile-large-avatar">
          {getInitials(
            profile.name || user?.name
          )}
        </div>

        <div className="profile-summary-info">
          <h2>
            {profile.name ||
              user?.name ||
              "ReSell Hub User"}
          </h2>

          <p>
            {profile.email ||
              user?.email ||
              "No email available"}
          </p>

          <RoleBadge
            role={user?.role || "buyer"}
          />
        </div>
      </div>

      <form
        className="profile-panel"
        onSubmit={saveProfile}
      >
        <h2>Personal Information</h2>

        <p>
          Update the information displayed
          on your account.
        </p>

        <div className="profile-form-grid">
          <div className="profile-field">
            <label htmlFor="profile-name">
              Full Name
            </label>

            <input
              id="profile-name"
              name="name"
              type="text"
              value={profile.name}
              onChange={updateProfile}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-email">
              Email Address
            </label>

            <input
              id="profile-email"
              name="email"
              type="email"
              value={profile.email}
              disabled
            />

            <span className="profile-help">
              Your login email cannot be
              changed here.
            </span>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-phone">
              Phone Number
            </label>

            <input
              id="profile-phone"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={updateProfile}
              placeholder="+880 1700 000000"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-location">
              Location
            </label>

            <input
              id="profile-location"
              name="location"
              type="text"
              value={profile.location}
              onChange={updateProfile}
              placeholder="Example: Dhaka, Bangladesh"
            />
          </div>

          <div className="profile-field full">
            <label htmlFor="profile-bio">
              Bio
            </label>

            <textarea
              id="profile-bio"
              name="bio"
              value={profile.bio}
              onChange={updateProfile}
              placeholder="Write a short description about yourself..."
              maxLength={300}
            />

            <span className="profile-help">
              {profile.bio.length}/300
              characters
            </span>
          </div>
        </div>

        <div className="profile-save-row">
          <button
            className="profile-save-btn"
            type="submit"
          >
            Save Changes
          </button>

          {saved && (
            <span className="profile-success">
              ✓ Profile saved successfully
            </span>
          )}
        </div>
      </form>
    </section>
  );
}