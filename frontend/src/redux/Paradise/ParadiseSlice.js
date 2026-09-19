// frontend/src/redux/Paradise/ParadiseSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const paradiseApi = createApi({
  reducerPath: 'paradiseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL,
    prepareHeaders: (headers) => headers,
  }),
  tagTypes: ['ParadiseProjectData', 'ParadiseStoreInventory', 'ParadiseBOQQty'],
  endpoints: (builder) => ({
    // ✅ Out Form Dropdown source API
    getParadiseProjectData: builder.query({
      query: () => '/api/paradise/project-data',
      providesTags: ['ParadiseProjectData'],
    }),

    getParadiseStoreInventory: builder.query({
      query: () => '/api/paradise/store-inventory',
      providesTags: ['ParadiseStoreInventory'],
    }),

    getParadiseBOQQty: builder.query({
      query: () => '/api/paradise/boq-qty',
      providesTags: ['ParadiseBOQQty'],
    }),

    // ✅ NEW - Submit Requirement for Paradise
    submitParadiseRequirement: builder.mutation({
      query: (payload) => ({
        url: '/api/paradise/submit-requirement',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['ParadiseStoreInventory', 'ParadiseBOQQty'],
    }),
  }),
});

export const {
  useGetParadiseProjectDataQuery,
  useGetParadiseStoreInventoryQuery,
  useGetParadiseBOQQtyQuery,
  useSubmitParadiseRequirementMutation, // ✅ Export mutation
} = paradiseApi;