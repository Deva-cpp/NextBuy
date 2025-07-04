import { createSlice } from "@reduxjs/toolkit";
export const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const product = state.find((product) => product.id === action.payload.id);
      if (product) {
        product.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
    },
    increment: (state, action) => {
      const product = state.find((product) => product.id === action.payload.id);
      product.quantity += 1;
    },
    decrement: (state, action) => {
      const product = state.find((product) => product.id === action.payload.id);
      if (product.quantity > 1) {
        product.quantity -= 1;
      } else {
        const index = state.indexOf(product);
        state.splice(index, 1);
      }
    },
    clearProduct: (state, action) => {
      const product = state.find((product) => product.id === action.payload.id);
      const index = state.indexOf(product);
      state.splice(index, 1);
    },
    clearCart: () => {
      return [];
    },
  },
});
export const { addToCart, increment, decrement, clearProduct, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
