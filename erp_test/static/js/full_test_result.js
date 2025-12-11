import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getFirestore, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// -------------------------
// Firebase 設定 (必須複製 index.html 的設定)
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
// 錯題和分數更新函式
// -------------------------
async function updateWrongQuestions(wrongQuestions, finalScore, totalQuestions, playerId) {
    if (!playerId) {
        return; 
    }
    
    try {
        const playerRef = doc(db, "players", playerId);
        let updateData = {}; 

        // 1. 寫入本次測驗結果 (分數和總題數)
        updateData.lastTestScore = finalScore;
        updateData.lastTestTotalQuestions = totalQuestions;
        updateData.lastTestDate = new Date();
        
        // 2. 處理錯題集 (僅當有錯題時才處理)
        if (wrongQuestions.length > 0) {
            const playerSnap = await getDoc(playerRef);
            // 使用 read/write 邏輯，確保錯題次數準確
            const existingWrongQuestions = playerSnap.exists() ? playerSnap.data().wrongQuestions || {} : {}; 

            wrongQuestions.forEach(q => {
                const questionId = q.id;
                
                // 檢查是否已存在，然後更新 count
                // 使用 (existingWrongQuestions[questionId]?.count || 0) + 1 確保 count 存在
                updateData[`wrongQuestions.${questionId}.count`] = (existingWrongQuestions[questionId]?.count || 0) + 1;
                updateData[`wrongQuestions.${questionId}.lastAnswered`] = new Date();
                
                if (!existingWrongQuestions[questionId]) {
                    // 如果是新錯題，儲存題目細節
                    updateData[`wrongQuestions.${questionId}.id`] = questionId;
                    updateData[`wrongQuestions.${questionId}.question`] = q.question; 
                    updateData[`wrongQuestions.${questionId}.category`] = q.category; 
                }
            });
        }
        
        // 🎯 執行寫入
        await updateDoc(playerRef, updateData);
        console.log(`測驗結果和錯題集更新成功！得分: ${finalScore.toFixed(0)}`);

    } catch (error) {
        console.error("更新數據時發生錯誤:", error);
    }
}


// -------------------------
// DOM 載入與計算邏輯
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
    // 獲取儲存在 localStorage 的數據
    const rawQuestions = localStorage.getItem("all_questions");
    const rawUserAnswers = localStorage.getItem("user_answers");
    const category = localStorage.getItem("test_category") || "未知分類";
    
    // 🎯 關鍵：獲取玩家 ID
    const playerId = localStorage.getItem("playerId"); 
    
    // 儲存錯誤題目的陣列
    const wrongQuestions = []; 

    if (!rawQuestions || !rawUserAnswers) {
        document.getElementById("result-title").textContent = "錯誤：找不到測驗資料";
        document.getElementById("category-info").textContent = "請確保已完成測驗並儲存了答案。";
        return;
    }

    const questions = JSON.parse(rawQuestions);
    const userAnswers = JSON.parse(rawUserAnswers);
    let correctCount = 0;
    let incorrectCount = 0;
    const totalQuestions = questions.length;

    // 設置標題資訊
    document.getElementById("category-info").textContent = `分類: ${category}`;

    // 渲染答題詳情
    const detailList = document.getElementById("results-detail-list");
    questions.forEach((q, qIndex) => {
        // 🚨 修正：確保正確答案索引被強制轉換為數字
        const correctAnswerIndex = parseInt(q.answer); 
        const userAnswerIndex = userAnswers[qIndex];
        
        // 計算分數
        const isCorrect = (userAnswerIndex === correctAnswerIndex);
        if (isCorrect) {
            correctCount++;
        } else if (userAnswerIndex !== undefined) {
            incorrectCount++;
            
            // 🎯 新增邏輯：如果答錯，將題目加入錯題集
            wrongQuestions.push({
                id: q.id,
                question: q.question,
                category: category // 將類別傳遞給錯題集
            });
        }

        // 建立題目詳情 HTML 元素
        const item = document.createElement('div');
        item.className = 'r-question-item'; 
        // 題目文字
        const questionText = document.createElement('div');
        questionText.className = 'r-question-text'; 
        questionText.textContent = `${qIndex + 1}. ${q.question}`;
        item.appendChild(questionText);

        // 選項列表
        const optionsList = document.createElement('ul');
        optionsList.className = 'r-options-list'; 

        q.options.forEach((opt, oIndex) => {
            const li = document.createElement('li');
            li.className = 'r-option-item'; 
            const optionLabel = String.fromCharCode(65 + oIndex);
            li.textContent = `${optionLabel}. ${opt}`;

            // 標記正確答案
            if (oIndex === correctAnswerIndex) {
                li.classList.add('r-correct-answer'); 
                li.textContent += ' (正確答案)';
            }

            // 標記用戶選擇的答案
            if (oIndex === userAnswerIndex) {
                li.classList.add('r-user-answer'); 
                // 如果用戶選錯，標記為錯誤
                if (oIndex !== correctAnswerIndex) {
                    li.classList.add('r-wrong-answer'); 
                }
            }

            optionsList.appendChild(li);
        });
        item.appendChild(optionsList);

        // 顯示結果狀態
        const status = document.createElement('div');
        if (userAnswerIndex === undefined) {
            status.className = 'r-result-status'; 
            status.textContent = '狀態: 未作答';
        } else if (isCorrect) {
            status.className = 'r-result-status correct'; 
            status.textContent = '狀態: 回答正確';
        } else {
            status.className = 'r-result-status wrong'; 
            status.textContent = '狀態: 回答錯誤';
        }
        item.appendChild(status);

        detailList.appendChild(item);
    });

    // 顯示最終成績
    const finalScore = (correctCount / totalQuestions) * 70 || 0;
    
    document.getElementById("final-score").textContent = finalScore.toFixed(0);
    document.getElementById("total-questions").textContent = totalQuestions;
    document.getElementById("correct-count").textContent = correctCount;
    document.getElementById("incorrect-count").textContent = incorrectCount;
    
    // ----------------------------------------------------------------
    // 🎯 關鍵步驟：呼叫函式更新錯題集和分數
    // ----------------------------------------------------------------
    if (playerId) {
        // 🚨 傳遞新的 finalScore 和 totalQuestions 參數
        updateWrongQuestions(wrongQuestions, finalScore, totalQuestions, playerId); 
    } else {
        console.error("無法找到 playerId，結果未上傳。請檢查登入腳本。");
    }
});