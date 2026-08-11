
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const labourApi = createApi({
  reducerPath: 'labourApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://purchase-project-3iia.vercel.app',
    // baseUrl: 'http://localhost:5000',
    prepareHeaders: (headers) => {
      // Agar token chahiye to yahan add karo
      // const token = localStorage.getItem('token');
      // if (token) {
      //   headers.set('Authorization', `Bearer ${token}`);
      // }
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

    // 5️⃣ Update Labour Attendance (form re-edit by UID)
    // Payload:
    // {
    //   uid: 'LATT0001',                       ← REQUIRED
    //   Work_Date_1: '',
    //   Project_Name_1: '',
    //   Project_Engineer_1: '',
    //   Labour_Name_1: '',
    //   Day_Night_1: '',
    //   Day_Attendance_1: '',
    //   Work_Type_1: '',
    //   Work_Description_1: '',
    //   Head_Of_Contractor_Company_1: '',
    //   Name_Of_Contractor_1: '',
    //   Contractor_Firm_Name_1: '',
    //   Remark_1: '',
    // }
    updateLabourAttendance: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Update-Labour-Attendance',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourAttendance', 'AttendanceApproval'],
    }),

    // ✅ 6️⃣ NEW - Update Attendance Approval (R to W columns)
    // Payload:
    // {
    //   uid: 'LATT0001',                       ← REQUIRED
    //   Status_2: 'Approved' | 'Reject',       ← required
    //   Approved_Head_2: 'Company Head' | 'Contractor Head',
    //   Name_Of_Contractor_2: '',              (if Contractor Head)
    //   Contractor_Firm_Name_2: '',            (auto-filled)
    //   Remark_2: '',
    // }
    // Backend Column Mapping:
    //   R - Status_2
    //   T - Approved_Head_2
    //   U - Name_Of_Contractor_2
    //   V - Contractor_Firm_Name_2
    //   W - Remark_2
    // (Columns P, Q, S are auto-generated by formulas — skipped)
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