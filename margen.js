// 1-JWT example  *Take care of expiry token

const jwt = require('jsonwebtoken');
require('dotenv').config(); // For loading environment variables

// Generate a JWT token
function generateToken(body) {
  const secret = process.env.JWT_SECRET; // Secret stored in environment variables
  return jwt.sign(body.userId, secret, { expiresIn: '1h' });
}

// Verify a JWT token
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Error('Invalid token');
  }
}

// Usage
const token = generateToken({ userId: 123 });
console.log('Generated Token:', token);

const decoded = verifyToken(token);
console.log('Decoded Token:', decoded);









//2- Argon2

const argon2 = require('argon2');

// Hash a password
async function hashPassword(password) {
  try {
    return await argon2.hash(password);
  } catch (err) {
    throw new Error('Password hashing failed');
  }
}

// Verify a password
async function verifyPassword(hashedPassword, password) {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch (err) {
    throw new Error('Password verification failed');
  }
}

// Usage
(async () => {
  const password = 'superSecret123';
  const hashedPassword = await hashPassword(password);
  console.log('Hashed Password:', hashedPassword);

  const isMatch = await verifyPassword(hashedPassword, password);
  console.log('Password Match:', isMatch);
})();









//3- Protecting Personally Identifiable Information (PII)

const crypto = require('crypto');
require('dotenv').config(); // For loading environment variables

// Generate encryption key and IV from environment variables or securely store them
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes for AES-256
const iv = crypto.randomBytes(16); // 16 bytes for AES

// Encrypt PII data
function encryptPII(data) {
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

// Decrypt PII data
function decryptPII(encryptedData, ivHex) {
  let ivBuffer = Buffer.from(ivHex, 'hex');
  let encryptedText = Buffer.from(encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Usage
const piiData = 'Sensitive Information';
const encrypted = encryptPII(piiData);
console.log('Encrypted PII:', encrypted);

const decrypted = decryptPII(encrypted.encryptedData, encrypted.iv);
console.log('Decrypted PII:', decrypted);
