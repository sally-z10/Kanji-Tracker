require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 5001; // Use a different port for tests
process.env.JWT_SECRET = 'test-secret-key';

// Global setup function that Jest will call
module.exports = async () => {
  // Add any database setup or cleanup here
  console.log('Setting up test environment...');
  
  // You can add database setup code here
  // For example:
  // await db.connect();
  // await db.clearTables();
  
  return {
    // You can return any values that should be available in your tests
    setupComplete: true
  };
}; 