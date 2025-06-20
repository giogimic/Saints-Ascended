import { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "@/types/server";
import {
  findServerById,
  loadLaunchOptions,
  generateLaunchArgs,
  mergeLaunchOptions,
} from "@/lib/server-storage";
import { serverSettingsStorage } from "@/lib/server-settings-storage";
import { getGlobalSteamCmdPath } from "@/lib/global-settings";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { existsSync } from "fs";
import {
  withErrorHandler,
  withAllowedMethods,
} from "@/lib/errors/api-error-handler";
import { ValidationError, NotFoundError } from "@/lib/errors/custom-errors";

const execAsync = promisify(exec);

async function actionsHandler(req: NextApiRequest, res: NextApiResponse) {
  const { id: serverId } = req.query;

  if (typeof serverId !== "string") {
    throw new ValidationError("Server ID is required");
  }

  const server = await findServerById(serverId);
  if (!server) {
    throw new NotFoundError(`Server not found: ${serverId}`);
  }

  switch (req.method) {
    case "POST":
      const { action } = req.body;

      if (!action) {
        throw new ValidationError("Action is required");
      }

      switch (action) {
        case "start":
          return await startServer(serverId, res);
        case "stop":
          return await stopServer(serverId, res);
        case "restart":
          return await restartServer(serverId, res);
        default:
          throw new ValidationError(`Unknown action: ${action}`);
      }

    default:
      throw new ValidationError(`Method ${req.method} Not Allowed`);
  }
}

async function startServer(serverId: string, res: NextApiResponse) {
  try {
    const server = await findServerById(serverId);
    if (!server) {
      throw new NotFoundError(`Server not found: ${serverId}`);
    }

    // Validate server executable path
    if (!server.executablePath || !existsSync(server.executablePath)) {
      throw new ValidationError(`Server executable not found: ${server.executablePath}`);
    }

    // Validate server directory
    if (!server.serverDirectory || !existsSync(server.serverDirectory)) {
      throw new ValidationError(`Server directory not found: ${server.serverDirectory}`);
    }

    // Load persistent boolean launch options
    const booleanLaunchOptions = await loadLaunchOptions(serverId);

    // Load mod launch options string from server settings
    const modLaunchOptionsString = await serverSettingsStorage.getSetting(serverId, 'launchOptions') || '';

    // Merge all launch options (boolean options + mod options string)
    const allLaunchArgs = mergeLaunchOptions(booleanLaunchOptions, modLaunchOptionsString);

    // Base server arguments (map and query parameters)
    const baseArgs = [
      server.map,
      `?listen`,
      `?Port=${server.port}`,
      `?QueryPort=${server.queryPort}`,
      `?RCONPort=${server.rconPort}`,
      `?RCONEnabled=True`,
      `?ServerAdminPassword=${server.adminPassword}`,
      `?MaxPlayers=${server.maxPlayers}`,
    ];

    // Add server password if set
    if (server.serverPassword) {
      baseArgs.push(`?ServerPassword=${server.serverPassword}`);
    }

    // Add common ARK server parameters for better performance and functionality
    const commonArgs = [
      `-ForceAllowCaveFlyers`,
      `-EnableIdlePlayerKick`,
      `-NoTransferFromFiltering`,
      `-servergamelog`,
      `-servergamelogincludetribelogs`,
      `-ServerRCONOutputTribeLogs`,
      `-NotifyAdminCommandsInChat`,
      `-nosteamclient`,
      `-game`,
      `-server`,
      `-log`
    ];

    // Combine all arguments: base + common + merged launch options
    const allArgs = [...baseArgs, ...commonArgs, ...allLaunchArgs];

    console.log(`Starting server ${serverId} with args:`, allArgs);

    // Start the server process
    const serverProcess = spawn(server.executablePath, allArgs, {
      cwd: server.serverDirectory,
      detached: true,
      stdio: "ignore",
    });

    // Let the process run independently
    serverProcess.unref();

    res.status(200).json({
      success: true,
      message: "Server started successfully",
      data: {
        serverId,
        launchArgs: allArgs,
        pid: serverProcess.pid,
        booleanOptions: generateLaunchArgs(booleanLaunchOptions),
        modOptions: modLaunchOptionsString,
        mergedOptions: allLaunchArgs,
        commonArgs: commonArgs,
        executablePath: server.executablePath,
        serverDirectory: server.serverDirectory,
      },
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start server",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function stopServer(serverId: string, res: NextApiResponse) {
  // Implementation for stopping server
  res.status(200).json({
    success: true,
    message: "Server stop functionality not yet implemented",
    data: { serverId },
  });
}

async function restartServer(serverId: string, res: NextApiResponse) {
  // Implementation for restarting server
  res.status(200).json({
    success: true,
    message: "Server restart functionality not yet implemented",
    data: { serverId },
  });
}

export default withAllowedMethods(withErrorHandler(actionsHandler), ["POST"]);
