// import { configureStore } from '@reduxjs/toolkit';
// import { labourApi } from '../redux/Labour/LabourSlice';
// import { formApi } from '../redux/formSlice';
// import {siteExpensesApi} from '../redux/SiteExpenses/SiteExpensesSlice'
//  import   {advanceApi} from '../redux/advanceSlice'
// export const store = configureStore({
//   reducer: {
//     [labourApi.reducerPath]: labourApi.reducer,
//     [formApi.reducerPath]: formApi.reducer,
//     [siteExpensesApi.reducerPath]: siteExpensesApi.reducer,
//     [advanceApi.reducerPath]: advanceApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware()
//   .concat(labourApi.middleware)
//   .concat(formApi.middleware)
//   .concat(siteExpensesApi.middleware)
//   .concat(advanceApi.middleware),
// });






import { configureStore } from '@reduxjs/toolkit';
import { labourApi } from '../redux/Labour/LabourSlice';
import { formApi } from '../redux/formSlice';
import { siteExpensesApi } from '../redux/SiteExpenses/SiteExpensesSlice';
import { advanceApi } from '../redux/advanceSlice';

// ✅ NEW
import { signatureApi } from '../redux/Signature/SignatureSlice';

export const store = configureStore({
  reducer: {
    [labourApi.reducerPath]: labourApi.reducer,
    [formApi.reducerPath]: formApi.reducer,
    [siteExpensesApi.reducerPath]: siteExpensesApi.reducer,
    [advanceApi.reducerPath]: advanceApi.reducer,

    // ✅ NEW
    [signatureApi.reducerPath]: signatureApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(labourApi.middleware)
      .concat(formApi.middleware)
      .concat(siteExpensesApi.middleware)
      .concat(advanceApi.middleware)

      // ✅ NEW
      .concat(signatureApi.middleware),
});