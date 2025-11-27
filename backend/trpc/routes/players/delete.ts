import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = db.players.findIndex((p) => p.id === input.id);
    if (index === -1) throw new Error('Player not found');
    
    db.players.splice(index, 1);
    console.log(`🗑️  Deleted player: ${input.id}`);
    return { success: true };
  });
