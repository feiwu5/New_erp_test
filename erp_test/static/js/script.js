import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getFirestore, collection, query, where, getDocs, addDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyBGmdTWLvh00bp4yg7pGNRBDfV5u71Dg-w",
    authDomain: "erptest-6a27e.firebaseapp.com",
    projectId: "erptest-6a27e",
    storageBucket: "erptest-6a27e.firebasestorage.app",
    messagingSenderId: "452335653196",
    appId: "1:452335653196:web:b720ba373ac317493e7fe9",
    measurementId: "G-9MTLH6QCCN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 按鈕事件
document.getElementById("startBtn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    if (!username) return; 

    const playersRef = collection(db, "players");
    const q = query(playersRef, where("name", "==", username));
    const querySnapshot = await getDocs(q);

    let isNew = querySnapshot.empty;
    let playerId = null; // 儲存玩家 ID

    if (isNew) {
        // 🚨 新增玩家：使用 addDoc，然後獲取其 ID
        const newDocRef = await addDoc(playersRef, {
            name: username,
            createdAt: new Date(),
            lastLogin: new Date(),
            score: 0 
        });
        playerId = newDocRef.id;
    } else {
        // 🚨 舊玩家：更新 lastLogin 並獲取其 ID
        for (const doc of querySnapshot.docs) {
            await updateDoc(doc.ref, { lastLogin: new Date() });
            playerId = doc.id; // 獲取現有的文件 ID
        }
    }

    // 🎯 儲存玩家資訊
    localStorage.setItem("username", username);
    localStorage.setItem("playerId", playerId);
    localStorage.setItem("isNewPlayer", isNew ? "true" : "false");

    // 🚨 修正點：使用從 HTML 傳入的全域變數 (GAME_URL) 進行跳轉
    if (typeof GAME_URL !== 'undefined') {
        window.location.href = GAME_URL;
    } else {
        // 作為備用 (不推薦使用)
        window.location.href = "game.html"; 
    }
});