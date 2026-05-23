// oxlint-disable

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = join(fileURLToPath(import.meta.url), "..");
const PORT = process.env.PORT || 4000;
const CLIENT_DIR = join(__dirname, "dist", "client");

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const { default: handler } = await import(join(__dirname, "dist", "server", "server.js"));

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const filePath = join(CLIENT_DIR, url.pathname === "/" ? "index.html" : url.pathname);

  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
    return;
  } catch {}

  try {
    const controller = new AbortController();
    req.on("close", () => controller.abort());

    const body =
      req.method === "GET" || req.method === "HEAD"
        ? null
        : await new Promise((resolve) => {
            const chunks = [];
            req.on("data", (chunk) => chunks.push(chunk));
            req.on("end", () => resolve(Buffer.concat(chunks)));
          });

    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
      body,
      signal: controller.signal,
    });

    const response = await handler.fetch(webReq);
    const responseHeaders = Object.fromEntries(response.headers);
    res.writeHead(response.status, responseHeaders);
    const responseBody = await response.text();
    res.end(responseBody);
  } catch (err) {
    console.error("SSR handler error:", err);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Admin server running on http://0.0.0.0:${PORT}`);
});
