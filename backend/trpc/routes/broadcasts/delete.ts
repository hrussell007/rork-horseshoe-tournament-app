import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = db.broadcasts.findIndex((b) => b.id === input.id);
    if (index === -1) throw new Error('Broadcast not found');
    
    db.broadcasts.splice(index, 1);
    console.log(`🗑️  Deleted broadcast: ${input.id}`);
    return { success: true };
  });
