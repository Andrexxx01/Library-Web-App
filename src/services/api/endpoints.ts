export const ENDPOINTS = {
  // ===== AUTH =====
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },

  // ===== USER (BOOKS) =====
  books: {
    list: "/api/books",
    detail: (bookId: number) => `/api/books/${bookId}`,
    recommend: "/api/books/recommend",
  },

  // ===== AUTHOR (BOOKS) =====
  author: {
    list: "/api/authors",
    popular: "/api/authors/popular",
    bookFilter: (authorId: number) => `/api/authors/${authorId}/books`,
  },

  // ===== CATEGORIES (BOOKS) =====
  categories: {
    list: "/api/categories",
  },

  // ===== LOANS =====
  loans: {
    myLoans: "/api/loans/my",
    borrow: "/api/loans",
    return: (loanId: number) => `/api/loans/${loanId}/return`,
    confirmFromCart: "/api/loans/from-cart",
  },

  // ===== PROFILE =====
  profile: {
    me: "/api/me",
    update: "/api/me",
    allReview: "/api/me/reviews",
    allLoan: "/api/me/loans",
  },

  // ===== REVIEWS =====
  reviews: {
    listByBook: (bookId: number) => `/api/reviews/book/${bookId}`,
    create: "/api/reviews",
    delete: (reviewId: number) => `/api/reviews/${reviewId}`,
  },

  // ===== Cart =====
  cart: {
    list: "/api/cart",
    clearCart: "/api/cart",
    checkout: "/api/cart/checkout",
    addItem: "/api/cart/items",
    deleteItem: (cartItemId: number) => `/api/cart/items/${cartItemId}`,
  },

  // ===== ADMIN =====
  admin: {
    books: {
      list: "/api/admin/books",
      create: "/api/books",
      update: (id: number) => `/api/books/${id}`,
      delete: (id: number) => `/api/books/${id}`,
    },
    authors: {
      create: "/api/authors",
      update: (authorId: number) => `/api/authors/${authorId}`,
      delete: (authorId: number) => `/api/authors/${authorId}`,
    },
    categories: {
      create: "/api/categories",
      update: (categoryId: number) => `/api/categories/${categoryId}`,
      delete: (categoryId: number) => `/api/categories/${categoryId}`,
    },
    loans: {
      list: "/api/admin/loans",
      create: "/api/admin/loans",
      update: (loanId: number) => `/api/admin/loans/${loanId}`,
    },
    overdue: {
      list: "/api/admin/loans/overdue",
    },
    overview: {
      list: "/api/admin/overview",
    },
    users: {
      list: "/api/admin/users",
    },
  },
} as const;
