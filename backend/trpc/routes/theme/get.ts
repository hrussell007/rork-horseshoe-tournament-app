import { publicProcedure } from '../../create-context';
import { db } from '../../../db';

export default publicProcedure.query(() => {
  console.log('📊 Fetching theme settings');
  return db.theme;
});
