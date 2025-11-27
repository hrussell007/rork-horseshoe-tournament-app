import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

const ADMIN_EMAIL = 'hrussell007@gmail.com';

export default publicProcedure
  .input(
    z.object({
      username: z.string(),
      email: z.string(),
      password: z.string().min(6),
    })
  )
  .mutation(({ input }) => {
    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedUsername = input.username.trim();
    
    const existingUser = db.users.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail ||
        u.username.toLowerCase() === normalizedUsername.toLowerCase()
    );
    
    if (existingUser) {
      throw new Error('Username or email already exists');
    }
    
    const newUser = {
      id: Date.now().toString(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: input.password,
      role: (normalizedEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user') as 'admin' | 'user',
      createdAt: new Date().toISOString(),
    };
    
    db.users.push(newUser);
    
    const userWithoutPassword = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
    
    console.log(`✅ User signed up: ${newUser.username}`);
    return userWithoutPassword;
  });
