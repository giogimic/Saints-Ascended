import { NextApiRequest, NextApiResponse } from 'next';
import { CurseForgeAPI } from '../../../lib/curseforge-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { gameId } = req.body;
    
    if (!gameId || typeof gameId !== 'number' || gameId <= 0) {
      return res.status(400).json({ error: 'Invalid game ID' });
    }
    
    CurseForgeAPI.setGameId(gameId);
    
    res.status(200).json({ 
      success: true, 
      gameId: CurseForgeAPI.getGameId(),
      message: `Game ID updated to ${gameId}`
    });
  } catch (error: any) {
    console.error('Set game ID error:', error);
    res.status(500).json({ error: 'Failed to update game ID' });
  }
} 