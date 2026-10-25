
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const { API } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";

  const [data, setData] = useState({
    products: [],
    page: 1,
    pages: 1,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${API}/products`, {
          params: {
            search,
            sort,
            page,
            category,
            limit: 8,
          },
          signal: controller.signal,
        });

        setData({
          products: response.data.products || [],
          page: response.data.page || 1,
          pages: response.data.pages || 1,
          total: response.data.total || 0,
        });
      } catch (err) {
        if (
          err.code === "ERR_CANCELED" ||
          axios.isCancel(err)
        ) {
          return;
        }

        console.error("Products loading error:", err);
        setError("Unable to load products. Please try again.");
        setData({
          products: [],
          page: 1,
          pages: 1,
          total: 0,
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [API, search, sort, page, category]);

  function clearFilters() {
    setSearch("");
    setSort("");
    setPage(1);
    setSearchParams({});
  }

  function changeSort(value) {
    setSort(value);
    setPage(1);
  }

  function changeSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function changePage(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasFilters = Boolean(category || search || sort);

  return (
    <section>
      <div className="page-title">
        <span className="eyebrow">MARKETPLACE</span>
        <h1>
          {category ? `${category} Products` : "All Products"}
        </h1>
        <p>
          Search, sort and discover quality pre-owned products.
        </p>
      </div>

      <div className="filters">
        <input
          type="search"
          value={search}
          onChange={(e) => changeSearch(e.target.value)}
          placeholder="Search by name or category…"
          aria-label="Search products"
        />

        <select
          value={sort}
          onChange={(e) => changeSort(e.target.value)}
          aria-label="Sort products"
        >
          <option value="">Newest first</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {category && (
        <div
          style={{
            marginTop: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "7px 12px",
              background: "#eaf7f0",
              color: "#087c55",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Category: {category}
          </span>

          <button
            type="button"
            onClick={clearFilters}
            style={{
              border: "none",
              background: "transparent",
              color: "#087c55",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Clear filters ×
          </button>
        </div>
      )}

      {!loading && !error && (
        <p
          style={{
            color: "#64748b",
            fontSize: "14px",
            margin: "18px 0",
          }}
        >
          {data.total}{" "}
          {data.total === 1 ? "product" : "products"} found
        </p>
      )}

      {loading && (
        <div
          role="status"
          style={{
            textAlign: "center",
            padding: "55px 20px",
            color: "#64748b",
          }}
        >
          Loading products...
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          style={{
            textAlign: "center",
            padding: "55px 20px",
          }}
        >
          <p>{error}</p>
          <button
            type="button"
            className="btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        data.products.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "65px 20px",
            }}
          >
            <h2>No products found</h2>
            <p>
              Try a different search or clear your filters.
            </p>

            {hasFilters && (
              <button
                type="button"
                className="btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

      {!loading && !error && data.products.length > 0 && (
        <>
          <div className="grid products">
            {data.products.map((product) => (
              <ProductCard
                key={product._id}
                p={product}
              />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="pagination">
              {Array.from(
                { length: data.pages },
                (_, index) => (
                  <button
                    type="button"
                    key={index}
                    className={
                      page === index + 1 ? "active" : ""
                    }
                    onClick={() =>
                      changePage(index + 1)
                    }
                    aria-label={`Go to page ${index + 1}`}
                    aria-current={
                      page === index + 1
                        ? "page"
                        : undefined
                    }
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
