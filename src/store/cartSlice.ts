"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CartState = {
  selectedItemIds: number[]; 
};

const initialState: CartState = {
  selectedItemIds: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setSelectedItemIds(state, action: PayloadAction<number[]>) {
      state.selectedItemIds = action.payload;
    },

    toggleItem(state, action: PayloadAction<number>) {
      const id = action.payload;
      const exists = state.selectedItemIds.includes(id);
      state.selectedItemIds = exists
        ? state.selectedItemIds.filter((x) => x !== id)
        : [...state.selectedItemIds, id];
    },

    toggleAll(state, action: PayloadAction<{ allIds: number[] }>) {
      const { allIds } = action.payload;

      const allSelected =
        allIds.length > 0 &&
        allIds.every((id) => state.selectedItemIds.includes(id));

      state.selectedItemIds = allSelected ? [] : allIds;
    },

    syncSelectedWithCart(
      state,
      action: PayloadAction<{ existingIds: number[] }>,
    ) {
      const { existingIds } = action.payload;
      const set = new Set(existingIds);
      state.selectedItemIds = state.selectedItemIds.filter((id) => set.has(id));
    },

    clearSelected(state) {
      state.selectedItemIds = [];
    },
  },
});

export const {
  setSelectedItemIds,
  toggleItem,
  toggleAll,
  syncSelectedWithCart,
  clearSelected,
} = cartSlice.actions;

export default cartSlice.reducer;
