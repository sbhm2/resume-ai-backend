import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

router.get('/test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbStatus = await prisma.$queryRaw`SELECT 1 as status`;

    res.status(200).json({
      success: true,
      system: 'running',
      database: {
        connected: true,
        query: dbStatus && Array.isArray(dbStatus) ? true : true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      system: 'running',
      database: {
        connected: false,
        error: error.message || 'Unable to connect to the database',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
