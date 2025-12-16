import { getConfigByLevel } from "/static/js/level_config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const totalLevels = 30;      // 總關卡數
const levelsPerPage = 10;    // 每頁顯示 10 關
let currentPage = 1;
let highestLevelCompleted = 0; // 追蹤玩家已通過的最高關卡

const levelGrid = document.getElementById("level-grid");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

async function loadPlayerStatus() {
    const playerId = localStorage.getItem("playerId");
    if (!playerId) {
        console.warn("未找到玩家 ID，無法載入進度。");
        return;
    }
    
    try {
        const playerRef = doc(db, "players", playerId);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists()) {
            // 讀取最高完成關卡號碼
            highestLevelCompleted = playerSnap.data().highestLevelCompleted || 0;
        }
    } catch (error) {
        console.error("載入玩家進度失敗:", error);
    }
}

// 生成當前頁的關卡
function renderPage() {
    levelGrid.innerHTML = ""; // 清空原本格子

    const startLevel = (currentPage - 1) * levelsPerPage + 1;
    const endLevel = Math.min(startLevel + levelsPerPage - 1, totalLevels);

    for (let i = startLevel; i <= endLevel; i++) {
        const box = document.createElement("div");
        box.className = "level-box";
        box.textContent = `第${i}關`;

        // 🎯 核心邏輯：檢查是否已過關
        if (i <= highestLevelCompleted) {
            box.classList.add("passed"); // 添加過關樣式
            
            // 取得該關卡的食材圖
            const cfg = getConfigByLevel(i);
            // 🚨 圖片路徑：使用 ../images/ 是正確的相對路徑
            const imgSrc = cfg ? `/static/images/${encodeURIComponent(cfg.rewardImg)}` : "";
            box.innerHTML = `
                <div class="ingredient-badge">
                    <img src="${imgSrc}" alt="${cfg.rewardName}">
                </div>
                <span class="level-number">第${i}關</span>
                <span class="status-text">已過關</span>
            `;
        }

        // 點擊事件，跳轉到 level.html (題庫選擇頁)
        box.addEventListener("click", () => {
            localStorage.setItem("selected_level", i);
            
            // 🚨 修正跳轉路徑：使用從 HTML 傳入的全域變數 LEVEL_URL
            // 這樣可以確保 Flask 路由正確運作
            if (typeof LEVEL_URL !== 'undefined') {
                window.location.href = LEVEL_URL;
            } else {
                // 作為備用
                window.location.href = "level.html";
            }
        });

        levelGrid.appendChild(box);
    }

    // 控制上一頁/下一頁按鈕顯示
    prevBtn.style.display = currentPage === 1 ? "none" : "block";
    nextBtn.style.display = currentPage * levelsPerPage >= totalLevels ? "none" : "block";
}

// 按鈕事件
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentPage * levelsPerPage < totalLevels) {
        currentPage++;
        renderPage();
    }
});

// -------------------------
// 初始化
// -------------------------
async function init() {
    await loadPlayerStatus(); // 等待玩家進度載入
    renderPage();             // 渲染關卡列表
}
init(); // 啟動初始化流程