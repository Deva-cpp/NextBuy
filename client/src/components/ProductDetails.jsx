import { useParams } from "react-router-dom";
import useFetchAPI from "../hook/useFetchAPI";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, decrement, increment } from "../reducers/cartSlice";
import {
  FaHeart,
  FaMinus,
  FaPlus,
  FaRegHeart,
  FaShoppingCart,
} from "react-icons/fa";
import { addToWishList, removeFromWishList } from "../reducers/wishlistSlice";

const ProductDetails = () => {
  const params = useParams();
  const apiURL = `https://fakestoreapi.com/products/${params.id}`;
  const product = useFetchAPI(apiURL);
  const dispatch = useDispatch();
  const cartQuantity = useSelector(
    (state) =>
      state.cart.find((item) => item?.id === product?.id)?.quantity || 0
  );
  const wishlistQuantity = useSelector(
    (state) => state.wishlist.find((item) => item?.id === product?.id) || 0
  );
  if (!product) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 text-lg">Loading product details...</p>
      </div>
    );
  } else {
    return (
      <section className="my-10">
        <div className="m-4 mx-auto max-w-screen-lg rounded-md border border-gray-100 text-sky-950">
          <div className="relative flex h-full flex-col text-sky-950 md:flex-row">
            <div className="relative p-8 md:w-4/6 order-1">
              <div className="flex flex-col md:flex-row">
                <h2 className="mb-2 text-2xl font-black">{product.title}</h2>
              </div>
              <p>
                <span className="text-yellow-500">
                  {"★".repeat(Math.round(product.rating.rate))}
                </span>{" "}
                ({product.rating.count})
              </p>
              <p className="mt-3 font-sans text-base tracking-normal">
                {product.description}
              </p>
              <div className="flex flex-col md:flex-row md:items-end">
                <p className="mt-6 text-3xl font-black">${product.price}</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {cartQuantity < 1 ? (
                  <button
                    className="gap-2 flex cursor-pointer items-center justify-center rounded-md bg-sky-600 py-2 px-8 text-center text-white transition duration-150 ease-in-out hover:bg-sky-700"
                    onClick={() => {
                      dispatch(addToCart(product));
                    }}
                  >
                    <FaShoppingCart />
                    Add to cart
                  </button>
                ) : (
                  <div className="mr-2">
                    <div className="mx-auto flex h-10 items-stretch text-gray-600">
                      <button
                        className="flex items-center justify-center rounded-l-md text-sky-950 bg-sky-200 px-4 transition hover:bg-sky-300 cursor-pointer"
                        onClick={() => {
                          dispatch(decrement(product));
                        }}
                      >
                        <FaMinus className="text-sm" />
                      </button>
                      <div className="flex w-full items-center justify-center text-sky-950 font-bold bg-sky-100 px-4 text-md uppercase transition">
                        {cartQuantity}
                      </div>
                      <button
                        className="flex items-center justify-center rounded-r-md text-sky-950 bg-sky-200 px-4 transition hover:bg-sky-300 cursor-pointer"
                        onClick={() => {
                          dispatch(increment(product));
                        }}
                      >
                        <FaPlus className="text-sm" />
                      </button>
                    </div>
                  </div>
                )}
                {wishlistQuantity < 1 ? (
                  <button
                    className="order-2 gap-2 flex cursor-pointer items-center justify-center rounded-md bg-sky-100 py-2 px-8 text-center text-sky-950 transition duration-150 ease-in-out hover:bg-sky-200 border border-transparent hover:border-sky-200 hover:shadow"
                    onClick={() => {
                      dispatch(addToWishList(product));
                    }}
                  >
                    <FaRegHeart className="text-red-700" />
                    Add to wishlist
                  </button>
                ) : (
                  <button
                    className="order-2 gap-2 flex cursor-pointer items-center justify-center rounded-md bg-sky-100 py-2 px-8 text-center text-sky-950 transition duration-150 ease-in-out hover:bg-sky-200 border border-transparent hover:border-sky-200 hover:shadow"
                    onClick={() => {
                      dispatch(removeFromWishList(product));
                    }}
                  >
                    <FaHeart className="text-red-700" />
                    Remove from wishlist
                  </button>
                )}
              </div>
            </div>
            <div className="mx-auto flex items-center px-5 pt-1 md:p-8">
              <img
                className="block h-auto w-50"
                src={product.image}
                alt={product.title}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
};

export default ProductDetails;
