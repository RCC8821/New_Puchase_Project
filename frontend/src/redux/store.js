
// import { configureStore } from '@reduxjs/toolkit';
// import { labourApi } from '../redux/Labour/LabourSlice';
// import { formApi } from '../redux/formSlice';
// import { siteExpensesApi } from '../redux/SiteExpenses/SiteExpensesSlice';
// import { advanceApi } from '../redux/advanceSlice';

// // ✅ NEW
// import { signatureApi } from '../redux/Signature/SignatureSlice';

// export const store = configureStore({
//   reducer: {
//     [labourApi.reducerPath]: labourApi.reducer,
//     [formApi.reducerPath]: formApi.reducer,
//     [siteExpensesApi.reducerPath]: siteExpensesApi.reducer,
//     [advanceApi.reducerPath]: advanceApi.reducer,

//     // ✅ NEW
//     [signatureApi.reducerPath]: signatureApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware()
//       .concat(labourApi.middleware)
//       .concat(formApi.middleware)
//       .concat(siteExpensesApi.middleware)
//       .concat(advanceApi.middleware)

//       // ✅ NEW
//       .concat(signatureApi.middleware),
// });


import { configureStore } from '@reduxjs/toolkit';
import { labourApi } from '../redux/Labour/LabourSlice';
import { formApi } from '../redux/formSlice';
import { siteExpensesApi } from '../redux/SiteExpenses/SiteExpensesSlice';
import { advanceApi } from '../redux/advanceSlice';
import { signatureApi } from '../redux/Signature/SignatureSlice';

// ✅ NEW - Heritage Requirement API
import { heritageRequirementApi } from '../redux/heritageRequirementSlice';

export const store = configureStore({
  reducer: {
    [labourApi.reducerPath]: labourApi.reducer,
    [formApi.reducerPath]: formApi.reducer,
    [siteExpensesApi.reducerPath]: siteExpensesApi.reducer,
    [advanceApi.reducerPath]: advanceApi.reducer,
    [signatureApi.reducerPath]: signatureApi.reducer,

    // ✅ NEW
    [heritageRequirementApi.reducerPath]: heritageRequirementApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(labourApi.middleware)
      .concat(formApi.middleware)
      .concat(siteExpensesApi.middleware)
      .concat(advanceApi.middleware)
      .concat(signatureApi.middleware)

      // ✅ NEW
      .concat(heritageRequirementApi.middleware),
});