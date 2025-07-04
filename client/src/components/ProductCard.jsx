import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { addToCart, decrement, increment } from "../reducers/cartSlice";
import { FaCartPlus, FaHeart, FaMinus, FaPlus } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { addToWishList, removeFromWishList } from "../reducers/wishlistSlice";
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const cartQuantity = useSelector(
    (state) => state.cart.find((item) => item.id === product.id)?.quantity || 0
  );
  const wishlistQuantity = useSelector(
    (state) => state.wishlist.find((item) => item.id === product.id) || 0
  );
  return (
    <div className="relative flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md hover:scale-102 transition-all duration-200 ease-in-out">
      {wishlistQuantity < 1 ? (
        <button
          className="cursor-pointer absolute top-2 right-2"
          onClick={() => {
            dispatch(addToWishList(product));
          }}
        >
          <FaRegHeart className="text-red-700" />
        </button>
      ) : (
        <button
          className="cursor-pointer absolute top-2 right-2"
          onClick={() => {
            dispatch(removeFromWishList(product));
          }}
        >
          <FaHeart className="text-red-700" />
        </button>
      )}
      <Link
        className="mx-3 mt-3 flex justify-center h-60 overflow-hidden rounded-xl"
        to={`/product/${product.id}`}
      >
        <img
          className="object-contain"
          src={product.image}
          alt={product.title}
        />
      </Link>
      <div className="mt-4 px-5 pb-5">
        <Link to={`/product/${product.id}`}>
          <h5 className="text-lg tracking-tight text-sky-950">
            {product.title}
          </h5>
        </Link>
        <p>
          <span className="text-yellow-500 text-lg">
            {"★".repeat(Math.round(product.rating.rate))}
          </span>{" "}
          <span className="text-sm text-gray-600">({product.rating.count})</span>
        </p>
        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            <span className="text-lg font-bold text-sky-950">
              ${product.price}
            </span>
          </p>
        </div>
        {cartQuantity > 0 ? (
          <div className="sm:order-1">
            <div className="mx-auto flex h-8 items-stretch text-gray-600">
              <button
                className="flex items-center justify-center rounded-l-md text-sky-950 bg-sky-200 px-4 transition hover:bg-sky-300 cursor-pointer"
                onClick={() => {
                  dispatch(decrement(product));
                }}
              >
                <FaMinus className="text-xs" />
              </button>
              <div className="flex w-full items-center justify-center text-sky-950 font-medium bg-sky-100 px-4 text-sm uppercase transition">
                {cartQuantity}
              </div>
              <button
                className="flex items-center justify-center rounded-r-md text-sky-950 bg-sky-200 px-4 transition hover:bg-sky-300 cursor-pointer"
                onClick={() => {
                  dispatch(increment(product));
                }}
              >
                <FaPlus className="text-xs" />
              </button>
            </div>
          </div>
        ) : (
          <button
            className="w-full flex items-center justify-center rounded-md bg-sky-800 py-2 text-center text-sm gap-2 font-medium text-sky-50 hover:bg-sky-950 cursor-pointer"
            onClick={() => {
              dispatch(addToCart(product));
            }}
          >
            <FaCartPlus />
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
