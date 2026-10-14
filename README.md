# SkillTrail

SkillTrail turns a learning goal into a clear, editable weekly path. It is a small, private-by-design web app built with HTML, CSS, and JavaScript. It runs directly in the browser, including on GitHub Pages.

## What it does

- Start from three practical six-week programs or make a custom 4–12 week path.
- Check off steps, add your own steps, and see progress by week and across the whole path.
- Keep multiple paths on one device.
- Export all paths as JSON and import them into another browser. Existing paths are not duplicated.
- Use it on desktop or mobile, with keyboard-accessible controls.

## Run locally

Serve the repository root with any static web server. For example, with Python:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`. ES modules do not run reliably from a `file://` URL.

## Test

Requires Node.js 20 or later. No package installation is needed.

```sh
npm test
npm run check
```

## Privacy and data

Your paths are stored in your browser's `localStorage` under `skilltrail:v1`. This repository contains no account system, analytics, external API requests, or secrets. Clearing site data removes local progress unless you exported a backup. Imports are limited to 2 MB and checked for the expected data shape.

## Deployment

Publish the repository root from the `main` branch with GitHub Pages. No build step or backend is required.

## License

MIT — see [LICENSE](LICENSE).
