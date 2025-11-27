import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      hasPaidMembership: z.boolean().optional(),
      playerClass: z.enum(['A', 'B']).optional(),
      profilePicture: z.string().optional(),
      customSeasonPoints: z.number().optional(),
    })
  )
  .mutation(({ input }) => {
    const { id, ...updates } = input;
    const index = db.players.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Player not found');
    
    db.players[index] = { ...db.players[index], ...updates };
    console.log(`✅ Updated player: ${id}`);
    return db.players[index];
  });
