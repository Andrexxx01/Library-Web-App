export const ENDPOINTS = {
  // ===== AUTH =====
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },

  // ===== USER (BOOKS) =====
  books: {
    list: "/books",
    detail: (id: string) => `/books/${id}`,
    reviews: (bookId: string) => `/books/${bookId}/reviews`,
  },

  // ===== LOANS =====
  loans: {
    myLoans: "/loans/me",
    borrow: "/loans/borrow",
    return: (loanId: string) => `/loans/${loanId}/return`,
  },

  // ===== ADMIN =====
  admin: {
    books: {
      list: "/admin/books",
      create: "/admin/books",
      delete: (id: string) => `/admin/books/${id}`,
    },
    loans: {
      list: "/admin/loans",
    },
    users: {
      list: "/admin/users",
    },
  },
} as const;
