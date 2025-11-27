import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      id: z.string(),
      tournamentId: z.string().optional(),
      team1Id: z.string().optional(),
      team2Id: z.string().optional(),
      team1Score: z.number().optional(),
      team2Score: z.number().optional(),
      team1Ringers: z.number().optional(),
      team2Ringers: z.number().optional(),
      winnerTeamId: z.string().optional(),
      status: z.enum(['pending', 'in_progress', 'completed']).optional(),
      round: z.number().optional(),
      targetPoints: z.number().optional(),
      pitNumber: z.number().optional(),
    })
  )
  .mutation(({ input }) => {
    const { id, ...updates } = input;
    const index = db.matches.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Match not found');
    
    db.matches[index] = { ...db.matches[index], ...updates };
    console.log(`✅ Updated match: ${id}`);
    return db.matches[index];
  });
