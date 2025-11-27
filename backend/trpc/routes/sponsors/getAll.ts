import { publicProcedure } from '../../create-context';
import { db } from '../../../db';

export default publicProcedure.query(() => {
  console.log(`📊 Fetching ${db.sponsors.length} sponsors`);
  return db.sponsors;
});
