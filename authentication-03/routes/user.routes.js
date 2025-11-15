import express from 'express';
import db from '../db/index.js';
import { usersTable, userSessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomBytes, createHmac } from 'node:crypto';
import { ensureAuthenticated } from '../middleware/auth.middleware.js';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.patch('/',ensureAuthenticated,async (req, res) => {
    const { name } = req.body;
    await db.update(usersTable).set({ name }).where(eq(usersTable.id, user.id));
    return res.json({ status: 'success' });
})

router.get('/',ensureAuthenticated,async (req, res) => {
    return res.json({ user });
  });
  

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existingUser] = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser) {
      return res.status(400).json({ error: `User with ${email} already exists!` });
    }

    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');

    const [user] = await db
      .insert(usersTable)
      .values({ name, email, password: hashedPassword, salt })
      .returning({ id: usersTable.id });

    return res.status(201).json({ status: 'success', data: { userId: user.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [existingUser] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        salt: usersTable.salt,
        role: usersTable.role,
        password: usersTable.password,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!existingUser) {
      return res.status(404).json({ error: `User with ${email} does not exist!` });
    }

    const { salt, password: existingHash } = existingUser;
    const newHash = createHmac('sha256', salt).update(password).digest('hex');

    if (newHash !== existingHash) {
      return res.status(401).json({ error: 'Invalid password!' });
    }

    const payload = {
      userId: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return res.json({ status: 'success', token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
