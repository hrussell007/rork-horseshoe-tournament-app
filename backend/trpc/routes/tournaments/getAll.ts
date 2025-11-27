import { publicProcedure } from '../../create-context';
import { db } from '../../../db';

export default publicProcedure.query(() => {
  console.log(`📊 Fetching ${db.tournaments.length} tournaments`);
  return db.tournaments;
});
