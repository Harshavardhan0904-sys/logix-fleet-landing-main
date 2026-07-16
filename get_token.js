// Get auth token directly from MongoDB
const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb+srv://Freightflow26:Freightflow2026@cluster0.qkylk9h.mongodb.net/freightflow?retryWrites=true&w=majority';

async function getToken() {
  let client;
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db('freightflow');
    
    // Get a demo user
    const user = await db.collection('users').findOne({ email: 'demo@logix.com' });
    if (user) {
      console.log('Found user:', user.email);
      console.log('Current token:', user.token);
      return user.token;
    } else {
      console.log('No demo user found. Getting first user...');
      const firstUser = await db.collection('users').findOne({});
      if (firstUser) {
        console.log('Found user:', firstUser.email);
        console.log('Current token:', firstUser.token);
        return firstUser.token;
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (client) await client.close();
  }
}

getToken();
