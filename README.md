# FARMEASY

🌾 FarmEasy – Smart Agriculture Assistance Platform
📌 What Your Project Does

FarmEasy is a digital agriculture support system designed to help farmers monitor crops, get advisory support, access insurance services, predict yield, and streamline farm management.
The platform empowers rural farmers with technology to improve productivity and transparency.

🧩 Problem Statement & Solution
🔴 Problem

Farmers face challenges like:

Lack of awareness of crop health

Limited access to government schemes & insurance

Poor data-based decision making

Low technological literacy in rural areas

✔ Solution

FarmEasy bridges this gap by providing:

Crop health detection using AI & camera feeds

Smart dashboards for insurance, advisories, and yield prediction

Offline-friendly interface for village deployment

Easy onboarding to PM Fasal Bima Yojana

Local language support for accessibility

✨ Features

✔ Smart crop diagnostics through camera / drone feeds
✔ Farmer onboarding for PMFBY
✔ Yield prediction module
✔ Policy generation & claim submission
✔ Advisory recommendation engine
✔ Farm inputs guide – pesticides, fertilizers, irrigation
✔ Multilingual interface (Hindi, Bengali, English etc.)
✔ Admin dashboard for analytics

🛠 Technologies Used

Frontend: React / Next.js / Tailwind

Backend: Node.js / Express / Python Flask (for AI services)

Database: MongoDB

AI/ML Models: OpenCV, TensorFlow/PyTorch models for crop detection

Deployment: AWS EC2 / Render / Railway

Other: IP Camera / USB Camera feed integration

⚙️ Steps to Install & Run Locally
🔧 Backend Setup
git clone https://github.com/username/FarmEasy.git
cd FarmEasy/backend
npm install
npm start

💻 Frontend Setup
cd FarmEasy/frontend
npm install
npm run dev

🎯 AI Service (Optional)
cd FarmEasy/AI-service
pip install -r requirements.txt
python app.py

🌍 Any Required Environment Variables

Create a .env file in backend containing:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_KEY=your_key
AWS_SECRET=your_secret
CAMERA_STREAM_URL=http://<ip>:8080/shot.jpg

🧪 Inputs (Screenshots / Sample Output)
🔹 Sample Dashboard

✔ Live video feed analysing crop health
✔ Disease detection alert
✔ Recommended pesticide displayed

🔹 Sample Form

✔ Farmer registration form (Adhaar, land size etc.)

📸 Screenshot Examples

Farmer Panel Dashboard

AI Crop Detection Screen

Insurance Submission Screen
