import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProductCard({ p }) {
  return (
    <motion.article
      className="card"
      whileHover={{ y: -5 }}
    >
      <img
        src={
          p.images?.[0] ||
          `https://picsum.photos/seed/${p._id}/500/340`
        }
        alt={p.title}
      />

      <div className="card-body">
        <span className="pill">
          {p.condition}
        </span>

        <h3>{p.title}</h3>

        <p>
          {p.category} · {p.location || "Bangladesh"}
        </p>

        <div className="price-row">
          <b>
            ${Number(p.price).toLocaleString()}
          </b>

          <Link to={`/products/${p._id}`}>
            View Details
          </Link>
        </div>
      </div>
    </motion.article>
  );
}