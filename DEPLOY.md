# Deploy Smart City Map (free)

## One-click: Render + MongoDB Atlas

### 1. MongoDB Atlas (free database)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **free M0** cluster
3. Database Access → add user + password
4. Network Access → **Allow access from anywhere** (`0.0.0.0/0`)
5. Connect → copy connection string, e.g.  
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/smart-city-map`

### 2. Render (free hosting)

1. Push this project to **GitHub** (public or private repo)
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect the repo — Render reads `render.yaml`
4. Set environment variables when prompted:
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_URL` = your Render URL (e.g. `https://smart-city-map.onrender.com`) — set after first deploy, then redeploy
5. After deploy, open the shell on Render and run: `node server/src/seed.js`

Your live link will be: `https://smart-city-map.onrender.com` (or the name you chose).

### 3. Netlify (frontend only, optional)

Netlify serves the **React app** from `client/`. The **API** (Express, MongoDB, Socket.IO) still runs on Render (or any Node host) — same as above.

1. Deploy the API on Render and set `CLIENT_URL` to your **Netlify** site URL (e.g. `https://your-app.netlify.app`), then redeploy the Render service so CORS and Socket.IO accept that origin.
2. In [Netlify](https://www.netlify.com/) → **Add new site** → **Import an existing project** → connect the GitHub repo.
3. Netlify reads `netlify.toml` (build runs inside `client/`). Add **Site configuration → Environment variables** (used at build time):
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-app.onrender.com` (no path; same host as the API)
4. Trigger **Deploy site**. Open the Netlify URL.

CLI alternative (after `npm i -g netlify-cli` and `netlify login`): from the repo root run `netlify init` to link the site, then `netlify deploy --prod`.

### Demo logins (after seed)

- Admin: `admin@smartcity.com` / `admin123`
- User: `demo@smartcity.com` / `demo123`
