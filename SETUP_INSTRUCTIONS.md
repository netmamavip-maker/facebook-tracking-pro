# Facebook Tracker Premium - Setup Instructions

## 🎯 Complete Setup Guide

### Part 1: Backend Setup (Python/Flask)

#### 1.1 Create Backend Folder Structure
```
facebook-tracker-backend/
├── app.py
├── requirements_backend.txt
├── render_backend.yaml
└── tracker.db (auto-created)
```

#### 1.2 Install Dependencies
```bash
pip install -r requirements_backend.txt
```

#### 1.3 Create .env file (for local testing)
```
FB_EMAIL=your_facebook_email@gmail.com
FB_PASSWORD=your_facebook_password
PORT=5000
```

#### 1.4 Run Backend Locally
```bash
python app.py
```
Backend will be available at `http://localhost:5000`

---

### Part 2: Frontend Setup (React)

#### 2.1 Create Frontend Folder Structure
```
facebook-tracker-frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── ProfileCard.jsx
│   │   ├── AddProfile.jsx
│   │   ├── Analytics.jsx
│   │   ├── Settings.jsx
│   │   └── Header.jsx
│   ├── styles/
│   │   └── App.css
│   └── index.js
├── package.json
└── .env.local
```

#### 2.2 Create .env.local
```
REACT_APP_API_URL=http://localhost:5000
```

#### 2.3 Install Dependencies
```bash
cd frontend
npm install
```

#### 2.4 Run Frontend
```bash
npm start
```
Frontend will be available at `http://localhost:3000`

---

### Part 3: Deployment to Render

#### 3.1 Create GitHub Repository

1. Create new repo: `facebook-tracker-premium`
2. Push all files:
```bash
git init
git add .
git commit -m "Initial commit: Facebook Tracker Premium"
git remote add origin https://github.com/YOUR_USERNAME/facebook-tracker-premium.git
git push -u origin main
```

#### 3.2 Deploy Backend on Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Settings:
   - Name: `facebook-tracker-backend`
   - Root Directory: `/`
   - Build Command: `pip install -r requirements_backend.txt`
   - Start Command: `python app.py`
   - Environment:
     - `FB_EMAIL`: Your Facebook email
     - `FB_PASSWORD`: Your Facebook password
     - `PORT`: `5000`

5. Deploy

#### 3.3 Deploy Frontend on Render

1. New → Static Site
2. Connect same GitHub repository
3. Settings:
   - Name: `facebook-tracker-frontend`
   - Publish Directory: `frontend/build`
   - Build Command: `cd frontend && npm install && npm run build`
   - Environment:
     - `REACT_APP_API_URL`: `https://facebook-tracker-backend.onrender.com`

4. Deploy

---

### Part 4: Configuration

#### 4.1 Update Frontend API URL
After backend is deployed, update:
`.env.local` (or in frontend build settings)
```
REACT_APP_API_URL=https://facebook-tracker-backend.onrender.com
```

#### 4.2 Test Connection
- Open frontend URL
- Try adding a profile
- Verify real-time updates

---

## 📋 File Descriptions

### Backend (Python)
- **app.py**: Main Flask application with all API endpoints
- **requirements_backend.txt**: Python dependencies

### Frontend (React)
- **App.jsx**: Main React component
- **Dashboard.jsx**: Main tracking dashboard
- **ProfileCard.jsx**: Individual profile display
- **AddProfile.jsx**: Profile input form
- **Analytics.jsx**: Statistics and history
- **Settings.jsx**: Configuration page
- **Header.jsx**: Navigation header
- **App.css**: Main styles

### Deployment
- **render_backend.yaml**: Render configuration
- **render_frontend.yaml**: Frontend deployment config

---

## 🔐 Security Notes

1. **Never commit credentials to GitHub**
   - Use Environment Variables in Render dashboard
   - Keep .env file in .gitignore

2. **Facebook Account**
   - Use dedicated bot account (not personal)
   - Store credentials in Render environment

3. **CORS**
   - Configured for all origins (update in production)
   - Frontend-Backend communication secure

---

## 🧪 Testing

### Local Testing
1. Run both backend and frontend locally
2. Test adding profiles
3. Verify 30-second updates
4. Check analytics page

### Render Testing
1. Deploy both services
2. Go to frontend URL
3. Add test profile
4. Verify updates in real-time
5. Check backend logs for errors

---

## 🆘 Troubleshooting

### Issue: "Failed to connect to backend"
**Solution**: Check REACT_APP_API_URL matches deployed backend URL

### Issue: "Facebook login failed"
**Solution**: Verify FB_EMAIL and FB_PASSWORD in Render environment

### Issue: "No profiles loading"
**Solution**: 
- Check backend logs
- Verify database is initialized
- Try manual refresh

### Issue: "Profiles not updating"
**Solution**:
- Wait 30 seconds for next check
- Manually refresh (click refresh button)
- Check server logs

---

## 📞 Support

For issues:
1. Check backend logs on Render
2. Check frontend browser console
3. Verify credentials
4. Restart services

---

## ✅ Success Checklist

- [ ] All files downloaded
- [ ] Backend folder created
- [ ] Frontend folder created
- [ ] Dependencies installed
- [ ] .env files created
- [ ] Local testing successful
- [ ] GitHub repo created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Render
- [ ] Environment variables set
- [ ] First profile added successfully
- [ ] Real-time updates working

---

**You're all set! Start tracking Facebook profiles in real-time.** 🚀
