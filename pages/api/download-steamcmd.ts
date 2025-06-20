import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { targetPath } = req.body;

  if (!targetPath) {
    return res.status(400).json({ error: 'Target path is required' });
  }

  try {
    // Parse the target path to get directory and filename
    const targetDir = path.dirname(targetPath);
    const isExePath = targetPath.toLowerCase().endsWith('.exe');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Download SteamCMD zip file
    const steamCmdUrl = 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';
    const zipPath = path.join(targetDir, 'steamcmd.zip');

    console.log('Downloading SteamCMD from:', steamCmdUrl);
    console.log('Saving to:', zipPath);

    // Download the file
    const response = await fetch(steamCmdUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download SteamCMD: ${response.statusText}`);
    }

    // Save the zip file
    const fileStream = createWriteStream(zipPath);
    await pipeline(response.body as any, fileStream);

    console.log('Download complete, extracting...');

    // Extract the zip file using PowerShell (since we're on Windows)
    const extractCommand = `Expand-Archive -Path "${zipPath}" -DestinationPath "${targetDir}" -Force`;
    
    try {
      await execAsync(extractCommand, { shell: 'powershell.exe' });
      console.log('Extraction complete');
    } catch (error) {
      console.error('PowerShell extraction failed, trying alternative method:', error);
      
      // Alternative: Use Windows built-in tar command (available in Windows 10+)
      try {
        await execAsync(`tar -xf "${zipPath}" -C "${targetDir}"`, { shell: 'cmd.exe' });
      } catch (tarError) {
        throw new Error('Failed to extract SteamCMD. Please ensure you have extraction tools available.');
      }
    }

    // Clean up the zip file
    try {
      fs.unlinkSync(zipPath);
    } catch (error) {
      console.warn('Failed to delete zip file:', error);
    }

    // Verify steamcmd.exe exists
    const steamCmdExePath = path.join(targetDir, 'steamcmd.exe');
    if (!fs.existsSync(steamCmdExePath)) {
      throw new Error('SteamCMD extraction completed but steamcmd.exe not found');
    }

    // Run SteamCMD once to complete initial setup
    console.log('Running initial SteamCMD setup...');
    try {
      await execAsync(`"${steamCmdExePath}" +quit`, { 
        cwd: targetDir,
        timeout: 30000 // 30 second timeout
      });
    } catch (error) {
      // SteamCMD might return non-zero exit code on first run, which is normal
      console.log('Initial SteamCMD setup completed (may have warnings)');
    }

    return res.status(200).json({ 
      success: true, 
      message: 'SteamCMD downloaded and extracted successfully',
      path: steamCmdExePath
    });

  } catch (error) {
    console.error('Failed to download/extract SteamCMD:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to download SteamCMD' 
    });
  }
} 