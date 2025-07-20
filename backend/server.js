import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clientRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

dotenv.config();

const app = express();
// const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);

// mongoose.connect(process.env.MONGO_URI)
// .then(() => {
//   console.log('MongoDB connected');
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// })
// .catch(err => {
//   console.error('MongoDB connection error:', err);
// });


// Vercel deployment
let isConnected = false;

async function connectDB() {
    if (isConnected) return ;
    await mongoose.connect(process.env.MONGO_URL);
    isConnected = true;
}

export default async function handler(req, res) {
    await connectDB();
    app(req, res);
}
