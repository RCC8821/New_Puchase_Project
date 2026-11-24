


// // backend/routes/auth.js
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const { sheets, spreadsheetId } = require('../config/googleSheet');

// const router = express.Router();

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Users!A:C',
//     });

//     const rows = response.data.values || [];

//     if (rows.length === 0) {
//       return res.status(400).json({ error: 'No users found in the sheet' });
//     }

//     // ✅ Cleaned up search with trim and lowerCase
//     const inputEmail = (email || '').trim().toLowerCase();
//     const inputPass = (password || '').trim();

//     const user = rows.slice(1).find((row) => {
//       const sheetEmail = (row[0] || '').trim().toLowerCase();
//       const sheetPass = (row[1] || '').trim();
//       return sheetEmail === inputEmail && sheetPass === inputPass;
//     });

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const userType = user[2]?.trim();

//     // ✅ Static Valid User Types
//     const staticUserTypes = [
//       'Admin',
//       'Site Engineer',
//       'Ravindra Singh',
//       'Ravi Rajak',
//       'Anjali Malviya',
//       'Neha Masani',
//       'Material Received',
//       'Varsha Kahar',
//       'Abhishek Sharma',
//       'Govind Ram Nagar',
//       'Vinod Gayakwad',
//       'Ashok Pandey',
//       'Final Material Received',
//       'Labour Managment',
//       'Signature Requirement',
//       'Labour Form',
//       'Store Inventory'
//     ];

//     // ✅ Dynamic Site Engineer Types (start with "SE_" prefix)
//     const isSiteEngineerType = userType?.startsWith('SE_');

//     // ✅ UPDATED: Matches "Shivayera Golden PRJ028", "Signature Heritage PRJ024", etc.
//     const isProjectLockedUser = /.+\s+prj\d+/i.test(userType || '');

//     if (
//       !staticUserTypes.includes(userType) &&
//       !isSiteEngineerType &&
//       !isProjectLockedUser
//     ) {
//       return res.status(400).json({ error: 'Invalid user type' });
//     }

//     const token = jwt.sign(
//       { email: inputEmail, userType },
//       process.env.JWT_SECRET,
//       { expiresIn: '12h' }
//     );

//     return res.json({ token, userType });
//   } catch (error) {
//     console.error('Login error:', error.message);
//     return res.status(500).json({ error: 'Server error' });
//   }
// });

// router.get('/user', (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'No token' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     res.json({ email: decoded.email });
//   } catch (error) {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// });

// module.exports = router;



// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { sheets, spreadsheetId, AdvancePettyCashExpensesId } = require('../config/googleSheet');

const router = express.Router();

// ✅ Naam normalize: extra spaces hata ke lowercase
const normName = (v) => String(v || '').replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase();

// ✅ Petty Cash user check:
//    (1) Advance_Dropdown_Data Column B (Vendor list) me naam ho  YA
//    (2) Advance Petty Cash sheet (Advance tab) me usko advance diya gaya ho
const isVendorPettyCashUser = async (userType) => {
  const target = normName(userType);
  if (!target) return false;

  // (1) Vendor list
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Advance_Dropdown_Data!B:B',
    });
    const vendors = (response.data.values || []).map((r) => normName(r[0])).filter(Boolean);
    if (vendors.includes(target)) {
      console.log(`✅ Petty Cash login (vendor list): ${userType}`);
      return true;
    }
  } catch (e) {
    console.error('Vendor list check failed:', e.message);
  }

  // (2) Advance Petty Cash sheet
  if (AdvancePettyCashExpensesId) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: AdvancePettyCashExpensesId,
        range: 'Advance!A:P',
      });
      const found = (response.data.values || []).slice(1).some(
        (r) => normName(r[15]) === 'advance petty cash' && normName(r[3]) === target
      );
      if (found) {
        console.log(`✅ Petty Cash login (advance sheet): ${userType}`);
        return true;
      }
    } catch (e) {
      console.error('Advance sheet check failed:', e.message);
    }
  }

  console.log(`❌ "${userType}" na vendor list me mila, na Advance Petty Cash sheet me`);
  return false;
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:C',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No users found in the sheet' });
    }

    const inputEmail = (email || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    const user = rows.slice(1).find((row) => {
      const sheetEmail = (row[0] || '').trim().toLowerCase();
      const sheetPass = (row[1] || '').trim();
      return sheetEmail === inputEmail && sheetPass === inputPass;
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userType = user[2]?.trim();

    const staticUserTypes = [
      'Admin',
      'Site Engineer',
      'Ravindra Singh',
      'Ravi Rajak',
      'Anjali Malviya',
      'Neha Masani',
      'Material Received',
      'Varsha Kahar',
      'Abhishek Sharma',
      'Govind Ram Nagar',
      'Vinod Gayakwad',
      'Ashok Pandey',
      'Final Material Received',
      'Labour Managment',
      'Signature Requirement',
      'Labour Form',
      'Store Inventory',
      'Petty Cash Approval',
    ];

    const isSiteEngineerType = userType?.startsWith('SE_');
    const isProjectLockedUser = /.+\s+prj\d+/i.test(userType || '');

    const isValidType =
      staticUserTypes.includes(userType) ||
      isSiteEngineerType ||
      isProjectLockedUser ||
      (await isVendorPettyCashUser(userType));

    if (!isValidType) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const token = jwt.sign(
      { email: inputEmail, userType },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({ token, userType });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ email: decoded.email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;