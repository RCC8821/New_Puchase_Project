



import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const formApi = createApi({
  reducerPath: 'formApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://new-puchase-project-silk.vercel.app',
    // baseUrl: 'http://localhost:5000',
    prepareHeaders: (headers) => {
      // Agar token chahiye to yahan add karo
      // const token = localStorage.getItem('token');
      // if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['SiteExpense', 'LabourRequest', 'ContractorDebit', 'CompanyLabour'],

  endpoints: (builder) => ({

    // ============================================================
    // 1️⃣  POST /api/site-expense  →  Sheet: Site_Exp_FMS
    // ============================================================
    postSiteExpense: builder.mutation({
      query: (payload) => ({
        url: '/api/site-expense',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SiteExpense'],
    }),

    // ============================================================
    // 2️⃣  POST /api/labour-request  →  Sheet: Labour_FMS
    // ============================================================
    postLabourRequest: builder.mutation({
      query: (payload) => ({
        url: '/api/labour-request',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourRequest'],
    }),

    // ============================================================
    // 3️⃣  POST /api/contractor-debit  →  Sheet: Contractor_Debit_FMS
    // ============================================================
    postContractorDebit: builder.mutation({
      query: (payload) => ({
        url: '/api/contractor-debit',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['ContractorDebit'],
    }),

    // ============================================================
    // 4️⃣  GET /api/Company-labour-dropdowns  →  Dropdowns fetch
    // ============================================================
    // Response:
    // {
    //   success: true,
    //   data: {
    //     projectNames: [...],
    //     projectEngineers: [...],
    //     labourNames: [...],
    //     workTypes: [...],
    //     contractorNames: [...],
    //     contractorFirmNames: [...],
    //     projectEngineerMap: { "Project A": "Engineer X", ... },
    //     contractorFirmMap: { "Contractor A": "Firm X", ... }
    //   }
    // }
    getCompanyLabourDropdowns: builder.query({
      query: () => ({
        url: '/api/Company-labour-dropdowns',
        method: 'GET',
      }),
      providesTags: ['CompanyLabour'],
    }),

    // ============================================================
    // 5️⃣  POST /api/Company-labour  →  Sheet: Labour_Attedace_FMS
    // ============================================================
    // Payload:
    // {
    //   Work_Date_1: '',                    ← REQUIRED
    //   Project_Name_1: '',                 ← REQUIRED
    //   Project_Engineer_1: '',
    //   Labour_Name_1: '',                  ← REQUIRED
    //   Day_Night_1: '',                    (Day / Night)
    //   Day_Attendance_1: '',               (Full / Half / Absent)
    //   Work_Type_1: '',
    //   Work_Description_1: '',
    //   Head_Of_Contractor_Company_1: '',
    //   Name_Of_Contractor_1: '',
    //   Contractor_Firm_Name_1: '',
    //   Remark_1: '',
    // }
    // Backend khud UID (LATT0001...) generate karta hai
    postCompanyLabour: builder.mutation({
      query: (payload) => ({
        url: '/api/Company-labour',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['CompanyLabour'],
    }),

  }),
});

// ============================================================
// ✅ Hooks Export
// ============================================================
export const {
  usePostSiteExpenseMutation,           // Site Expense form
  usePostLabourRequestMutation,         // Labour Request form
  usePostContractorDebitMutation,       // Contractor Debit form
  useGetCompanyLabourDropdownsQuery,    // Company Labour dropdowns (GET)
  usePostCompanyLabourMutation,         // Company Labour Attendance (POST)
} = formApi;