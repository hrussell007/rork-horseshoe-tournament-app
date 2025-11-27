import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      action: z.string(),
      details: z.string(),
      timestamp: z.string(),
      tournamentId: z.string().optional(),
      matchId: z.string().optional(),
      playerId: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    const newLog = {
      ...input,
      id: Date.now().toString(),
    };
    db.directorLogs.unshift(newLog);
    console.log(`✅ Created director log: ${newLog.action}`);
    return newLog;
  });
