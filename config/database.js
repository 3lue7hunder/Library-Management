const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;
let client;

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 MongoDB URL:', process.env.MONGODB_URL ? 'Set' : 'Missing');
    
    // MongoDB connection options for better reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    };

    client = new MongoClient(process.env.MONGODB_URL, options);
    
    // Connect with timeout
    await client.connect();
    
    // Test the connection
    await client.db().admin().ping();
    
    db = client.db();
    
    console.log('🍃 MongoDB Connected Successfully');
    console.log(`📚 Database: ${db.databaseName}`);
    
    // Handle connection events
    client.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    client.on('close', () => {
      console.log('🔌 MongoDB connection closed');
    });

    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // More specific error messages
    if (error.message.includes('authentication failed')) {
      console.error('🔑 Check your MongoDB username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 Check your MongoDB connection string and network access');
    } else if (error.message.includes('MongoServerSelectionError')) {
      console.error('🚫 Cannot connect to MongoDB Atlas. Check:');
      console.error('   - Network Access (IP Whitelist) in MongoDB Atlas');
      console.error('   - Database User credentials');
      console.error('   - Connection string format');
    }
    
    // In production, don't exit immediately - retry logic could be added here
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  Retrying connection in 5 seconds...');
      setTimeout(() => {
        process.exit(1);
      }, 5000);
    } else {
      process.exit(1);
    }
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

// Graceful shutdown
const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Handle app termination
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = { connectDB, getDB, closeDB };