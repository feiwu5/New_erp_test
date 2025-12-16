import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// -------------------------
// Firebase 設定 (與其他檔案保持一致)
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

// -------------------------
// DOM 元素
// -------------------------
let wrongQList, loadingMsg, emptyMsg;

document.addEventListener("DOMContentLoaded", () => {
    wrongQList = document.getElementById("wrong-q-list");
    loadingMsg = document.getElementById("loading-msg");
    emptyMsg = document.getElementById("empty-msg");
    
    // 獲取儲存的玩家ID和名稱
    const playerId = localStorage.getItem("playerId");
    const username = localStorage.getItem("username");

    document.getElementById("player-info").textContent = `玩家：${username || 'N/A'}`;

    if (!playerId) {
        wrongQList.innerHTML = `<p style="color:red;">錯誤：找不到玩家ID，請重新登入！</p>`;
        return;
    }

    loadWrongQuestions(playerId);
});

// -------------------------
// 輔助函式：生成帶選項的 HTML
// -------------------------
function createQuestionDetailHTML(fullQuestion, wrongQuestionMetadata, index) {
    // 取得完整題目資訊 (包含 options 和 answer)
    const { question, options, answer } = fullQuestion; 
    // 取得錯題記錄資訊 (包含 count 和 category)
    const { category, count, lastAnswered } = wrongQuestionMetadata; 
    
    // 🚨 確保答案索引是數字
    const correctAnswerIndex = parseInt(answer);
    
    // 格式化選項列表
    const optionsHTML = options.map((opt, oIndex) => {
        const optionLabel = String.fromCharCode(65 + oIndex);
        let liClasses = 'wq-option-item';
        let liText = `${optionLabel}. ${opt}`;

        // 標記正確答案
        if (oIndex === correctAnswerIndex) {
            liClasses += ' wq-correct-answer';
            liText += ' (正確答案)';
        }
        
        return `<li class="${liClasses}">${liText}</li>`;
    }).join('');

    const lastAnsweredText = lastAnswered ? lastAnswered.toDate().toLocaleDateString('zh-TW') : 'N/A';

    return `
        <div class="wq-header">
            <span class="wq-index">${index + 1}.</span>
            <span class="wq-category">[${category || '未分類'}]</span>
            <span class="wq-count">錯${count}次</span>
        </div>
        <div class="wq-question">${question}</div>
        <ul class="wq-options-list">${optionsHTML}</ul>
        <div class="wq-footer">最後作答：${lastAnsweredText}</div>
    `;
}


// -------------------------
// 載入錯題集
// -------------------------
async function loadWrongQuestions(playerId) {
    try {
        const playerRef = doc(db, "players", playerId);
        const playerSnap = await getDoc(playerRef);

        if (!playerSnap.exists()) {
            wrongQList.innerHTML = `<p style="color:red;">找不到玩家數據！</p>`;
            return;
        }

        const wrongQuestionsMap = playerSnap.data().wrongQuestions;
        loadingMsg.style.display = 'none';
        
        if (!wrongQuestionsMap || Object.keys(wrongQuestionsMap).length === 0) {
            emptyMsg.style.display = 'block';
            return;
        }

        // 1. 將 Map 轉換為陣列並按錯誤次數排序
        const wrongQuestionMetadataArray = Object.values(wrongQuestionsMap)
            .sort((a, b) => b.count - a.count); 
            
        // 2. 準備所有完整題目數據的獲取請求 (Promise)
        const fetchPromises = wrongQuestionMetadataArray.map(qMeta => {
            // 題目路徑： /類別名稱/題目ID (e.g. /人力資源規劃/Q001)
            const fullQuestionRef = doc(db, qMeta.category, qMeta.id);
            return getDoc(fullQuestionRef);
        });

        // 3. 並行發送所有請求
        const questionSnaps = await Promise.all(fetchPromises);
        
        wrongQList.innerHTML = ''; // 清空列表

        // 4. 合併數據並渲染
        wrongQuestionMetadataArray.forEach((qMeta, index) => {
            const qSnap = questionSnaps[index];
            
            const item = document.createElement('div');
            item.className = 'wq-item'; 
            
            if (qSnap.exists()) {
                const fullQuestionData = qSnap.data();
                
                // 使用輔助函式生成詳細 HTML
                item.innerHTML = createQuestionDetailHTML(fullQuestionData, qMeta, index);
            } else {
                // 如果找不到原題目文件（可能被刪除了），顯示錯誤訊息
                item.className += ' wq-item-deleted';
                item.innerHTML = `<div class="wq-header">
                                    <span class="wq-index">${index + 1}.</span>
                                    <span class="wq-category">[${qMeta.category || '未分類'}]</span>
                                    <span class="wq-count">錯${qMeta.count}次</span>
                                </div>
                                <div class="wq-question">錯誤：找不到原題目 (${qMeta.id})，可能已被刪除。</div>`;
            }
            
            wrongQList.appendChild(item);
        });

    } catch (error) {
        console.error("載入錯題集時發生錯誤:", error);
        wrongQList.innerHTML = `<p style="color:red;">載入錯誤，請檢查連線。</p>`;
    }
}