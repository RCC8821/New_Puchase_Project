

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

//     const user = rows
//       .slice(1)
//       .find((row) => row[0] === email && row[1] === password);

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
//     ];

//     // ✅ Dynamic Site Engineer Types (start with "SE_" prefix)
//     const isSiteEngineerType = userType?.startsWith('SE_');

//     // ✅ NEW - Project-Locked Users (start with "Signature Heritage PRJ")
//     const isProjectLockedUser =
//       userType?.toLowerCase().startsWith('signature heritage prj');

//     if (
//       !staticUserTypes.includes(userType) &&
//       !isSiteEngineerType &&
//       !isProjectLockedUser  // ✅ NEW
//     ) {
//       return res.status(400).json({ error: 'Invalid user type' });
//     }

//     const token = jwt.sign(
//       { email, userType },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
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
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

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

    const user = rows
      .slice(1)
      .find((row) => row[0] === email && row[1] === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userType = user[2]?.trim();

    // ✅ Static Valid User Types
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
    ];

    // ✅ Dynamic Site Engineer Types (start with "SE_" prefix)
    const isSiteEngineerType = userType?.startsWith('SE_');

    // ✅ Project-Locked Users - Flexible Pattern
    // Matches: "Signature ___ PRJ___"
    // Examples:
    //   - Signature Heritage PRJ024
    //   - Signature Peradise PRJ028
    //   - Signature Palace PRJ030
    //   - Signature Anything PRJXXX
    const isProjectLockedUser = /^signature\s+.+\s+prj\d+/i.test(userType || '');

    if (
      !staticUserTypes.includes(userType) &&
      !isSiteEngineerType &&
      !isProjectLockedUser
    ) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const token = jwt.sign(
      { email, userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
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