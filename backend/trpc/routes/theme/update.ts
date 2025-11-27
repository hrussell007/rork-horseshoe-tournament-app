import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      logoSize: z.number().optional(),
      heroBackgroundColor: z.string().optional(),
      navSectionBackgroundColor: z.string().optional(),
      navSectionOpacity: z.number().optional(),
      primaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      textColor: z.string().optional(),
      surfaceColor: z.string().optional(),
      buttonColor: z.string().optional(),
      playerCardBackgroundColor: z.string().optional(),
      tournamentCardBackgroundColor: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    db.theme = { ...db.theme, ...input };
    console.log('✅ Updated theme settings');
    return db.theme;
  });
