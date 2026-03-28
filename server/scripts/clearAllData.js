import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const clearData = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roompilot';
        console.log(`🔗 Connecting to ${mongoURI}...`);
        await mongoose.connect(mongoURI);

        const collections = await mongoose.connection.db.collections();
        
        for (let collection of collections) {
            console.log(`🧹 Clearing collection: ${collection.collectionName}`);
            await collection.deleteMany({});
        }

        console.log('✅ All data deleted successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing data:', err);
        process.exit(1);
    }
};

clearData();
