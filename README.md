# Date Night Planner
## WDD 330 Final Project

Helps indecisive people plan a date night by browsing local events (Go Out)
or trending movies/shows and where to stream them (Stay In). Save favorites
to a plan, filter by budget/distance/rating, and search by name or tag.

### Prerequisites

- Node installed to run the commands below.
- RapidAPI keys for:
  - Global Hyper-Local Events (LotaData)
  - Streaming Availability (Movie of the Night)

### Common Workflow Commands

- `npm install` install dependencies
- `npm run start` starts a local dev server with hot reload
- `npm run lint` run ESLint
- `npm run format` run Prettier
- `npm run build` build final files for deployment

### Project Structure

- `src/index.html` — landing page / saved plans
- `src/in/index.html` — Stay In (streaming)
- `src/out/index.html` — Go Out (events)
- `src/js/` — page entry scripts + shared `.mjs` service/render classes
- `src/public/partials/` — shared header/footer HTML
- `src/public/json/` — sample/mock data for offline development
- `src/public/images/` — static image assets

### Deploying to Render

1. Push this repo to GitHub.
2. In Render, create a new **Static Site** connected to the repo.
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add a `VITE_RAPID_API_KEY` environment variable in the Render dashboard
   (see `.env.sample`) — do not commit the real key.
6. Because pages live at different depths (`/`, `/in/`, `/out/`), use
   absolute paths (leading `/`) for all CSS/JS/partial references so links
   resolve the same way regardless of which page loaded them.

### Trello

https://trello.com/b/vRQMCe7h/date-planner
