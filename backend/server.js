


const express = require('express');
const { google } = require('googleapis');
const { validateEnv } = require('./config/env');
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

// ===== Routes =====
const authRoutes = require('./routes/auth');
const AllFMS = require('./All_Fms_Api/RequirementForm');
const AllFMSData = require('./All_Fms_Api/All_Fms');
const IndentData = require("./All_Fms_Api/Indent");
const TakeQuotation = require("./All_Fms_Api/Take_Quotation");
const ApprovalQuotation = require('./All_Fms_Api/Approval_Quotation');
const PO = require("./All_Fms_Api/PO");
const vendorFollowUpMaterial = require("./All_Fms_Api/Vendor_FollowUp_Material");
const MaterialReceived = require('./All_Fms_Api/Material_Received');
const FinalMaterial = require('./All_Fms_Api/Final_Material');
const MRNDATA = require("./All_Fms_Api/MRN");
const VendorFollowupBlling = require("./All_Fms_Api/Vendor_Followup_Billing");
const BillProcessing = require("./All_Fms_Api/Bill_Processing");
const Bill_Checked = require('./All_Fms_Api/Bill_Checked');
const Bill_Tally = require('./All_Fms_Api/BILL_TALLY_ENTRY');
const Payment = require('./All_Fms_Api/Payment');
const Bill_Checked_Step18 = require('./All_Fms_Api/BILL _CHECKD_18Step');
const contractorForm = require('./All_Fms_Api/ContractorForm/ContractorForm');

// Site Expenses
const Form = require('./SiteExpenses/SiteExpensesForm');
const DebitApprovel1 = require('./SiteExpenses/Debit/DebitApprovel1');
const SiteApprovels = require('./SiteExpenses/SiteExpenses/SiteApprovels');
const LabourApprovel = require("./SiteExpenses/Labour/LabourExpenses");
const LabourPDF = require('./SiteExpenses/Labour/PDFGenerate');

// Other
const OutStanding = require('./All_Fms_Api/OutStanding');
const Advancesection = require('./All_Fms_Api/Advance_payment');
const SignatureRequirement = require('./All_Fms_Api/signatureRoutes');
const HeritageRequirement = require('./All_Fms_Api/heritageRequirement');

const app = express();

// ===== 1. CORS (sabse pehle) =====
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); // sab origins allow
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ===== 2. Body Parsers =====
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// ===== 3. Env validate =====
validateEnv();

// ===== 4. Cloudinary =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===== 5. Test route =====
app.get('/', (req, res) => {
  res.send('✅ Backend server is running!');
});

// ===== 6. API Routes =====
app.use('/api', authRoutes);
app.use('/api', AllFMS);
app.use('/api', AllFMSData);
app.use('/api', IndentData);
app.use('/api', TakeQuotation);
app.use('/api', ApprovalQuotation);
app.use('/api', PO);
app.use('/api', vendorFollowUpMaterial);
app.use('/api', MaterialReceived);
app.use('/api', FinalMaterial);
app.use('/api', MRNDATA);

// Billing
app.use('/api', VendorFollowupBlling);
app.use('/api', BillProcessing);
app.use('/api', Bill_Checked);
app.use('/api', Bill_Tally);
app.use('/api', Payment);
app.use('/api', Bill_Checked_Step18);

// Contractor
app.use('/api/contractor', contractorForm);

// OutStanding
app.use('/api/outStading', OutStanding);

// Site Expenses
app.use('/api', Form);
app.use('/api/DebitExpenses', DebitApprovel1);
app.use('/api/SiteExpenses', SiteApprovels);
app.use('/api/labour', LabourApprovel);
app.use('/api/labour/pdf', LabourPDF);

// Advance
app.use('/api/advance', Advancesection);

// Signature
app.use('/api/signature', SignatureRequirement);

// Heritage Requirement (JV Project)
app.use('/api/heritage-requirement', HeritageRequirement);

// ===== 7. Start server =====
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});