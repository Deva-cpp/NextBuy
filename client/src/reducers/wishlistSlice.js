import { createSlice } from "@reduxjs/toolkit";
export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: [],
  reducers: {
    addToWishList: (state, action) => {
      state.push(action.payload);
    },
    removeFromWishList: (state, action) => {
      const product = state.find((item) => item.id === action.payload.id);
      if (product) {
        const index = state.indexOf(product);
        state.splice(index, 1);
      }
    },
    clearWishList: () => {
      return [];
    },
  },
});
export const { addToWishList, removeFromWishList, clearWishList } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
