import express from 'express';
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import jwt from 'jsonwebtoken';
import {authenticationMiddleware} from './middleware/auth.middleware.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

app.use(authenticationMiddleware);

app.get('/', (req, res) => {
    return res.json({ status: 'Server is up and running' });
})

app.use('/user', userRouter);
app.use('/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})