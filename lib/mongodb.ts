import mongoose from 'mongoose';

// Define TypeScript interface for the cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Get MongoDB URI from environment variables
// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

// Initialize the cached connection object
// In development, use a global variable to preserve the connection across hot reloads
// In production, create a new cache object for each instance
const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache =
  globalWithMongoose.mongoose || { conn: null, promise: null };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

/**
 * Establishes and returns a cached MongoDB connection using Mongoose
 * 
 * This function implements connection caching to prevent multiple connections
 * from being created during development (when hot reloading occurs) and to
 * optimize connection reuse in serverless environments.
 * 
 * @returns {Promise<typeof mongoose>} The Mongoose instance with an active connection
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // Return the existing connection if it's already established
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no existing promise, create a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable command buffering to fail fast in serverless
    };

    // Create a new connection promise and cache it
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Await the connection promise and cache the result
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise cache if connection fails
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
