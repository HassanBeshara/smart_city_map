# Deploy on Render (HassanBeshara account)

Your PC is logged into GitHub as **HassanBeshara**. Use that account for push + Render.

## 1. Create GitHub repo (one time)

1. Sign in: https://github.com/HassanBeshara
2. New repo: https://github.com/new
3. Name: `smart_city`
4. Public, **no** README / .gitignore
5. Create

## 2. Push from your PC

```powershell
cd C:\Users\HP\Desktop\Smart_city_map
git remote set-url origin https://github.com/HassanBeshara/smart_city.git
git push -u origin main
```

Check: https://github.com/HassanBeshara/smart_city shows `client/`, `server/`, `render.yaml`.

## 3. MongoDB Atlas (free)

1. https://www.mongodb.com/cloud/atlas → M0 cluster
2. User + password, Network Access `0.0.0.0/0`
3. Copy: `mongodb+srv://USER:PASS@cluster....mongodb.net/smart-city-map`

## 4. Render

1. https://dashboard.render.com → **New** → **Blueprint**
2. Connect **GitHub** → authorize **HassanBeshara**
3. Select repo **smart_city** (uses `render.yaml`)
4. When prompted set **MONGODB_URI**
5. After deploy, set **CLIENT_URL** to your Render URL (e.g. `https://smart-city-map.onrender.com`) → redeploy
6. **Shell** on the service: `node server/src/seed.js`

**Or** manual Web Service: Build `npm run build:prod`, Start `npm run start:prod`, root directory blank.

## Demo logins (after seed)

- `admin@smartcity.com` / `admin123`
- `demo@smartcity.com` / `demo123`
