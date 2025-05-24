const bcrypt = require('bcrypt');
const pool = require('../config/db');

/**
 * User model for database operations and user management
 * Handles CRUD operations for user accounts with password hashing
 */
class User {
  /**
   * Create new user account with hashed password
   * Validates unique email and username constraints
   * @param {Object} userData - User registration data (username, email, password)
   * @returns {Promise<Object>} Created user object without password
   */
  static async createUser(userData) {
    const { username, email, password } = userData;
    
    // Check if email or username already exists
    if (await this.emailExists(email)) {
      throw new Error('Email already exists');
    }
    if (await this.usernameExists(username)) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;
    
    const result = await pool.query(query, [username, email, hashedPassword]);
    return result.rows[0];
  }

  /**
   * Find user by email address for authentication
   * Used during login process to verify credentials
   * @param {string} email - User email address
   * @returns {Promise<Object|null>} User object with password hash or null
   */
  static async findByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by unique ID for profile operations
   * Returns user data without sensitive information
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User object without password or null
   */
  static async findById(userId) {
    const query = `
      SELECT id, username, email, created_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Update user profile information
   * Allows modification of username and email with validation
   * @param {number} userId - User ID to update
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user object
   */
  static async updateProfile(userId, updateData) {
    const { username, email } = updateData;
    
    // Validate unique constraints if email or username is being updated
    if (email && await this.emailExists(email)) {
      throw new Error('Email already exists');
    }
    if (username && await this.usernameExists(username)) {
      throw new Error('Username already exists');
    }

    const query = `
      UPDATE users
      SET username = COALESCE($1, username),
          email = COALESCE($2, email),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, username, email, created_at, updated_at
    `;
    
    const result = await pool.query(query, [username, email, userId]);
    return result.rows[0];
  }

  /**
   * Change user password with proper hashing
   * Validates current password before updating
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   * @returns {Promise<boolean>} True if password changed successfully
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    
    if (!user.rows[0]) {
      throw new Error('User not found');
    }

    const isValid = await this.comparePassword(currentPassword, user.rows[0].password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );

    return true;
  }

  /**
   * Hash password using bcrypt with salt rounds
   * Used for password creation and updates
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare plain text password with hash
   * Used during login authentication
   * @param {string} password - Plain text password
   * @param {string} hash - Stored password hash
   * @returns {Promise<boolean>} True if passwords match
   */
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Check if email already exists in database
   * Used for registration validation
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  static async emailExists(email) {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
  }

  /**
   * Check if username already exists in database
   * Used for registration validation
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if username exists
   */
  static async usernameExists(username) {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)';
    const result = await pool.query(query, [username]);
    return result.rows[0].exists;
  }
}

module.exports = User; 