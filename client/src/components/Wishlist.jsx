import { useDispatch, useSelector } from "react-redux";
import { clearWishList, removeFromWishList } from "../reducers/wishlistSlice";
import { addToCart } from "../reducers/cartSlice";
import { FaTimes } from "react-icons/fa";
const Wishlist = () => {
  const wishListProducts = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();


  if (wishListProducts.length < 1) {
    return (
      <p className="text-center mt-10 text-xl font-medium text-sky-950">
        Your wishlist is empty
      </p>
    );
  } else {
    return (
      <section className="h-screen bg-gray-100 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="flex justify-between items-end">
              <h1 className="text-2xl font-semibold flex flex-wrap justify-start gap-1 items-baseline text-sky-950">
                Your Wishlist{" "}
                <span className="text-sm text-sky-900">
                  ({wishListProducts.length} products)
                </span>
              </h1>
              <button
                className="font-semibold text-xs text-red-600 cursor-pointer px-2 py-1 rounded-sm hover:underline transition-all duration-200 ease-in-out"
                onClick={() => {
                  dispatch(clearWishList());
                }}
              >
                Clear Wishlist
              </button>
            </div>
            <div className="bg-white shadow mt-5">
              <div className="px-4 py-6 sm:px-8 sm:py-10">
                <div className="flow-root">
                  <ul className="-my-8">
                    {wishListProducts.map((product) => (
                      <li
                        className="flex flex-col space-y-3 py-6 text-left sm:flex-row sm:space-x-5 sm:space-y-0"
                        key={product.id}
                      >
                        <div className="shrink-0 h-24 w-24">
                          <img
                            className="h-full w-full rounded-lg object-contain"
                            src={product.image}
                            alt={product.title}
                          />
                        </div>

                        <div className="relative flex flex-1 flex-col justify-between">
                          <div className="sm:col-gap-5 sm:grid sm:grid-cols-2">
                            <div className="pr-8 sm:pr-5">
                              <p className="text-base font-semibold text-gray-900">
                                {product.title}
                              </p>
                              <p className="mx-0 mt-1 mb-0 text-md text-sky-700 font-medium">
                                ${product.price}
                              </p>
                            </div>
                          </div>
                          <div className="sm:absolute sm:top-0 sm:right-0 flex justify-between gap-5 mt-5">
                            <button
                              className="rounded-md bg-sky-800 px-2 text-center text-xs font-medium text-sky-50 hover:bg-sky-950 cursor-pointer"
                              onClick={() => {
                                dispatch(addToCart(product));
                                dispatch(removeFromWishList(product));
                              }}
                            >
                              Add to cart
                            </button>
                            <button
                              type="button"
                              className="flex rounded p-2 text-center text-gray-500 transition-all duration-200 ease-in-out focus:shadow hover:text-red-700 cursor-pointer"
                              onClick={() => {
                                dispatch(removeFromWishList(product));
                              }}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
};

export default Wishlist;
