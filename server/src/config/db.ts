import { getSecret } from './secrets.js';

export async function getMongoURI() {
  if (process.env.USE_LOCAL_DB === 'true') {
    return process.env.MONGO_LOCAL_URI;
  } else {
    const password = await getSecret('MONGO_PASSWORD');
    return `mongodb+srv://${process.env.MONGO_USERNAME}:${password}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?${process.env.MONGO_OPTIONS}`;
  }
}
