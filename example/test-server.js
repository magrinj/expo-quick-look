const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3333;
const TOKEN = "test-secret-token";

const FILES = {
  "/document.pdf": {
    file: path.join(__dirname, "assets/protected-sample.pdf"),
    mime: "application/pdf",
  },
  "/image.png": {
    file: path.join(__dirname, "assets/sample.png"),
    mime: "image/png",
  },
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  console.log("  Authorization:", req.headers["authorization"] || "(none)");

  // API-style endpoint — no extension in URL, requires auth
  if (req.url === "/api/v1/documents/download") {
    const auth = req.headers["authorization"];
    if (auth !== `Bearer ${TOKEN}`) {
      console.log("  -> 401 Unauthorized");
      res.writeHead(401, { "Content-Type": "text/plain" });
      res.end("Unauthorized");
      return;
    }
    console.log("  -> 200 OK (API endpoint, no extension)");
    const file = path.join(__dirname, "assets/api-sample.pdf");
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="report.pdf"',
    });
    fs.createReadStream(file).pipe(res);
    return;
  }

  // Public endpoint — no auth required
  if (req.url === "/public/sample.pdf") {
    const file = path.join(__dirname, "assets/sample.pdf");
    res.writeHead(200, { "Content-Type": "application/pdf" });
    fs.createReadStream(file).pipe(res);
    return;
  }

  // Protected endpoints — require Bearer token
  const entry = FILES[req.url];
  if (!entry) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  const auth = req.headers["authorization"];
  if (auth !== `Bearer ${TOKEN}`) {
    console.log("  -> 401 Unauthorized");
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized — provide Authorization: Bearer test-secret-token");
    return;
  }

  console.log("  -> 200 OK");
  res.writeHead(200, {
    "Content-Type": entry.mime,
    "Content-Disposition": `attachment; filename="${path.basename(entry.file)}"`,
  });
  fs.createReadStream(entry.file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\nTest server running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET /public/sample.pdf            (no auth)`);
  console.log(`  GET /document.pdf                 (requires Bearer ${TOKEN})`);
  console.log(`  GET /image.png                    (requires Bearer ${TOKEN})`);
  console.log(`  GET /api/v1/documents/download     (requires Bearer ${TOKEN}, no extension)`);
  console.log(`\nUse in the example app:`);
  console.log(`  uri: "http://localhost:${PORT}/document.pdf"`);
  console.log(`  requestOptions: { headers: { Authorization: "Bearer ${TOKEN}" } }`);
});
