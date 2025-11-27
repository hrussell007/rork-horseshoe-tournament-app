import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      name: z.string(),
      imageUri: z.string().optional(),
      websiteUrl: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    const newSponsor = {
      ...input,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    db.sponsors.push(newSponsor);
    console.log(`✅ Created sponsor: ${newSponsor.name}`);
    return newSponsor;
  });
