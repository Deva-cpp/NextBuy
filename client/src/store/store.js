import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartSlice from "../reducers/cartSlice";
import wishlistSlice from "../reducers/wishlistSlice";
export const rootReducer = combineReducers({
  cart: cartSlice,
  wishlist: wishlistSlice,
});
const user = JSON.parse(localStorage.getItem("user"));
const userId = user?._id;
const persistConfig = {
  key: `user_${userId}`,
  storage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
const persistor = persistStore(store);
export { store, persistor };
