import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = db.sponsors.findIndex((s) => s.id === input.id);
    if (index === -1) throw new Error('Sponsor not found');
    
    db.sponsors.splice(index, 1);
    console.log(`🗑️  Deleted sponsor: ${input.id}`);
    return { success: true };
  });
