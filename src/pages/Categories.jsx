
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&auto=format&fit=crop",
    description: "Laptops, computers & electronics",
  },
  {
    name: "Furniture",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&auto=format&fit=crop",
    description: "Furniture for your home",
  },
  {
    name: "Vehicles",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&auto=format&fit=crop",
    description: "Explore pre-owned vehicles",
  },
  {
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&auto=format&fit=crop",
    description: "Clothing, style & fashion",
  },
  {
    name: "Mobile Phones",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop",
    description: "Smartphones & accessories",
  },
];

export default function Categories() {
  return (
    <section className="categories-page">
      <div className="page-title">
        <span className="eyebrow">BROWSE</span>
        <h1>Categories</h1>
        <p>
          Explore our product categories and find
          what you need.
        </p>
      </div>

      <div className="categories-photo-grid">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={`/products?category=${encodeURIComponent(
              category.name
            )}`}
            className="categories-photo-card"
          >
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
            />

            <div className="categories-photo-info">
              <h3>{category.name}</h3>
              <p>{category.description}</p>

              <span className="categories-photo-arrow">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
