import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = db.customTemplates.findIndex((t) => t.id === input.id);
    if (index === -1) throw new Error('Template not found');
    
    db.customTemplates.splice(index, 1);
    console.log(`🗑️  Deleted custom template: ${input.id}`);
    return { success: true };
  });
