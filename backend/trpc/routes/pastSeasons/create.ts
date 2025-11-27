import { publicProcedure } from '../../create-context';
import { db } from '../../../db';
import { z } from 'zod';

export default publicProcedure
  .input(
    z.object({
      name: z.string(),
      endDate: z.string(),
      classAStandings: z.array(
        z.object({
          playerId: z.string(),
          points: z.number(),
          tournamentsPlayed: z.number(),
          firstPlaceFinishes: z.number(),
          secondPlaceFinishes: z.number(),
          thirdPlaceFinishes: z.number(),
        })
      ),
      classBStandings: z.array(
        z.object({
          playerId: z.string(),
          points: z.number(),
          tournamentsPlayed: z.number(),
          firstPlaceFinishes: z.number(),
          secondPlaceFinishes: z.number(),
          thirdPlaceFinishes: z.number(),
        })
      ),
    })
  )
  .mutation(({ input }) => {
    const newSeason = {
      ...input,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    db.pastSeasons.push(newSeason);
    console.log(`✅ Created past season: ${newSeason.name}`);
    return newSeason;
  });
