




// // advanceSlice.js

// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const advanceApi = createApi({
//   reducerPath: 'advanceApi',

//   baseQuery: fetchBaseQuery({
//     // baseUrl: 'https://new-puchase-project-silk.vercel.app',
//     baseUrl: 'http://localhost:5001',
//     prepareHeaders: (headers) => {
//       return headers;
//     },
//   }),

//   tagTypes: [
//     'AdvanceDropdown', 
//     'AdvancePayment', 
//     'AdvanceSalaryList', 
//     'SalaryDeductions'
//   ],

//   endpoints: (builder) => ({

//     // ── Dropdown Data Fetch ──────────────────────────────────────────
//     getAdvanceDropdownData: builder.query({
//       query: () => ({
//         url: '/api/advance/dropdown-data',
//         method: 'GET',
//       }),
//       providesTags: ['AdvanceDropdown'],
//     }),

//     // ── Submit Advance Payment ───────────────────────────────────────
//     postAdvancePayment: builder.mutation({
//       query: (payload) => ({
//         url: '/api/advance/submit-payment',
//         method: 'POST',
//         body: payload,
//       }),
//       invalidatesTags: ['AdvancePayment', 'AdvanceSalaryList'], // Clear cache to reload updated ledger amounts
//     }),

//     // ── Get Advance Salary Ledger List (A to I) ──────────────────────
//     getAdvanceSalaryList: builder.query({
//       query: () => ({
//         url: '/api/advance/advance-salary-list',
//         method: 'GET',
//       }),
//       providesTags: ['AdvanceSalaryList'],
//     }),

//     // ── Get All Salary Deductions (A to G) ───────────────────────────
//     getSalaryDeductions: builder.query({
//       query: () => ({
//         url: '/api/advance/salary-deductions',
//         method: 'GET',
//       }),
//       providesTags: ['SalaryDeductions'],
//     }),

//     // ── Save New Salary Deduction ────────────────────────────────────
//     deductSalary: builder.mutation({
//       query: (payload) => ({
//         url: '/api/advance/deduct-salary',
//         method: 'POST',
//         body: payload,
//       }),
//       // Invalidates tags so both list and deductions components auto-refresh with new data
//       invalidatesTags: ['AdvanceSalaryList', 'SalaryDeductions'],
//     }),

//   }),
// });

// // ============================================================
// // ✅ Hooks Export — Use these in your React Components
// // ============================================================
// export const {
//   useGetAdvanceDropdownDataQuery,   // Dropdown data fetch karne ke liye (A to D)
//   usePostAdvancePaymentMutation,    // Payment form submit karne ke liye
//   useGetAdvanceSalaryListQuery,     // Advance Salary Ledger fetch karne ke liye
//   useGetSalaryDeductionsQuery,      // Salary Deductions fetch karne ke liye
//   useDeductSalaryMutation,          // Nayi deduction save karne ke liye
// } = advanceApi;





// advanceSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const advanceApi = createApi({
  reducerPath: 'advanceApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://new-puchase-project-silk.vercel.app',
    // baseUrl: 'http://localhost:5001',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),

  tagTypes: [
    'AdvanceDropdown',
    'AdvancePayment',
    'AdvanceSalaryList',
    'SalaryDeductions',
    'PettyCashPersons',
    'PettyCashLedger',
    'PettyCashAll',
  ],

  endpoints: (builder) => ({

    // ── Dropdown Data Fetch ──────────────────────────────────────────
    getAdvanceDropdownData: builder.query({
      query: () => ({ url: '/api/advance/dropdown-data', method: 'GET' }),
      providesTags: ['AdvanceDropdown'],
    }),

    // ── Submit Advance Payment ───────────────────────────────────────
    postAdvancePayment: builder.mutation({
      query: (payload) => ({ url: '/api/advance/submit-payment', method: 'POST', body: payload }),
      invalidatesTags: ['AdvancePayment', 'AdvanceSalaryList', 'PettyCashPersons', 'PettyCashLedger', 'PettyCashAll'],
    }),

    // ── Get Advance Salary Ledger List (A to I) ──────────────────────
    getAdvanceSalaryList: builder.query({
      query: () => ({ url: '/api/advance/advance-salary-list', method: 'GET' }),
      providesTags: ['AdvanceSalaryList'],
    }),

    // ── Get All Salary Deductions (A to G) ───────────────────────────
    getSalaryDeductions: builder.query({
      query: () => ({ url: '/api/advance/salary-deductions', method: 'GET' }),
      providesTags: ['SalaryDeductions'],
    }),

    // ── Save New Salary Deduction ────────────────────────────────────
    deductSalary: builder.mutation({
      query: (payload) => ({ url: '/api/advance/deduct-salary', method: 'POST', body: payload }),
      invalidatesTags: ['AdvanceSalaryList', 'SalaryDeductions'],
    }),

    // ══════════════════════════════════════════════════════════════════
    // 🧾 ADVANCE PETTY CASH
    // ══════════════════════════════════════════════════════════════════

    getPettyCashPersons: builder.query({
      query: () => ({ url: '/api/advance/petty-cash/persons', method: 'GET' }),
      providesTags: ['PettyCashPersons'],
    }),

    getPettyCashLedger: builder.query({
      query: (name) => ({ url: '/api/advance/petty-cash/ledger', method: 'GET', params: { name } }),
      providesTags: ['PettyCashLedger'],
    }),

    getPettyCashAll: builder.query({
      query: () => ({ url: '/api/advance/petty-cash/all', method: 'GET' }),
      providesTags: ['PettyCashAll'],
    }),

    postPettyCashBill: builder.mutation({
      query: (payload) => ({ url: '/api/advance/petty-cash/bill-entry', method: 'POST', body: payload }),
      invalidatesTags: ['PettyCashLedger', 'PettyCashAll'],
    }),

    updatePettyCashStatus: builder.mutation({
      query: (payload) => ({ url: '/api/advance/petty-cash/update-status', method: 'POST', body: payload }),
      invalidatesTags: ['PettyCashLedger', 'PettyCashAll'],
    }),

  }),
});

export const {
  useGetAdvanceDropdownDataQuery,
  usePostAdvancePaymentMutation,
  useGetAdvanceSalaryListQuery,
  useGetSalaryDeductionsQuery,
  useDeductSalaryMutation,
  useGetPettyCashPersonsQuery,      // Admin dropdown
  useGetPettyCashLedgerQuery,       // Ek person ka data
  useGetPettyCashAllQuery,          // Senior: sabka data
  usePostPettyCashBillMutation,     // Bill save
  useUpdatePettyCashStatusMutation, // Done / Reject
} = advanceApi;