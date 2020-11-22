import 'dotenv/config';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

export default db;
