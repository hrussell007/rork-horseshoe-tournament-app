import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      name: z.string(),
      date: z.string(),
      location: z.string().optional(),
      time: z.string().optional(),
      imageUri: z.string().optional(),
      entryFee: z.number(),
      availablePits: z.number().optional(),
      teams: z.array(
        z.object({
          id: z.string(),
          player1Id: z.string(),
          player2Id: z.string(),
          name: z.string().optional(),
        })
      ),
      status: z.enum(['setup', 'active', 'completed']),
      payoutStructure: z.object({
        firstPlace: z.number(),
        secondPlace: z.number(),
        thirdPlace: z.number(),
      }),
      bracketState: z.any().optional(),
    })
  )
  .mutation(({ input }) => {
    const newTournament = {
      ...input,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    db.tournaments.push(newTournament);
    console.log(`✅ Created tournament: ${newTournament.name}`);
    return newTournament;
  });
