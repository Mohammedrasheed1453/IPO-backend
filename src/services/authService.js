// // services/userService.js
// import { pool } from "../config/db.js";
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = '5e02e35e9ebde7bcff6adf41e9c8692ab51935d46e179ec337e09bd19164eafb738aa9e8744689c8615cedf323b54bab48a0b7c40a36165dac830ce77641d2e5'; // Ensure this is set in your .env file

// // Register User
// export const registerUser = async (user) => {
//     try {
//         const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [user.email]);
//         if (existingUser.length > 0) {
//             return { success: false, message: 'User already exists' };
//         }
        
//         const hashedPassword = await bcrypt.hash(user.password, 10);
//         const query = `INSERT INTO users (name, email, mobile, password, userType) VALUES (?, ?, ?, ?,?)`;
//         const values = [user.username, user.email, user.mobile, hashedPassword,user.userType];
//         await pool.query(query, values);
//         return { success: true, message: 'User registered successfully' };
//     } catch (error) {
//         console.error("Registration error:", error);
//         return { success: false, message: 'Registration failed. Please try again later.' };
//     }
// };

// // Login User with JWT token
// export const loginUser = async (email, password) => {
//     try {
//         const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
//         if (rows.length === 0) {
//             return { success: false, message: 'User not found' };
//         }
        
//         const user = rows[0];
//         const passwordMatch = await bcrypt.compare(password, user.password);
        
//         if (!passwordMatch) {
//             return { success: false, message: 'Incorrect password' };
//         }
        
//         // Generate JWT token
//         const token = jwt.sign(
//             { id: user.id, email: user.email, userType:user.userType },
//             JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         console.log("Generated token:", token); // For debugging
        
//         return { 
//             success: true, 
//             message: 'Login successful', 
//             token, 
//             user: { id: user.id, email: user.email, userType:user.userType } 
//         };
//     } catch (error) {
//         console.error("Login error:", error);
//         return { success: false, message: 'Login failed. Please try again later.' };
//     }
// };

// // Get User Details from Token
// export const getUserFromToken = async (token) => {
//     try {
//         const trimmedToken = token.trim();
//         console.log("Received token:", trimmedToken);

//         // Verify token (no `await` needed here)
//         const decoded = jwt.verify(trimmedToken, JWT_SECRET);
//         console.log("Decoded token:", decoded);

//         // Retrieve user details from the database
//         const [rows] = await pool.query('SELECT id, name, email, mobile, userType FROM users WHERE id = ?', [decoded.id]);

//         if (rows.length === 0) {
//             return { success: false, message: 'User not found' };
//         }

//         const user = rows[0];
//         return { success: true, user };
//     } catch (error) {
//         console.error("Token verification error:", error);
//         return { success: false, message: 'Invalid or expired token' };
//     }
// };

import { pool } from "../config/db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // Store in environment variables

// Register User
export const registerUser = async (user) => {
  try {
    // Check for existing username or email
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [user.username, user.email]
    );

    if (existing.length > 0) {
      return { 
        success: false, 
        message: existing.some(u => u.username === user.username) 
          ? 'Username already exists' 
          : 'Email already registered'
      };
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    await pool.query(
      `INSERT INTO users 
      (username, firstname, lastname, email, password) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        user.username,
        user.firstname,
        user.lastname,
        user.email,
        hashedPassword
      ]
    );

    return { success: true, message: 'Registration successful' };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: 'Registration failed' };
  }
};

// Login User
export const loginUser = async (email, password) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const user = rows[0];
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: 'Login failed' };
  }
};

// Get User Details
export const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const [rows] = await pool.query(
      `SELECT id, username, firstname, lastname, email 
       FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    return { success: true, user: rows[0] };
  } catch (error) {
    console.error("Token error:", error);
    return { success: false, message: 'Invalid token' };
  }
};
