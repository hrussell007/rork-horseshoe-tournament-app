import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = db.tournaments.findIndex((t) => t.id === input.id);
    if (index === -1) throw new Error('Tournament not found');
    
    db.tournaments.splice(index, 1);
    db.matches = db.matches.filter((m) => m.tournamentId !== input.id);
    console.log(`🗑️  Deleted tournament: ${input.id}`);
    return { success: true };
  });
