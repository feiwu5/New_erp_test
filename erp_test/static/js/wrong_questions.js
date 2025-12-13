import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getFirestore, doc, getDoc, Timestamp 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// -------------------------
// Firebase 設定 (保留不變)
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
// DOM 元素 (更新 ID/Class 名稱)
// -------------------------
let categorySelectionDiv, questionsDisplayContainer, wrongQList, loadingMsg, emptyMsg, backBtn;

// 全域變數：儲存玩家的原始錯題數據
let allWrongQuestionsMetadata = null; 

document.addEventListener("DOMContentLoaded", () => {
    // 獲取所有相關 DOM 元素 - 使用新的 ID
    categorySelectionDiv = document.getElementById("erp-wq-category-selection"); // <-- 修改 ID
    questionsDisplayContainer = document.getElementById("questions-display-container");
    wrongQList = document.getElementById("wrong-q-list");
    loadingMsg = document.getElementById("loading-msg");
    emptyMsg = document.getElementById("empty-msg");
    backBtn = document.getElementById("erp-wq-back-btn"); // <-- 修改 ID
    
    const playerId = localStorage.getItem("playerId");
    const username = localStorage.getItem("username");

    document.getElementById("player-info").textContent = `玩家：${username || 'N/A'}`;

    if (!playerId) {
        wrongQList.innerHTML = `<p style="color:red;">錯誤：找不到玩家ID，請重新登入！</p>`;
        return;
    }

    // 步驟 1: 僅載入錯題 metadata，不顯示內容，並設定按鈕監聽器
    initializeWrongQuestionPage(playerId);

    // 設定按鈕監聽器 - 使用新的 Class 名稱
    const categoryButtons = document.querySelectorAll('.erp-wq-category-btn'); // <-- 修改 Class
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            displayWrongQuestionsByCategory(category);
        });
    });
    
    // 設定返回按鈕監聽器
    backBtn.addEventListener('click', showCategorySelection);
});

// ... (後續的 showCategorySelection, createQuestionDetailHTML, initializeWrongQuestionPage, displayWrongQuestionsByCategory 邏輯保留不變，因為它們主要操作已在上面修改的 DOM 變數或全域變數) ...


/**
 * 顯示類別選擇介面，隱藏題目顯示區
 */
function showCategorySelection() {
    questionsDisplayContainer.style.display = 'none';
    categorySelectionDiv.style.display = 'block';
    wrongQList.innerHTML = ''; // 清空列表
    emptyMsg.style.display = 'none';
}

// -------------------------
// 輔助函式：生成帶選項的 HTML (用於單一題目) (保留不變)
// -------------------------
function createQuestionDetailHTML(fullQuestion, wrongQuestionMetadata) {
    const { question, options, answer } = fullQuestion; 
    const { count, lastAnswered } = wrongQuestionMetadata; 
    
    const correctAnswerIndex = parseInt(answer);
    
    const optionsHTML = options.map((opt, oIndex) => {
        const optionLabel = String.fromCharCode(65 + oIndex);
        let liClasses = 'wq-option-item';
        let liText = `${optionLabel}. ${opt}`;

        if (oIndex === correctAnswerIndex) {
            liClasses += ' wq-correct-answer';
            liText += ' (正確答案)';
        }
        
        return `<li class="${liClasses}">${liText}</li>`;
    }).join('');

    const lastAnsweredText = lastAnswered instanceof Timestamp ? 
                             lastAnswered.toDate().toLocaleDateString('zh-TW') : 
                             'N/A';

    return `
        <div class="wq-header">
            <span class="wq-count">錯${count}次</span>
        </div>
        <div class="wq-question">${question}</div>
        <ul class="wq-options-list">${optionsHTML}</ul>
        <div class="wq-footer">最後作答：${lastAnsweredText}</div>
    `;
}


// -------------------------
// 核心功能：初始載入所有錯題的 Metadata
// -------------------------
async function initializeWrongQuestionPage(playerId) {
    // 初始載入時，只載入 Metadata，用於判斷是否有錯題，並準備數據
    loadingMsg.textContent = '正在檢查您的錯題集...';
    // 由於 loadingMsg 在 questionsDisplayContainer 內，而 questionsDisplayContainer 預設隱藏，所以這裡先強制顯示 loadingMsg 的容器，但保持 categorySelectionDiv 顯示
    if (questionsDisplayContainer.style.display === 'none') {
        questionsDisplayContainer.style.display = 'block';
    }
    loadingMsg.style.display = 'block';
    categorySelectionDiv.style.display = 'block';


    try {
        const playerRef = doc(db, "players", playerId);
        const playerSnap = await getDoc(playerRef);

        if (!playerSnap.exists()) {
            categorySelectionDiv.innerHTML = `<p style="color:red;">找不到玩家數據！</p>`;
            questionsDisplayContainer.style.display = 'none';
            return;
        }

        allWrongQuestionsMetadata = playerSnap.data().wrongQuestions;
        
        if (!allWrongQuestionsMetadata || Object.keys(allWrongQuestionsMetadata).length === 0) {
            // 如果是空的，則不顯示按鈕，直接顯示恭喜訊息
            categorySelectionDiv.innerHTML = `<p style="font-size:20px; text-align:center;">🎉 恭喜！您的錯題集目前是空的！無需整理！</p>`;
            questionsDisplayContainer.style.display = 'none';
            return;
        }

        // 檢查完畢，隱藏 loading 訊息
        loadingMsg.style.display = 'none';
        questionsDisplayContainer.style.display = 'none'; // 隱藏題目容器，只顯示按鈕

    } catch (error) {
        console.error("初始化載入錯題集時發生錯誤:", error);
        loadingMsg.style.display = 'none';
        categorySelectionDiv.innerHTML = `<p style="color:red;">載入錯誤，請檢查連線。</p>`;
        questionsDisplayContainer.style.display = 'none';
    }
}


// -------------------------
// 核心功能：根據選擇的類別顯示錯題
// -------------------------
async function displayWrongQuestionsByCategory(selectedCategory) {
    if (!allWrongQuestionsMetadata) {
        alert("錯誤：錯題數據尚未載入或為空。");
        return;
    }
    
    // 顯示 Loading
    wrongQList.innerHTML = '';
    loadingMsg.textContent = `正在載入「${selectedCategory}」的錯題...`;
    loadingMsg.style.display = 'block';
    emptyMsg.style.display = 'none';
    
    // 隱藏類別選擇，顯示題目容器
    categorySelectionDiv.style.display = 'none';
    questionsDisplayContainer.style.display = 'block';

    try {
        // 1. 過濾出屬於該類別的錯題
        const filteredMetadataArray = Object.values(allWrongQuestionsMetadata)
            .filter(qMeta => qMeta.category === selectedCategory)
            .sort((a, b) => b.count - a.count); // 按錯誤次數排序

        if (filteredMetadataArray.length === 0) {
            loadingMsg.style.display = 'none';
            emptyMsg.innerHTML = `<p>恭喜！「${selectedCategory}」類別沒有錯題！</p>`;
            emptyMsg.style.display = 'block';
            return;
        }

        // 2. 準備所有完整題目數據的獲取請求
        const fetchPromises = filteredMetadataArray.map(qMeta => {
            // 題目路徑： /類別名稱/題目ID (e.g. /人力資源規劃/Q001)
            const fullQuestionRef = doc(db, qMeta.category, qMeta.id);
            return getDoc(fullQuestionRef);
        });

        const questionSnaps = await Promise.all(fetchPromises);
        loadingMsg.style.display = 'none';

        wrongQList.innerHTML = ''; // 清空列表
        
        // 3. 渲染：依據類別標題顯示
        const categoryHeader = document.createElement('h3');
        categoryHeader.className = 'wq-category-header';
        categoryHeader.textContent = `📚 ${selectedCategory} (${filteredMetadataArray.length} 題)`;
        wrongQList.appendChild(categoryHeader);
        
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'wq-category-container';
        
        filteredMetadataArray.forEach((qMeta, itemIndex) => {
            const qSnap = questionSnaps[itemIndex];

            const itemDiv = document.createElement('div');
            itemDiv.className = 'wq-item'; 
            
            let contentHTML = '';

            if (qSnap.exists()) {
                // 題目編號 (1., 2., 3. ...) + 題目內容
                contentHTML = `
                    <span class="wq-index">${itemIndex + 1}.</span>
                    ${createQuestionDetailHTML(qSnap.data(), qMeta)}
                `;
            } else {
                // 找不到原題目
                itemDiv.className += ' wq-item-deleted';
                contentHTML = `
                    <div class="wq-header">
                        <span class="wq-index">${itemIndex + 1}.</span>
                        <span class="wq-count">錯${qMeta.count}次</span>
                    </div>
                    <div class="wq-question">錯誤：找不到原題目 (${qMeta.id})，可能已被刪除。</div>
                `;
            }
            
            itemDiv.innerHTML = contentHTML;
            categoryContainer.appendChild(itemDiv);
        });
        
        wrongQList.appendChild(categoryContainer);

    } catch (error) {
        console.error("根據類別載入錯題集時發生錯誤:", error);
        loadingMsg.style.display = 'none';
        wrongQList.innerHTML = `<p style="color:red;">載入「${selectedCategory}」錯誤，請檢查連線或 Firebase 數據結構。</p>`;
    }
}
