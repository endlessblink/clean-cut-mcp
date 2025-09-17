# Repository Guidelines

## Project Structure & Module Organization
- `clean-cut-components/` hosts production Remotion compositions; export new scenes through `index.ts` and register them in `RemotionRoot` as named components.
- `clean-cut-workspace/` mirrors Claude-managed drafts; promote code to `clean-cut-components/` only after review and test renders.
- `mcp-server/src/` defines the Express + Zod MCP server; builds emit to `mcp-server/dist/` and must stay free of console noise.
- `docs/` and `install.ps1` cover one-script install flows, Docker wiring, and release checklists—treat them as source of truth.
- Docker volumes keep `clean-cut-exports/` (video output) and `clean-cut-components/` (scenes) in sync with `/workspace` inside the container.

## Build, Test, and Development Commands
- `npm run setup` or `./install.ps1` installs dependencies and compiles the MCP server once.
- `npm run dev` (Remotion Studio) and `npm run preview` support local iteration; `npm run build` renders the `Main` composition for regression checks.
- `npm run build-mcp` (or `npm --prefix mcp-server run build`) transpiles the MCP server; `npm run test-mcp` keeps `tsc --watch` hot during handler edits.
- Docker workflows: `docker-compose up -d` (or the `docker run` in `CLAUDE.md`) must expose ports 6970/6971 and mount exports/components.

## Coding Style & Naming Conventions
- TypeScript + React with 2-space indentation and double quotes; components stay PascalCase and live in their own files.
- Always use named exports (`export { ComponentName };`) so Remotion registration and Claude tooling discover scenes reliably.
- In the MCP server, send logs to `console.error` only; `console.log` will corrupt JSON-RPC responses.

## Testing Guidelines
- Treat TypeScript builds as gating tests: verify `npm run build` and `npm run build-mcp` succeed before submitting changes.
- Confirm Remotion Studio reaches http://localhost:6970 and that new scenes render without warnings; export once to `clean-cut-exports/` as a smoke test.
- For server updates, run `npm run start` (or the Docker container) and exercise Claude tools, capturing `mcp-server/clean-cut-mcp.log` for regressions.

## Commit & Pull Request Guidelines
- Follow existing history: uppercase verb prefixes (`FIX:`, `SOLVE:`, `COMPLETE:`) plus a concise summary.
- Document executed commands, touched assets, and any Docker/Claude configuration changes in the PR description; link preview exports when UI shifts.

## Claude Desktop & Docker Safety
- Keep the container name `clean-cut-mcp`, reserve ports 6970 (Studio) and 6971 (MCP HTTP), and validate JSON before editing Claude configs.
- On Windows scripts, call Docker with the full path (`"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe"`) and escape backslashes.
- Backup `claude_desktop_config.json` before modifications and never overwrite other MCP entries—merge instead.
