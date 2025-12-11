import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// -------------------------
// Firebase 設定
// -------------------------
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

// 從 localStorage 讀取關卡號碼 (由 quiz.js 存入的 selected_level)
const level = Number(localStorage.getItem("selected_level"));
// 顯示關卡號碼 (假設 HTML 中有 .level-title 元素)
document.querySelector(".level-title").textContent = `第 ${level} 關`;

let selectedCategory = "";
const categoryButtons = document.querySelectorAll(".category-item");

categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {       
        selectedCategory = btn.dataset.cat; 
        categoryButtons.forEach(b => {           
            b.style.backgroundColor = "";
            b.style.color = ""; 
            b.classList.remove("selected"); 
        });
        btn.classList.add("selected");
    });
});

// 題數對照關卡 (根據您的需求：5, 10, 15, 20, 25, 30 題)
function getQuestionCount(level) {
    if (level <= 5) return 5;
    if (level <= 10) return 10;
    if (level <= 15) return 15;
    if (level <= 20) return 20;
    if (level <= 25) return 25;
    return 30;
}

// 開始闖關
document.getElementById("start-btn").addEventListener("click", async () => {
    if (!selectedCategory) {
        alert("請先選擇題庫！");
        return;
    }

    const need = getQuestionCount(level);

    // 🎯 修正：使用正確的頂層集合路徑
    const colRef = collection(db, selectedCategory); 
    
    try {
        const snap = await getDocs(colRef);
        // 確保題目數據正確，每個題目文件應該有 options 和 answer 欄位
        const questions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (questions.length === 0) {
            alert(`題庫 [${selectedCategory}] 尚未建立或路徑錯誤！`);
            return;
        }
        
        // 如果實際題目少於所需題目，則取全部
        const countToSlice = Math.min(questions.length, need);

        const selected = shuffle(questions).slice(0, countToSlice);

        // 🎯 修正：使用統一的鍵名儲存
        localStorage.setItem("current_level", level);
        localStorage.setItem("current_category", selectedCategory);
        localStorage.setItem("current_questions", JSON.stringify(selected));

        window.location.href = "level_play.html";
    } catch (err) {
        console.error("載入題目失敗:", err);
        alert("載入題目失敗，請檢查網路連線或 Firebase 規則！");
    }
});

// 洗牌
function shuffle(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}