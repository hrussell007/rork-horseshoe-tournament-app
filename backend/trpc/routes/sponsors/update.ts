import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      imageUri: z.string().optional(),
      websiteUrl: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    const { id, ...updates } = input;
    const index = db.sponsors.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Sponsor not found');
    
    db.sponsors[index] = { ...db.sponsors[index], ...updates };
    console.log(`✅ Updated sponsor: ${id}`);
    return db.sponsors[index];
  });
