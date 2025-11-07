// Test script to verify environment variables
import 'dotenv/config';

console.log('DATABASE_URL from env:', process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
console.log('Contains encoded chars:', process.env.DATABASE_URL?.includes('%24'));
