import { getConfigByLevel } from "./level_config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// -------------------------
// Firebase 設定 (需要讀取玩家狀態)
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

// ==========================================================
// 🎯 核心修改區域：renderPage 函式 (實現關卡鎖定邏輯)
// ==========================================================
function renderPage() {
    levelGrid.innerHTML = ""; // 清空原本格子

    const startLevel = (currentPage - 1) * levelsPerPage + 1;
    const endLevel = Math.min(startLevel + levelsPerPage - 1, totalLevels);

    for (let i = startLevel; i <= endLevel; i++) {
        const box = document.createElement("div");
        box.className = "level-box";
        box.textContent = `第${i}關`;

        // --- 狀態檢查 ---
        const isPassed = i <= highestLevelCompleted;
        const isNextLevel = i === highestLevelCompleted + 1; // 玩家可以挑戰的下一關
        const isLocked = i > highestLevelCompleted + 1;       // 尚未解鎖

        // 可點擊的條件：已過關 (重玩) 或 下一關 (挑戰)
        const isSelectable = isPassed || isNextLevel; 

        // --- 樣式設定 ---
        if (isPassed) {
            // 狀態 A: 已過關
            box.classList.add("passed"); 
            const cfg = getConfigByLevel(i);
            const imgSrc = cfg ? `../images/${encodeURIComponent(cfg.rewardImg)}` : "";

            box.innerHTML = `
                <div class="ingredient-badge">
                    <img src="${imgSrc}" alt="${cfg.rewardName}">
                </div>
                <span class="level-number">第${i}關</span>
                <span class="status-text">已過關</span>
            `;
        } else if (isNextLevel) {
            // 狀態 B: 挑戰中 (下一關)
            box.classList.add("unlocked"); // 新增樣式: 可挑戰
            box.innerHTML = `
                <span class="level-number">第${i}關</span>
                <span class="status-text">可挑戰</span>
            `;
        } else if (isLocked) {
            // 狀態 C: 鎖定
            box.classList.add("locked");
             box.innerHTML = `
                <span class="level-number">第${i}關</span>
                <span class="status-text">鎖定</span>
            `;
        }

        // --- 點擊事件：只允許點擊可選取的關卡 ---
        if (isSelectable) {
            box.addEventListener("click", () => {
                localStorage.setItem("selected_level", i);
                // 跳到 level.html
                window.location.href = "level.html";
            });
        }
        // 如果是鎖定關卡 (isLocked)，則不綁定點擊事件

        levelGrid.appendChild(box);
    }

    // 控制上一頁/下一頁按鈕顯示
    prevBtn.style.display = currentPage === 1 ? "none" : "block";
    nextBtn.style.display = currentPage * levelsPerPage >= totalLevels ? "none" : "block";
}
// ==========================================================
// 🎯 核心修改區域結束
// ==========================================================


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
// 初始化 (新增載入進度)
// -------------------------
async function init() {
    await loadPlayerStatus(); // 等待玩家進度載入
    renderPage();             // 渲染關卡列表
}
init(); // 啟動初始化流程
