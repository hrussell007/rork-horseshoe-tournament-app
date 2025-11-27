import { publicProcedure } from '../../create-context';
import { db } from '../../../db';

export default publicProcedure.query(() => {
  console.log(`📊 Fetching ${db.customTemplates.length} custom templates`);
  return db.customTemplates;
});
