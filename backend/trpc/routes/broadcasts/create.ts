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
      title: z.string(),
      message: z.string(),
      audience: broadcastAudienceSchema,
      audienceDetails: z.object({
        courtNumber: z.number().optional(),
        playerIds: z.array(z.string()).optional(),
        roundNumber: z.number().optional(),
      }).optional(),
      senderName: z.string(),
      senderId: z.string(),
      sentAt: z.string(),
      tournamentId: z.string().optional(),
      imageUri: z.string().optional(),
      isEmergency: z.boolean(),
      recipientCount: z.number(),
      deliveryStatus: z.enum(['pending', 'sent', 'failed']),
    })
  )
  .mutation(({ input }) => {
    const newBroadcast = {
      ...input,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    db.broadcasts.unshift(newBroadcast);
    console.log(`✅ Created broadcast: ${newBroadcast.title}`);
    return newBroadcast;
  });
