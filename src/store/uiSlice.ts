import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UiState, SortBy, RatingFilter, FilterBy } from "@/types/ui";
import type { BookCategory } from "@/constants/categories";

const initialState: UiState = {
    search: "",
    sortBy: "RELEVANCE",
    category: null,
    author: "",
    minRating: null,
    page: 1,
    pageSize: 10,
    filterBy: "ALL",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    clearSearch: (state) => {
      state.search = "";
      state.page = 1;
    },
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setCategory: (state, action: PayloadAction<BookCategory | null>) => {
      state.category = action.payload;
      state.page = 1;
    },
    setAuthor: (state, action: PayloadAction<string>) => {
      state.author = action.payload;
      state.page = 1;
    },
    setMinRating: (state, action: PayloadAction<RatingFilter | null>) => {
      state.minRating = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    setFilterBy: (state, action: PayloadAction<FilterBy>) => {
      state.filterBy = action.payload;
      state.page = 1;
    },

    resetFilters: (state) => {
      state.search = "";
      state.sortBy = "RELEVANCE";
      state.category = null;
      state.author = "";
      state.minRating = null;
      state.page = 1;
      state.pageSize = 10;
      state.filterBy = "ALL";
    },
  },
});

export const {
    setSearch,
    clearSearch,
    setSortBy,
    setCategory,
    setAuthor,
    setMinRating,
    setPage,
    setPageSize,
    setFilterBy,
    resetFilters,
} = uiSlice.actions;

export default uiSlice.reducer;