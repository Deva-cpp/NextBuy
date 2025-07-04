import ProductsGrid from "./ProductsGrid";
import { useSearch } from "../context/searchContext";
const Home = () => {
  const { searchTerm, setSearchTerm } = useSearch();

  return (
    <div className="mx-auto max-w-screen-lg">
      <div className="relative h-70 rounded-b-lg bg-cover bg-center bg-no-repeat shadow-lg bg-[url(https://static.vecteezy.com/system/resources/previews/011/871/820/non_2x/online-shopping-on-phone-buy-sell-business-digital-web-banner-application-money-advertising-payment-ecommerce-illustration-search-vector.jpg)]">
        <div className="px-4 pt-8 pb-10">
          <div className="absolute inset-x-0 -bottom-10 mx-auto w-36 rounded-full border-8 border-white shadow-lg">
            <img
              className="mx-auto h-auto w-full rounded-full"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL3WPNP8xcWq9TwaYgOaIOlPm2u9NaRohiEEKLiHMqGJ2t94P2IfqtE138rbcGdcUAdNg"
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center flex-wrap gap-5 mt-20 mb-10 px-5 sm:px-10">
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold text-gray-800">
            Top Selling Products
          </h1>
          <p className="mt-2 text-gray-600">
            Discover our most popular items loved by customers for their
            quality, value, and performance. Don't miss out on these
            bestsellers!
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            className="outline-1 outline-sky-800 px-2 py-1 focus:outline-2 focus:outline-sky-950"
            placeholder="Search product"
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="px-5 sm:px-10">
        <ProductsGrid searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default Home;
