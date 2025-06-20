import { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "@/types/server";
import {
  findServerById,
  loadLaunchOptions,
  generateLaunchArgs,
} from "@/lib/server-storage";
import { getGlobalSteamCmdPath } from "@/lib/global-settings";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { join } from "path";
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

    // Load persistent launch options
    const launchOptions = await loadLaunchOptions(serverId);

    // Generate launch arguments
    const launchArgs = generateLaunchArgs(launchOptions);

    // Base server arguments
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

    // Combine base args with launch options
    const allArgs = [...baseArgs, ...launchArgs];

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
