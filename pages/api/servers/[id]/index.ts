import { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, ServerConfig } from '@/types/server';
import * as serverStorage from '@/lib/server-storage';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid server ID'
    });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id);
    case 'DELETE':
      return handleDelete(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`
      });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  id: string
) {
  try {
    // Load server from persistent storage
    const server = await serverStorage.findServerById(id);
    
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: server,
      message: 'Server retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to get server:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  id: string
) {
  try {
    // Remove server from persistent storage
    const deletedServer = await serverStorage.removeServer(id);
    
    if (!deletedServer) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }

    // In production, you would also:
    // 1. Stop the server process if running
    // 2. Clean up any related files/backups
    // 3. Remove from database
    // 4. Log the deletion

    console.log(`Server ${id} (${deletedServer.name}) deleted`);

    return res.status(200).json({
      success: true,
      data: { id, name: deletedServer.name },
      message: 'Server deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete server:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 