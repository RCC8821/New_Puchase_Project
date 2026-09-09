import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const formApi = createApi({
  reducerPath: 'formApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://new-puchase-project-silk.vercel.app',
    // baseUrl: 'http://localhost:5001',
    prepareHeaders: (headers) => {
      // Agar token chahiye to yahan add karo
      // const token = localStorage.getItem('token');
      // if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  // ✅ Added 'LabourRequirements' here for auto-refreshing table
  tagTypes: ['SiteExpense', 'LabourRequest', 'ContractorDebit', 'CompanyLabour', 'LabourRequirements'],

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
    // 2️⃣  POST /api/labour-request  →  Sheet: Labour_Requirement
    // ============================================================
    postLabourRequest: builder.mutation({
      query: (payload) => ({
        url: '/api/labour-request',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourRequest', 'LabourRequirements'], // Invalidates so table updates immediately on new request
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
    postCompanyLabour: builder.mutation({
      query: (payload) => ({
        url: '/api/Company-labour',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['CompanyLabour'],
    }),

    // ============================================================
    // ✅ NEW - Office Labour Request (goes to Office_Labour_FMS sheet)
    // ============================================================
    postOfficeLabourRequest: builder.mutation({
      query: (payload) => ({
        url: '/api/office-labour-request',
        method: 'POST',
        body: payload,
      }),
    }),

    // ============================================================
    // ✅ NEW - Get Labour Requirements (pending, Status != Done)
    // ============================================================
    getLabourRequirements: builder.query({
      query: () => '/api/get-labour-requirements',
      providesTags: ['LabourRequirements'],
      transformResponse: (response) => response.data || [],
    }),

    // ============================================================
    // ✅ NEW - Update Labour Requirement (edit existing basic details)
    // ============================================================
    updateLabourRequirement: builder.mutation({
      query: (payload) => ({
        url: '/api/update-labour-requirement',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourRequirements'],
    }),

    // ============================================================
    // ✅ NEW - Submit to Labour_FMS (Direct Submit)
    // ============================================================
    submitToLabourFms: builder.mutation({
      query: (payload) => ({
        url: '/api/submit-to-labour-fms',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourRequirements'],
    }),

    // ============================================================
    // ✅ NEW - Update Labour Req Management (Modal Submit for Vinod)
    // Updates Columns W to AK and sets Q to "Done"
    // ============================================================
    updateLabourReqManagement: builder.mutation({
      query: (payload) => ({
        url: '/api/update-labour-req-management',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourRequirements'], // Refreshes table so hidden row disappears
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
  usePostOfficeLabourRequestMutation,   // Office Labour Request
  
  // Naye Labour Management (Vinod) wale hooks:
  useGetLabourRequirementsQuery,
  useUpdateLabourRequirementMutation,
  useSubmitToLabourFmsMutation,
  useUpdateLabourReqManagementMutation, // Modal Submit hook
} = formApi;