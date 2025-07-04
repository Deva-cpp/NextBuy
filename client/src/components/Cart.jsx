import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  decrement,
  increment,
  clearProduct,
} from "../reducers/cartSlice";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaMinus,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productsInCart = useSelector((state) => state.cart);
  const totalProducts = productsInCart.reduce(
    (total, product) => total + product.quantity,
    0
  );
  const totalPrice = productsInCart.reduce(
    (total, product) => total + product.quantity * product.price,
    0
  );
  const shippingCharge = 8;
  if (productsInCart.length < 1) {
    return (
      <p className="text-center mt-10 text-2xl font-medium text-sky-950">
        Your cart is empty
      </p>
    );
  } else {
    return (
      <section className="h-full bg-gray-100 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-sky-950">
                Your Cart{" "}
                <span className="text-sm text-sky-900">
                  ({totalProducts} items)
                </span>
              </h1>
              <button
                className="font-semibold text-sm text-red-600 cursor-pointer px-2 py-1 rounded-sm hover:underline transition-all duration-200 ease-in-out"
                onClick={() => {
                  dispatch(clearCart());
                }}
              >
                Clear Cart
              </button>
            </div>
            <div className="bg-white shadow mt-5">
              <div className="px-4 py-6 sm:px-8 sm:py-10">
                <div className="flow-root">
                  <ul className="-my-8">
                    {productsInCart?.map((product) => (
                      <li
                        className="flex flex-col space-y-3 py-6 text-left sm:flex-row sm:space-x-5 sm:space-y-0"
                        key={product.id}
                      >
                        <div className="shrink-0 w-24 h-24">
                          <img
                            className="w-full h-full rounded-lg object-contain"
                            src={product.image}
                            alt={product.title}
                          />
                        </div>

                        <div className="relative flex flex-1 flex-col justify-between">
                          <div className="sm:col-gap-5 sm:grid sm:grid-cols-2">
                            <div className="pr-8 sm:pr-5">
                              <p className="text-base font-semibold text-sky-950">
                                {product.title}
                              </p>
                              <p className="mx-0 mt-1 mb-0 text-sm text-sky-700 font-medium">
                                ${product.price}
                              </p>
                            </div>

                            <div className="mt-4 flex items-end justify-between sm:mt-0 sm:items-start sm:justify-end">
                              <p className="shrink-0 w-20 text-base font-semibold text-sky-900 sm:order-2 sm:ml-8 sm:text-right">
                                ${(product.price * product.quantity).toFixed(2)}
                              </p>

                              <div className="sm:order-1">
                                <div className="mx-auto flex h-8 items-stretch text-sky-950">
                                  <button
                                    className="flex items-center justify-center rounded-l-md bg-sky-200 px-4 transition hover:bg-sky-300 cursor-pointer"
                                    onClick={() => {
                                      dispatch(decrement(product));
                                    }}
                                  >
                                    <FaMinus className="text-xs" />
                                  </button>
                                  <div className="flex w-full items-center justify-center bg-sky-100 px-4 text-sm font-medium uppercase transition">
                                    {product.quantity}
                                  </div>
                                  <button
                                    className="flex items-center justify-center rounded-r-md bg-sky-200 px-4 transition hover:bg-sky-300 cursor-pointer"
                                    onClick={() => {
                                      dispatch(increment(product));
                                    }}
                                  >
                                    <FaPlus className="text-xs" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="absolute top-0 right-0 flex sm:bottom-0 sm:top-auto">
                            <button
                              type="button"
                              className="flex rounded p-2 text-center text-sky-950 transition-all duration-200 ease-in-out focus:shadow cursor-pointer hover:text-red-600 font-black"
                              onClick={() => {
                                dispatch(clearProduct(product));
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

                <div className="mt-6 border-t border-b py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-md text-sky-950 font-medium">Subtotal</p>
                    <p className="text-lg font-semibold text-sky-900">
                      ${totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-md text-sky-950 font-medium">Shipping</p>
                    <p className="text-lg font-semibold text-sky-900">
                      ${shippingCharge}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xl font-medium text-sky-950">Total</p>
                  <p className="text-2xl font-semibold text-sky-900">
                    ${(totalPrice + shippingCharge).toFixed(2)}
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-800 px-6 py-4 text-lg font-semibold text-sky-50 transition-all duration-200 ease-in-out focus:shadow hover:bg-sky-950 cursor-pointer hover:gap-4"
                    onClick={() => {
                      navigate("/checkout");
                    }}
                  >
                    Proceed to checkout
                    <FaArrowRight className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
};

export default Cart;
