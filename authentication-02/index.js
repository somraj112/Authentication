import express from 'express';
import userRouter from './routes/user.routes.js';
import db from './db/index.js';
import { usersTable, userSessions } from './db/schema.js';
import { eq } from 'drizzle-orm';
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

app.use(async (req, res, next) => {
    const sessionId = String(req.headers['session-id']).trim();
    if (!sessionId) {
        return next();
    }
    const [data] = await db.select({
      sessionId: userSessions.id,
      id: usersTable.id,
      userId: userSessions.userId,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(userSessions)
    .leftJoin(usersTable, eq(usersTable.id, userSessions.userId))
    .where((table) => eq(table.sessionId, sessionId));
    if (!data) {
      return next()
    }
    req.user = data;
    next();
})

app.get('/', (req, res) => {
    return res.json({ status: 'Server is up and running' });
})

app.use('/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})