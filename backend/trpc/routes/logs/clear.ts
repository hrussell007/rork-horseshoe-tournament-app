import { publicProcedure } from '../../create-context';
import { db } from '../../../db';

export default publicProcedure.mutation(() => {
  db.directorLogs = [];
  console.log('🗑️  Cleared all director logs');
  return { success: true };
});
