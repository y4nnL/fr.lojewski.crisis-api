import dotenv from 'dotenv'

export default async () => {
  dotenv.config()
  process.env.NODE_ENV = 'test'
  process.env.DB_URI = 'mongodb://localhost:27017/crisis-test'
};
