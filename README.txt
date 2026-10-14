LISTINGCRAFT AI — HTML / CSS / JAVASCRIPT FRONTEND

FILES
- index.html  : page structure
- style.css   : layout and responsive styling
- script.js   : form handling, demo listing generation, copy buttons, optional Ollama connection

RUN THE PROTOTYPE
1. Extract the ZIP file.
2. Open the folder.
3. Double-click index.html to open it in Chrome, Edge, or Firefox.
4. Enter a sample product name and product features, then click Generate my listing.
5. If no local model is running, the app uses a demo template. This fallback is NOT AI.

OPTIONAL OPEN-WEIGHT LOCAL AI (Ollama)
This frontend is prepared to try Ollama's local API at http://localhost:11434/api/generate using qwen2.5:3b.
1. Install Ollama from https://ollama.com/
2. Open a terminal and run: ollama pull qwen2.5:3b
3. Start the model with: ollama run qwen2.5:3b
4. Browser security may block direct calls from a file:// page. For a more reliable setup, serve the folder from localhost (for example, with VS Code Live Server) and configure Ollama's OLLAMA_ORIGINS to allow that local origin, then restart Ollama. Only allow trusted local origins.
5. Reopen the page from your local server and test Generate. If the model is unavailable or blocked, the demo fallback remains available.

IMPORTANT
- This is a frontend prototype. It does not upload product details to a remote server.
- The local-model option is not guaranteed to work until Ollama and browser CORS are configured.
- The page uses Google Fonts when internet is available; browser fallback fonts are used offline.
- Review generated titles, tags, and product claims before publishing.
- Do not claim the project uses AI in demo mode. For the challenge submission, explain that open-weight local inference is the intended AI path, and test it before claiming it works.
