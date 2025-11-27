import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      tournamentId: z.string(),
      team1Id: z.string(),
      team2Id: z.string(),
      team1Score: z.number(),
      team2Score: z.number(),
      team1Ringers: z.number(),
      team2Ringers: z.number(),
      winnerTeamId: z.string().optional(),
      status: z.enum(['pending', 'in_progress', 'completed']),
      round: z.number(),
      targetPoints: z.number().optional(),
      pitNumber: z.number().optional(),
    })
  )
  .mutation(({ input }) => {
    const newMatch = {
      ...input,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    db.matches.push(newMatch);
    console.log(`✅ Created match: ${newMatch.id}`);
    return newMatch;
  });
