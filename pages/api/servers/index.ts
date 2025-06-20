import { NextApiRequest, NextApiResponse } from 'next';
import { validateData, createServerSchema } from '@/lib/validations';
import type { ApiResponse, ServerConfig } from '@/types/server';
import * as serverStorage from '@/lib/server-storage';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`
      });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // Load servers from persistent storage
    const servers = await serverStorage.getServers();
    let filteredServers = [...servers];
    
    // Search functionality
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase();
      filteredServers = servers.filter(server =>
        server.name.toLowerCase().includes(searchTerm) ||
        server.description?.toLowerCase().includes(searchTerm) ||
        server.map.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedServers = filteredServers.slice(startIndex, endIndex);
    
    return res.status(200).json({
      success: true,
      data: paginatedServers,
      message: `Retrieved ${paginatedServers.length} servers`
    });
    
  } catch (error) {
    console.error('Failed to get servers:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Validate request body
    const validation = validateData(createServerSchema, req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: validation.errors
      });
    }
    
    const serverData = validation.data!;
    
    // Check for duplicate names
    const nameExists = await serverStorage.serverNameExists(serverData.name);
    if (nameExists) {
      return res.status(400).json({
        success: false,
        error: 'Server with this name already exists'
      });
    }
    
    // Check for port conflicts
    const hasConflict = await serverStorage.hasPortConflict(
      serverData.port || 7777,
      serverData.queryPort || 27015,
      serverData.rconPort || 32330
    );
    
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        error: 'Port conflict detected with existing server'
      });
    }
    
    // Create new server
    const newServer: ServerConfig = {
      id: generateId(),
      name: serverData.name,
      executablePath: serverData.executablePath,
      map: serverData.map,
      configDirectory: serverData.configDirectory,
      serverDirectory: serverData.serverDirectory,
      rconPassword: serverData.rconPassword,
      adminPassword: serverData.adminPassword,
      port: serverData.port || 7777,
      queryPort: serverData.queryPort || 27015,
      rconPort: serverData.rconPort || 32330,
      maxPlayers: serverData.maxPlayers || 70,
      serverPassword: serverData.serverPassword,
      description: serverData.description,
      tribeLimit: 0, // Default value
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save server to persistent storage
    await serverStorage.addServer(newServer);
    
    return res.status(201).json({
      success: true,
      data: newServer,
      message: 'Server created successfully'
    });
    
  } catch (error) {
    console.error('Failed to create server:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Utility function to generate unique IDs
function generateId(): string {
  return 'server_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
} 