import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      hasPaidMembership: z.boolean(),
      playerClass: z.enum(['A', 'B']),
      profilePicture: z.string().optional(),
      customSeasonPoints: z.number().optional(),
    })
  )
  .mutation(({ input }) => {
    const newPlayer = {
      ...input,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    db.players.push(newPlayer);
    console.log(`✅ Created player: ${newPlayer.name}`);
    return newPlayer;
  });
