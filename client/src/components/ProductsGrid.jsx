import { useEffect, useState } from "react";
import useFetchAPI from "../hook/useFetchAPI";
import ProductCard from "./ProductCard";

const ProductsGrid = ({ searchTerm }) => {
  const apiURL = `https://fakestoreapi.com/products`;
  const allProducts = useFetchAPI(apiURL);
  const [products, setProducts] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  useEffect(() => {
    if (!allProducts) return;
    let filtered = [...allProducts];
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }
    if (searchTerm !== "") {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortOption) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating-asc":
        filtered.sort((a, b) => a.rating.rate - b.rating.rate);
        break;
      case "rating-desc":
        filtered.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    setProducts(filtered);
  }, [allProducts, selectedCategory, sortOption, searchTerm]);
  if (!products) {
    return <p>Loading...</p>;
  } else {
    return (
      <div>
        <div className="flex justify-between items-center mb-10">
          <div id="filter" className="flex gap-1 flex-wrap">
            <label htmlFor="categoryFilter">Filter by Category:</label>
            <select
              id="categoryFilter"
              name="category"
              className="outline outline-gray-300"
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
            >
              <option value="all">All Categories</option>
              <option value="men's clothing">Men's Clothing</option>
              <option value="jewelery">Jewelery</option>
              <option value="electronics">Electronics</option>
              <option value="women's clothing">Women's Clothing</option>
            </select>
          </div>
          <div id="sorting" className="flex flex-wrap gap-1">
            <label htmlFor="sortProducts">Sort By:</label>
            <select
              id="sortProducts"
              name="sort"
              className="outline outline-gray-300"
              onChange={(e) => {
                setSortOption(e.target.value);
              }}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
        <main className="mb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center gap-5">
          {products?.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </main>
      </div>
    );
  }
};

export default ProductsGrid;
