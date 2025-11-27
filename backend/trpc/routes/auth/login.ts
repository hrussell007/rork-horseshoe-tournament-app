import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      emailOrUsername: z.string(),
      password: z.string(),
    })
  )
  .mutation(({ input }) => {
    const normalized = input.emailOrUsername.toLowerCase().trim();
    
    const user = db.users.find(
      (u) => u.email.toLowerCase() === normalized || u.username.toLowerCase() === normalized
    );
    
    if (!user || user.password !== input.password) {
      throw new Error('Invalid credentials');
    }
    
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
    
    console.log(`✅ User logged in: ${user.username}`);
    return userWithoutPassword;
  });
