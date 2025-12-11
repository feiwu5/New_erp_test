import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getFirestore, doc, updateDoc, arrayUnion, getDoc 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 引入關卡配置表 (位於同目錄)
import { getConfigByLevel } from '/static/js/level_config.js';

// -------------------------
// Firebase 設定 (保持不變)
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
// DOM 元素 (全域變數)
// -------------------------
let resultTitle, resultMessage, restartBtn, rewardAnimation;


// -------------------------
// 錯題記錄和次數更新邏輯 (保持不變)
// -------------------------
async function logWrongQuestions(wrongQuestions, playerId, category) {
    if (!playerId || wrongQuestions.length === 0) {
        return;
    }
    
    try {
        const playerRef = doc(db, "players", playerId);
        const playerSnap = await getDoc(playerRef);

        if (!playerSnap.exists()) {
            console.error("找不到玩家文件，無法更新錯題集。");
            return;
        }

        const playerData = playerSnap.data();
        const existingWrongQuestions = playerData.wrongQuestions || {}; 
        let updateData = {}; 

        wrongQuestions.forEach(q => {
            const questionId = q.id;
            
            // 累加錯誤次數
            updateData[`wrongQuestions.${questionId}.count`] = (existingWrongQuestions[questionId]?.count || 0) + 1;
            // 更新最後作答時間
            updateData[`wrongQuestions.${questionId}.lastAnswered`] = new Date();

            // 如果是新錯題，則加入基本資訊
            if (!existingWrongQuestions[questionId]) {
                updateData[`wrongQuestions.${questionId}.id`] = questionId;
                updateData[`wrongQuestions.${questionId}.question`] = q.question;
                updateData[`wrongQuestions.${questionId}.category`] = category; 
            }
        });
        
        await updateDoc(playerRef, updateData);
        console.log(`錯題集更新成功！共記錄 ${wrongQuestions.length} 題錯誤。`);

    } catch (error) {
        console.error("更新錯題集時發生錯誤:", error);
    }
}


// -------------------------
// 失敗處理：導回開始測驗頁面 (保持不變)
// -------------------------
function handleFailure(message) {
    resultTitle.textContent = "闖關失敗！";
    resultTitle.style.color = "#d9534f"; // 紅色
    resultMessage.innerHTML = `
        <p>${message}</p>
        <p>請重新挑戰以獲得食材。</p>
    `;
    restartBtn.textContent = "重新開始闖關";
    restartBtn.onclick = () => {
        // 假設 quiz.html 在當前目錄
        window.location.href = "quiz.html"; 
    };
    if (rewardAnimation) {
        rewardAnimation.style.display = 'none';
    }
}

// -------------------------
// 成功處理：發放獎勵 (保持不變)
// -------------------------
async function grantReward(levelConfig, playerId, currentLevel) {
    const ingredientName = levelConfig.rewardName;
    const ingredientImg = levelConfig.rewardImg;
    
    const playerRef = doc(db, "players", playerId);
    try {
        await updateDoc(playerRef, {
            // 將新食材加入玩家的 unlockedIngredients 陣列
            unlockedIngredients: arrayUnion(ingredientName), 
            // 更新玩家已通過的最高關卡
            highestLevelCompleted: currentLevel
        });
    } catch (error) {
        console.error("更新玩家食材庫失敗:", error);
    }
    
    resultTitle.textContent = "闖關成功！";
    resultTitle.style.color = "#5cb85c"; // 綠色
    resultMessage.innerHTML = `<p>恭喜！您成功通過第 ${currentLevel} 關！</p>`;
    
    // 獎勵動畫處理
    if (rewardAnimation) {
        rewardAnimation.innerHTML = ''; 
        rewardAnimation.style.display = 'block';
        
        const imgElement = document.createElement('img');
        const encodedImgSrc = `/static/images/${encodeURIComponent(ingredientImg)}`; 
        
        imgElement.src = encodedImgSrc; 
        imgElement.alt = ingredientName;
        imgElement.className = 'reward-img-animate'; 

        const rewardBox = document.createElement('div');
        rewardBox.className = 'reward-box'; 

        const h3 = document.createElement('h3');
        h3.textContent = `獲得食材：${ingredientName}`;
        
        const p = document.createElement('p');
        p.textContent = "已自動加入您的食材庫";
        
        rewardBox.appendChild(h3);
        rewardBox.appendChild(p);

        rewardAnimation.appendChild(imgElement); 
        rewardAnimation.appendChild(rewardBox);
    }


    restartBtn.textContent = "返回選關畫面";
    restartBtn.onclick = () => {
        // 假設 quiz.html 在當前目錄
        window.location.href = "quiz.html"; 
    };
}


// -------------------------
// 🎯 核心新增：渲染詳細報告
// -------------------------
function renderDetailedReport(questions, userAnswers) {
    const detailList = document.getElementById("results-detail-list");
    if (!detailList) return;
    
    detailList.innerHTML = '';
    
    questions.forEach((q, qIndex) => {
        const userAnswerIndex = userAnswers[qIndex];
        const correctAnswerIndex = parseInt(q.answer); 
        const isCorrect = (userAnswerIndex === correctAnswerIndex);
        
        const item = document.createElement('div');
        item.className = 'r-question-item'; 
        
        const questionText = document.createElement('div');
        questionText.className = 'r-question-text';
        questionText.textContent = `${qIndex + 1}. ${q.question}`;
        item.appendChild(questionText);

        const optionsList = document.createElement('ul');
        optionsList.className = 'r-options-list'; 

        q.options.forEach((opt, oIndex) => {
            const li = document.createElement('li');
            li.className = 'r-option-item'; 
            const optionLabel = String.fromCharCode(65 + oIndex); // 0 -> A, 1 -> B ...
            li.textContent = `${optionLabel}. ${opt}`;

            // 標記正確答案
            if (oIndex === correctAnswerIndex) {
                li.classList.add('r-correct-answer'); 
                li.textContent += ' (正確答案)';
            }
            // 標記使用者選擇的答案
            if (oIndex === userAnswerIndex) {
                li.classList.add('r-user-answer');
                if (oIndex !== correctAnswerIndex) {
                    li.classList.add('r-wrong-answer');
                }
            }
            optionsList.appendChild(li);
        });
        item.appendChild(optionsList);

        const status = document.createElement('div');
        status.className = 'r-result-status';
        if (userAnswerIndex === undefined) {
            status.textContent = '狀態: 未作答';
        } else if (isCorrect) {
            status.classList.add('correct');
            status.textContent = '狀態: 回答正確';
        } else {
            status.classList.add('wrong');
            status.textContent = '狀態: 回答錯誤';
        }
        item.appendChild(status);
        detailList.appendChild(item);
    });
}


// -------------------------
// 主判定邏輯
// -------------------------
function checkLevelSuccess() {
    const rawAnswers = localStorage.getItem("user_answers");
    const currentLevel = Number(localStorage.getItem("current_level"));
    const rawQuestions = localStorage.getItem("current_questions");
    const playerId = localStorage.getItem("playerId");
    const category = localStorage.getItem("current_category"); 

    if (!rawAnswers || !rawQuestions || !playerId || isNaN(currentLevel)) {
        handleFailure("數據錯誤，請從選單重新開始。");
        return;
    }

    const levelConfig = getConfigByLevel(currentLevel);
    if (!levelConfig) {
        handleFailure(`找不到第 ${currentLevel} 關的設定。`);
        return;
    }

    const questions = JSON.parse(rawQuestions);
    const userAnswers = JSON.parse(rawAnswers);

    let incorrectCount = 0;
    const wrongQuestionsToLog = []; 

    // 1. 計算錯誤題數 & 收集錯題數據
    questions.forEach((q, index) => {
        const userAnswerIndex = userAnswers[index];
        const correctAnswerIndex = parseInt(q.answer);

        if (userAnswerIndex !== undefined && userAnswerIndex !== correctAnswerIndex) {
            incorrectCount++;
            wrongQuestionsToLog.push(q); 
        }
    });

    // 🎯 關鍵：渲染詳細報告
    renderDetailedReport(questions, userAnswers);
    
    // 2. 執行闖關判定
    const maxMistakesAllowed = levelConfig.maxMistakes;
    
    if (incorrectCount <= maxMistakesAllowed) {
        // 成功！
        grantReward(levelConfig, playerId, currentLevel);
    } else {
        // 失敗！
        handleFailure(`您的錯誤題數為 ${incorrectCount} 題，超過了容錯上限 (${maxMistakesAllowed} 題)。`);
    }

    // 3. 記錄錯題集 (無論成功或失敗都記錄)
    logWrongQuestions(wrongQuestionsToLog, playerId, category); 
}


// -------------------------
// DOM 載入與初始化
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
    // 獲取 DOM 元素
    resultTitle = document.getElementById("result-title");
    resultMessage = document.getElementById("result-message");
    restartBtn = document.getElementById("restart-btn");
    rewardAnimation = document.getElementById("reward-animation");
    
    // 開始判定流程
    checkLevelSuccess();
});