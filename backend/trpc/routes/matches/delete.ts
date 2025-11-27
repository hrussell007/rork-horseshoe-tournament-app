import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = db.matches.findIndex((m) => m.id === input.id);
    if (index === -1) throw new Error('Match not found');
    
    db.matches.splice(index, 1);
    console.log(`🗑️  Deleted match: ${input.id}`);
    return { success: true };
  });
