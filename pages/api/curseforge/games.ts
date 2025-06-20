import { NextApiRequest, NextApiResponse } from 'next';
import { CurseForgeAPI } from '../../../lib/curseforge-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { index = '0', pageSize = '50' } = req.query;
    
    const games = await CurseForgeAPI.getGames(
      parseInt(index as string),
      parseInt(pageSize as string)
    );
    
    res.status(200).json(games);
  } catch (error: any) {
    console.error('CurseForge games error:', error);
    
    if (error.statusCode) {
      res.status(error.statusCode).json({
        error: error.message,
        errorCode: error.errorCode
      });
    } else {
      res.status(500).json({ error: 'Failed to get games' });
    }
  }
} 