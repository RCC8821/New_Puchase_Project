
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const labourApi = createApi({
  reducerPath: 'labourApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://new-puchase-project-silk.vercel.app',
    // baseUrl: 'http://localhost:5001',
    prepareHeaders: (headers) => {
    
      return headers;
    },
  }),

  tagTypes: [
    'LabourApprove',
    'LabourManagement',
    'AshokApproval',
    'PaidStep',
    'ProjectDropdown',
    'LabourAttendance',
    'AttendanceApproval',   // ✅ NEW
  ],

  endpoints: (builder) => ({

    // ═══════════════════════════════════════════════════════
    // GET APIs
    // ═══════════════════════════════════════════════════════

    // 🆕 Get Project Dropdown List
    getProjectDropdown: builder.query({
      query: () => '/api/labour/get-project-dropdown',
      providesTags: ['ProjectDropdown'],
      transformResponse: (response) => response.data || [],
    }),

    // 1️⃣ Get Labour Approve List
    getLabourApprove: builder.query({
      query: () => '/api/labour/get-Labour-Approve',
      providesTags: ['LabourApprove'],
      transformResponse: (response) => response.data || [],
    }),

    // 2️⃣ Get Labour Management List
    getLabourManagement: builder.query({
      query: () => '/api/labour/get-Labour-management',
      providesTags: ['LabourManagement'],
      transformResponse: (response) => response.data || [],
    }),

    // 3️⃣ Get Ashok Sir Approval List
    getApprovelAshokSir: builder.query({
      query: () => '/api/labour/get-Approvel-ashokSir',
      providesTags: ['AshokApproval'],
      transformResponse: (response) => response.data || [],
    }),

    // 4️⃣ Get Paid Step List
    getPaidStep: builder.query({
      query: () => '/api/labour/get-paid-step',
      providesTags: ['PaidStep'],
      transformResponse: (response) => response.data || [],
    }),

    // 5️⃣ Get Labour Attendance (with stats)
    // Response: { count, stats, data: [...] }
    // ✅ UPDATED - Ab approval fields bhi milte hain:
    //   status2, approvedHead2, nameOfContractor2, 
    //   contractorFirmName2, remark2, planned2, actual2, timeDelay2
    getLabourAttendance: builder.query({
      query: () => '/api/labour/get-Labour-Attendance',
      providesTags: ['LabourAttendance', 'AttendanceApproval'],
      transformResponse: (response) => ({
        count : response.count || 0,
        stats : response.stats || {},
        data  : response.data  || [],
      }),
    }),

    // ═══════════════════════════════════════════════════════
    // POST APIs (Mutations)
    // ═══════════════════════════════════════════════════════

    // 1️⃣ Post Labour Approval 1
    postLabourApproval1: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Post-labour-Approvel-1',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourApprove', 'LabourManagement'],
    }),

    // 2️⃣ Post Labour Management
    postLabourManagement: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Post-labour-management',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourManagement', 'AshokApproval'],
    }),

    // 3️⃣ Post Labour Approval Ashok Sir
    postLabourApprovalAshokSir: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Post-labour-Approvel-AshokSir',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['AshokApproval', 'PaidStep'],
    }),

    // 4️⃣ Post Labour Paid
    postLabourPaid: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Post-labour-Paid',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PaidStep'],
    }),

    
    updateLabourAttendance: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Update-Labour-Attendance',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourAttendance', 'AttendanceApproval'],
    }),

   
    updateAttendanceApproval: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Update-Labour-Attendance-Approval',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourAttendance', 'AttendanceApproval'],
    }),

  }),
});

// ═══════════════════════════════════════════════════════════
// ✅ Auto-generated hooks export
// ═══════════════════════════════════════════════════════════
export const {
  // ── Query hooks (GET) ──
  useGetProjectDropdownQuery,
  useGetLabourApproveQuery,
  useGetLabourManagementQuery,
  useGetApprovelAshokSirQuery,
  useGetPaidStepQuery,
  useGetLabourAttendanceQuery,

  // ── Lazy query hooks (manual trigger) ──
  useLazyGetProjectDropdownQuery,
  useLazyGetLabourApproveQuery,
  useLazyGetLabourManagementQuery,
  useLazyGetApprovelAshokSirQuery,
  useLazyGetPaidStepQuery,
  useLazyGetLabourAttendanceQuery,

  // ── Mutation hooks (POST) ──
  usePostLabourApproval1Mutation,
  usePostLabourManagementMutation,
  usePostLabourApprovalAshokSirMutation,
  usePostLabourPaidMutation,
  useUpdateLabourAttendanceMutation,
  useUpdateAttendanceApprovalMutation,   // ✅ NEW
} = labourApi;