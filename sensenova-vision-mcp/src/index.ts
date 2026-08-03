#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { analyzeImages, getBaseUrl, getModel } from "./sensenova-client.js";
import { toDataUrl } from "./image.js";
import { TOOLS } from "./tools.js";

const server = new McpServer({
  name: "sensenova-vision-mcp",
  version: "0.1.0",
});

for (const tool of TOOLS) {
  server.tool(tool.name, tool.description, tool.schema, async (args) => {
    try {
      const dataUrls = await Promise.all(
        tool.imageParams.map((p) => toDataUrl(String((args as Record<string, unknown>)[p])))
      );
      const userPrompt = tool.buildUserPrompt(args as Record<string, unknown>);
      const text = await analyzeImages(dataUrls, tool.systemPrompt, userPrompt);
      return { content: [{ type: "text" as const, text }] };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
    }
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);

console.error(`[sensenova-vision-mcp] running — model=${getModel()} base=${getBaseUrl()}`);
