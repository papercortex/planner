import { MongoMemoryServer } from "mongodb-memory-server";

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  // @ts-ignore
  global.__MONGODB__ = mongod;
};
