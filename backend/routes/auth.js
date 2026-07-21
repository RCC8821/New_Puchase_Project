


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

//     // ✅ 'Signature Requirement' ADD KIYA
//     const validUserTypes = [
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
//       'Signature Requirement', // ✅ NEW
//     ];

//     if (!validUserTypes.includes(userType)) {
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
    // Example: SE_Rahul Sharma, SE_Amit Kumar
    const isSiteEngineerType = userType?.startsWith('SE_');

    if (!staticUserTypes.includes(userType) && !isSiteEngineerType) {
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