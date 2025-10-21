// MongoDB initialization script
// This script will create the database and initial collections

print('Starting MongoDB initialization...');

// Switch to the api_rate_limiter database
db = db.getSiblingDB('api_rate_limiter');

// Create collections with some initial setup
db.createCollection('users');
db.createCollection('apikeys');
db.createCollection('analytics');

// Create indexes for better performance
print('Creating indexes...');

// User collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

// API Keys collection indexes
db.apikeys.createIndex({ "keyHash": 1 }, { unique: true });
db.apikeys.createIndex({ "user": 1 });
db.apikeys.createIndex({ "active": 1 });
db.apikeys.createIndex({ "createdAt": 1 });

// Analytics collection indexes
db.analytics.createIndex({ "apiKeyId": 1, "date": 1 }, { unique: true });
db.analytics.createIndex({ "userId": 1 });
db.analytics.createIndex({ "date": 1 });

print('MongoDB initialization completed successfully!');
