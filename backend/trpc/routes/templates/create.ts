import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

const broadcastAudienceSchema = z.enum([
  'all_players',
  'checked_in',
  'next_round',
  'specific_court',
  'specific_players',
  'emergency',
]);

export default publicProcedure
  .input(
    z.object({
      name: z.string(),
      title: z.string(),
      message: z.string(),
      audience: broadcastAudienceSchema,
    })
  )
  .mutation(({ input }) => {
    const newTemplate = {
      ...input,
      id: `custom-${Date.now()}`,
      isCustom: true as const,
    };
    db.customTemplates.push(newTemplate);
    console.log(`✅ Created custom template: ${newTemplate.name}`);
    return newTemplate;
  });
