// 📁 src/redux/Signature/SignatureSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const signatureApi = createApi({
  reducerPath: 'signatureApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/signature`,
    // ✅ baseUrl me /api/signature already hai
  }),
  tagTypes: ['SignatureData'],
  endpoints: (builder) => ({

    // ✅ /api/signature/project-data
    getSignatureProjectData: builder.query({
      query: () => '/project-data',
      providesTags: ['SignatureData'],
    }),

    // ✅ /api/signature/submit-requirement
    submitSignatureRequirement: builder.mutation({
      query: (formPayload) => ({
        url: '/submit-requirement',
        method: 'POST',
        body: formPayload,
      }),
    }),

  }),
});

export const {
  useGetSignatureProjectDataQuery,
  useSubmitSignatureRequirementMutation,
} = signatureApi;