import { publicProcedure } from '../../create-context';
import { db } from '../../../db';

export default publicProcedure.query(() => {
  console.log(`📊 Fetching ${db.directorLogs.length} director logs`);
  return db.directorLogs;
});
