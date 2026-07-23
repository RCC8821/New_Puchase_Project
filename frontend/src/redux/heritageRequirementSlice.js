import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const heritageRequirementApi = createApi({
  reducerPath: 'heritageRequirementApi',

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL,
    prepareHeaders: (headers) => headers,
  }),

  tagTypes: ['HeritageProjectData', 'HeritageRequirement'],

  endpoints: (builder) => ({
    getHeritageProjectData: builder.query({
      query: () => ({
        url: '/api/heritage-requirement/project-data',
        method: 'GET',
      }),
      providesTags: ['HeritageProjectData'],
    }),

    submitHeritageRequirement: builder.mutation({
      query: (payload) => ({
        url: '/api/heritage-requirement/submit',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['HeritageRequirement'],
    }),
  }),
});

export const {
  useGetHeritageProjectDataQuery,
  useSubmitHeritageRequirementMutation,
} = heritageRequirementApi;