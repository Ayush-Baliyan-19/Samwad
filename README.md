<p align="center">  
    <h1 align='center'>🗣️SAMWAD🗣️</h1>  
    <h3 align='center'>Real-Time Hand Sign Detection Video Conferencing</h3>  
</p>

<p align="center"> <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js Badge"/> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js Badge"/> <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.IO Badge"/> <img src="https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white" alt="WebRTC Badge"/> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS Badge"/> <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge"/> </p>

---

## 📖 Overview

**SAMWAD** is a real-time, peer-to-peer video conferencing platform enhanced with **live hand sign detection**. It handles:

- **User matchmaking**
- **WebRTC signaling**
- **Real-time video + data exchange**

Designed for **scalability** and **responsiveness**, it establishes **direct peer-to-peer** (P2P) connections, seamlessly sharing video streams and AI-predicted hand sign data.

---

## ✨ Features

- **🔴 Real-time Communication**  
  Low-latency messaging powered by **Socket.IO** for signaling and hand sign data sharing.

- **🔗 User Matchmaking**  
  Smart matchmaking system automatically pairs users into private rooms.

- **📡 WebRTC Signaling**  
  Manages offer/answer exchange and ICE candidate negotiation for P2P connections.

- **🖐️ Live Hand Sign Prediction**  
  Exchange AI-predicted hand sign data in real time alongside video streams.

- **🎨 Modern, Themed UI**  
  Beautiful, responsive frontend with **Tailwind CSS** supporting **light and dark** modes.

---

## 🏛️ Architecture

- **Backend**  
  A **Node.js** server using **Express** and **Socket.IO** for:
  - User connection management
  - Matchmaking queue
  - WebRTC signaling

  ✨ Main components:
  - `UserManager` ➔ Manages active users & matchmaking
  - `RoomManager` ➔ Handles room creation & WebRTC events

- **Frontend**  
  A **Next.js** client that:
  - Connects to the backend
  - Manages WebRTC media streams
  - Displays live hand sign predictions over the video

- **Peer-to-Peer Connection**  
  After matchmaking, clients communicate directly via **WebRTC**, with the server only assisting in initial setup.

---

## 🛠️ Tech Stack

- **Backend**
  - Node.js
  - Express
  - Socket.IO
  - TypeScript

- **Frontend**
  - Next.js
  - React
  - Tailwind CSS
  - TypeScript

- **Design Patterns**
  - **Manager Pattern** for scalable and clean architecture (`UserManager`, `RoomManager`)

---

## 🚀 Getting Started

Follow these steps to run the project locally:

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   ```

2. **Start the Backend Server**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Start the Frontend Application**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open Your Browser**  
   Visit [http://localhost:3000](http://localhost:3000) to start using the app.

---

## 🗂️ Project Structure

```bash
/backend
└── src/
    ├── index.ts            # Backend server entry point
    └── manager/
        ├── UserManager.ts  # Handles user matchmaking
        └── RoomManager.ts  # Manages rooms and WebRTC signaling

/frontend
└── src/
    └── app/
        ├── components/     # React UI components
        └── globals.css     # Global styling
    └── tailwind.config.ts  # TailwindCSS configuration
```

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to change.