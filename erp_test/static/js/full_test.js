import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// -----------------------------
// 元素
// -----------------------------
const hrBtn = document.getElementById("hr-btn");
const financeBtn = document.getElementById("finance-btn");
const logisticsBtn = document.getElementById("logistics-btn");
const startBtn = document.getElementById("start-test");

let selectedCategory = ""; // 儲存 HR / Finance / Logistics 類別

// -----------------------------
// 類別按鈕（高亮 + 設定）
// -----------------------------
hrBtn.addEventListener("click", () => {
    selectedCategory = "人力資源規劃";
    highlightSelected(hrBtn);
});

financeBtn.addEventListener("click", () => {
    selectedCategory = "財務管理";
    highlightSelected(financeBtn);
});

logisticsBtn.addEventListener("click", () => {
    selectedCategory = "運籌管理";
    highlightSelected(logisticsBtn);
});

function highlightSelected(btn) {
    document.querySelectorAll(".category-container button").forEach(b => {
        b.classList.remove("active");
    });
    btn.classList.add("active");

    // 啟用「開始測驗」
    startBtn.classList.add("enabled");
}


// -----------------------------
// 開始測驗
// -----------------------------
startBtn.addEventListener("click", async () => {
    if (!selectedCategory) {
        alert("請先選擇題庫！");
        return;
    }

    // 取得 Firestore 題目
    const questions = await loadQuestions(selectedCategory);

    if (questions.length === 0) {
        alert("此題庫尚無資料！");
        return;
    }

    // 抽 70 題
    const selected = shuffleArray(questions).slice(0, 70);

    // 存到 localStorage
    localStorage.setItem("full_test_questions", JSON.stringify(selected));
    localStorage.setItem("test_category", selectedCategory);

    // 跳轉
    window.location.href = "full_test_play.html";
});

// -----------------------------
// 從 Firestore 載入題目
// -----------------------------
// 你的結構：
// 人力資源規劃 / Q001 / Q001 / (題目資料)
// -----------------------------
async function loadQuestions(categoryName) {
    try {
        // 🔥 正確：直接抓這個集合
        const colRef = collection(db, categoryName);

        const snap = await getDocs(colRef);
        const list = [];

        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        return list;
    } catch (err) {
        console.error("讀取題庫錯誤：", err);
        return [];
    }
}


// -----------------------------
// 洗牌
// -----------------------------
function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
