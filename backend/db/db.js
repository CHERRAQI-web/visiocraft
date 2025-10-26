import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config()

export const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB Atlas');
    }catch(error){
        console.error('❌ Erreur MongoDB :', error);
        process.exit(1);
    }
}
