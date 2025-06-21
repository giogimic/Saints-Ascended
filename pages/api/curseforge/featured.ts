import { NextApiRequest, NextApiResponse } from "next";
import {
  CurseForgeAPI,
  CurseForgeAPIError,
  CurseForgeRateLimitError,
  CurseForgeAuthenticationError,
  CurseForgeForbiddenError,
  CurseForgeTimeoutError,
  CurseForgeNetworkError,
} from "@/lib/curseforge-api";
import { convertBigIntsToStrings } from "@/lib/json-helpers";
import { info, warn, error, debug } from '../../../lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  info('[API] Featured mods request:', JSON.stringify(req.query));

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      gameId,
      excludedModIds
    } = req.query;

    // Parse parameters
    const parsedGameId = gameId ? parseInt(gameId as string) : undefined;
    const parsedExcludedModIds = excludedModIds 
      ? (excludedModIds as string).split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
      : [];

         info('[API]', 'Fetching featured mods from CurseForge API');
    
    const featuredMods = await CurseForgeAPI.getFeaturedMods(
      parsedGameId,
      parsedExcludedModIds
    );

    info('[API] Featured mods result:', JSON.stringify({
      modsCount: featuredMods.length,
      gameId: parsedGameId,
      excludedCount: parsedExcludedModIds.length
    }));

    const safeMods = convertBigIntsToStrings(featuredMods);
    
    res.status(200).json({ 
      data: safeMods, 
      totalCount: featuredMods.length,
      source: "api" 
    });

  } catch (err: unknown) {
    error('[API] Featured mods error:', err instanceof Error ? err.message : String(err));

    // Handle specific error types
    if (err instanceof CurseForgeRateLimitError) {
      return res.status(429).json({ 
        error: "Rate limit exceeded", 
        retryAfter: err.retryAfter,
        details: "Too many requests. Please wait before making more requests."
      });
    }

    if (err instanceof CurseForgeAuthenticationError) {
      return res.status(401).json({ 
        error: "Authentication failed", 
        details: "Invalid API key or authentication required."
      });
    }

    if (err instanceof CurseForgeForbiddenError) {
      return res.status(403).json({ 
        error: "Access forbidden", 
        details: "Insufficient permissions to access this resource."
      });
    }

    if (err instanceof CurseForgeTimeoutError || (err instanceof Error && err.message?.includes('timeout'))) {
      return res.status(408).json({ 
        error: "Request timeout", 
        details: "The request took too long to complete. Please try again."
      });
    }

    if (err instanceof CurseForgeNetworkError) {
      return res.status(503).json({ 
        error: "Network error", 
        details: "Unable to connect to CurseForge API. Please check your internet connection."
      });
    }

    if (err instanceof CurseForgeAPIError) {
      return res.status(err.statusCode || 500).json({ 
        error: "CurseForge API error", 
        details: err.message,
        errorCode: err.errorCode
      });
    }

    // Generic error fallback
         warn('[API]', 'Unexpected error in featured mods endpoint');
    res.status(500).json({ 
      error: "Internal server error", 
      details: "An unexpected error occurred while fetching featured mods."
    });
  }
} 