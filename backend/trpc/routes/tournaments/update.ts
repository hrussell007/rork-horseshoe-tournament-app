import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      date: z.string().optional(),
      location: z.string().optional(),
      time: z.string().optional(),
      imageUri: z.string().optional(),
      entryFee: z.number().optional(),
      availablePits: z.number().optional(),
      teams: z.array(
        z.object({
          id: z.string(),
          player1Id: z.string(),
          player2Id: z.string(),
          name: z.string().optional(),
        })
      ).optional(),
      status: z.enum(['setup', 'active', 'completed']).optional(),
      payoutStructure: z.object({
        firstPlace: z.number(),
        secondPlace: z.number(),
        thirdPlace: z.number(),
      }).optional(),
      bracketState: z.any().optional(),
    })
  )
  .mutation(({ input }) => {
    const { id, ...updates } = input;
    const index = db.tournaments.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Tournament not found');
    
    db.tournaments[index] = { ...db.tournaments[index], ...updates };
    console.log(`✅ Updated tournament: ${id}`);
    return db.tournaments[index];
  });
