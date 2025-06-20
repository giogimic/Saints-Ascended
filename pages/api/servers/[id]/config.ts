import { NextApiRequest, NextApiResponse } from 'next';
import { ServerConfig, LaunchOptionsConfig } from '../../../../types/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { findServerById, updateServer, loadLaunchOptions, saveLaunchOptions, updateLaunchOption } from '../../../../lib/server-storage';
import { withErrorHandler, withAllowedMethods } from '@/lib/errors/api-error-handler';
import { ValidationError, NotFoundError, ConfigurationError, FileOperationError } from '@/lib/errors/custom-errors';

// Launch options from old Python project - now used as reference
const LAUNCH_OPTIONS = [
  'USEALLAVAILABLECORES',
  'lowmemory', 
  'nomanssky',
  'NoCrashDialog',
  'disablemodchecks',
  'ForceRespawnDinos',
  'preventhibernation',
  'NoBattlEye',
  'UseBattlEye',
  'NoHangDetection',
  'crossplay',
  'automanagedmods',
  'StasisKeepControllers',
  'UseDynamicConfig'
];

/**
 * Get server INI file path
 */
function getServerINIPath(server: ServerConfig, fileName: string): string {
  return join(server.configDirectory, fileName);
}

/**
 * Ensure config directory exists and is writable
 */
function ensureConfigDirectory(configDirectory: string): void {
  if (!configDirectory) {
    throw new ValidationError('Config directory is not specified');
  }
  
  try {
    if (!existsSync(configDirectory)) {
      mkdirSync(configDirectory, { recursive: true });
      console.log(`Created config directory: ${configDirectory}`);
    }
  } catch (error) {
    console.error(`Failed to create config directory: ${configDirectory}`, error);
    throw new FileOperationError(`Failed to create config directory: ${configDirectory}`);
  }
}

/**
 * Load template file with error handling
 */
function loadTemplateFile(fileName: string): string {
  const templatePath = join(process.cwd(), 'templates', fileName);
  
  try {
    if (!existsSync(templatePath)) {
      console.error(`Template file not found: ${templatePath}`);
      throw new Error(`Template file not found: ${fileName}`);
    }
    
    const content = readFileSync(templatePath, 'utf-8');
    if (!content || content.trim() === '') {
      throw new Error(`Template file is empty: ${fileName}`);
    }
    
    console.log(`Successfully loaded template: ${fileName}`);
    return content;
  } catch (error) {
    console.error(`Failed to load template file: ${fileName}`, error);
    throw new Error(`Failed to load template file: ${fileName}`);
  }
}

/**
 * Generate default GameUserSettings.ini file from template
 */
function generateDefaultGameUserSettingsINIFromTemplate(): string {
  return loadTemplateFile('GameUserSettings.ini');
}

/**
 * Generate default Game.ini file from template
 */
function generateDefaultGameINIFromTemplate(): string {
  return loadTemplateFile('Game.ini');
}

/**
 * Load or create INI file with proper error handling
 */
function loadOrCreateINIFile(server: ServerConfig, fileName: string): string {
  const filePath = getServerINIPath(server, fileName);
  
  try {
    // Ensure config directory exists
    ensureConfigDirectory(server.configDirectory);
    
    let content: string;
    
    // Check if file exists
    if (existsSync(filePath)) {
      try {
        content = readFileSync(filePath, 'utf-8');
        console.log(`Loaded existing ${fileName} from: ${filePath}`);
      } catch (error) {
        console.error(`Failed to read existing ${fileName}:`, error);
        throw new Error(`Failed to read existing ${fileName}`);
      }
    } else {
      // Create file from template
      console.log(`Creating new ${fileName} from template`);
      if (fileName === 'GameUserSettings.ini') {
        content = generateDefaultGameUserSettingsINIFromTemplate();
      } else if (fileName === 'Game.ini') {
        content = generateDefaultGameINIFromTemplate();
      } else {
        throw new Error(`Unsupported file type: ${fileName}`);
      }
      
      // Write the new file
      try {
        writeFileSync(filePath, content);
        console.log(`Created new ${fileName} at: ${filePath}`);
      } catch (error) {
        console.error(`Failed to write new ${fileName}:`, error);
        throw new Error(`Failed to create ${fileName}`);
      }
    }
    
    return content;
  } catch (error) {
    console.error(`Error in loadOrCreateINIFile for ${fileName}:`, error);
    throw error;
  }
}

/**
 * Save INI file with proper error handling
 */
function saveINIFile(server: ServerConfig, fileName: string, content: string): void {
  const filePath = getServerINIPath(server, fileName);
  
  try {
    // Ensure config directory exists
    ensureConfigDirectory(server.configDirectory);
    
    // Validate content
    if (!content || content.trim() === '') {
      throw new Error(`Cannot save empty content for ${fileName}`);
    }
    
    // Write the file
    writeFileSync(filePath, content);
    console.log(`Successfully saved ${fileName} to: ${filePath}`);
  } catch (error) {
    console.error(`Failed to save ${fileName}:`, error);
    throw new Error(`Failed to save ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function configHandler(req: NextApiRequest, res: NextApiResponse) {
  const { id: serverId, file } = req.query;
  
  if (typeof serverId !== 'string') {
    throw new ValidationError('Server ID is required');
  }

  console.log(`Config API request: ${req.method} ${serverId} ${file || ''}`);

  // Find server in the storage system
  const server = await findServerById(serverId);
  if (!server) {
    throw new NotFoundError(`Server not found: ${serverId}`);
  }

  // Validate config directory
  if (!server.configDirectory) {
    throw new ConfigurationError('Server config directory not found. Please update server configuration.');
  }

  switch (req.method) {
    case 'GET':
      // Handle specific file requests
      if (file === 'GameUserSettings.ini' || file === 'Game.ini') {
        const content = loadOrCreateINIFile(server, file as string);
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(content);
        return;
      }

      // Load launch options from JSON file
      const launchOptions = await loadLaunchOptions(serverId);
      
      // Load INI files
      let gameUserSettings = null;
      let gameIni = null;
      
      try {
        gameUserSettings = loadOrCreateINIFile(server, 'GameUserSettings.ini');
      } catch (error) {
        console.error('Failed to load GameUserSettings.ini:', error);
      }
      
      try {
        gameIni = loadOrCreateINIFile(server, 'Game.ini');
      } catch (error) {
        console.error('Failed to load Game.ini:', error);
      }

      // Return full server configuration
      res.status(200).json({
        success: true,
        data: {
          server,
          launchOptions: launchOptions,
          gameUserSettings,
          gameIni,
          availableLaunchOptions: LAUNCH_OPTIONS
        }
      });
      return;

    case 'POST':
      if (!req.body) {
        throw new ValidationError('Request body is required');
      }

      if (file === 'GameUserSettings.ini' || file === 'Game.ini') {
        const { content } = req.body;
        if (typeof content !== 'string') {
          throw new ValidationError('Content must be a string');
        }
        
        saveINIFile(server, file as string, content);
        res.status(200).json({ success: true });
        return;
      }

      // Handle launch options update
      if (req.body.launchOptions) {
        const postLaunchOptions = req.body.launchOptions as LaunchOptionsConfig;
        await saveLaunchOptions(serverId, postLaunchOptions);
        
        res.status(200).json({ 
          success: true,
          data: {
            launchOptions: postLaunchOptions
          }
        });
        return;
      }

      // Update server configuration
      const updatedServer = await updateServer(serverId, req.body);
      const postServerLaunchOptions = await loadLaunchOptions(serverId);
      res.status(200).json({ 
        success: true,
        data: {
          server: updatedServer,
          launchOptions: postServerLaunchOptions
        }
      });
      return;
      
    case 'PATCH':
      if (!req.body) {
        throw new ValidationError('Request body is required');
      }

      // Handle individual launch option updates
      if (req.body.launchOptionKey && req.body.launchOptionValue !== undefined) {
        const updatedOptions = await updateLaunchOption(
          serverId, 
          req.body.launchOptionKey, 
          req.body.launchOptionValue
        );
        
        res.status(200).json({ 
          success: true,
          data: {
            launchOptions: updatedOptions
          }
        });
        return;
      }

      // Handle bulk launch options update
      if (req.body.launchOptions) {
        const patchLaunchOptions = req.body.launchOptions as LaunchOptionsConfig;
        await saveLaunchOptions(serverId, patchLaunchOptions);
        
        res.status(200).json({ 
          success: true,
          data: {
            launchOptions: patchLaunchOptions
          }
        });
        return;
      }

      // Update server configuration
      const patchedServer = await updateServer(serverId, req.body);
      const patchedLaunchOptions = await loadLaunchOptions(serverId);
      res.status(200).json({ 
        success: true,
        data: {
          server: patchedServer,
          launchOptions: patchedLaunchOptions
        }
      });
      return;

    default:
      throw new ValidationError(`Method ${req.method} Not Allowed`);
  }
}

export default withAllowedMethods(
  withErrorHandler(configHandler),
  ['GET', 'POST', 'PATCH']
); 