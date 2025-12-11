// 注意：這個檔案不需要 Firebase 初始化，因為題目清單已經由 level.js 存入 localStorage。

// -------------------------
// DOM 元素
// -------------------------
let quizTitle, questionText, optionsList, nextBtn, prevBtn;

document.addEventListener("DOMContentLoaded", () => {
    // 假設 HTML 裡有這些 ID 的元素
    quizTitle = document.getElementById("full-test-title");
    questionText = document.getElementById("question-text");
    optionsList = document.getElementById("options-list");
    nextBtn = document.getElementById("next-btn");
    prevBtn = document.getElementById("prev-btn");

    // 🎯 修正：讀取闖關模式的數據
    const level = localStorage.getItem("current_level") || "N/A";
    const category = localStorage.getItem("current_category") || "N/A";
    const rawQuestions = localStorage.getItem("current_questions");

    if (!rawQuestions) {
        if (questionText) {
             questionText.textContent = "錯誤：找不到題目數據，請重新闖關！";
             if (nextBtn) nextBtn.style.display = 'none';
        }
        return;
    }

    questions = JSON.parse(rawQuestions);
    
    if (quizTitle) {
        // 顯示當前關卡和類別
        quizTitle.textContent = `第 ${level} 關 - ${category}`;
    }

    // 初始化測驗畫面
    if (questions.length > 0) {
        showQuestion(current);
        setupNextButton();
        setupPrevButton(); 
    } else if (questionText) {
        questionText.textContent = `載入題庫失敗或 [${category}] 尚無題目。`;
        if (nextBtn) nextBtn.style.display = 'none';
    }
});

// -------------------------
// 變數
// -------------------------
let questions = [];
let current = 0;
let userAnswers = [];


// -------------------------
// 顯示題目 (選項改為 A, B, C, D)
// -------------------------
function showQuestion(index) {
    const q = questions[index];
    
    if (!questionText || !optionsList) return;

    // 顯示題號 (總題數)
    questionText.textContent = `${index + 1} / ${questions.length}. ${q.question}`; 

    optionsList.innerHTML = "";
    
    q.options.forEach((opt, i) => {
        const li = document.createElement("li");
        
        const optionLabel = String.fromCharCode(65 + i); 
        
        li.textContent = `${optionLabel}. ${opt}`; 
        li.dataset.optionIndex = i; 

        if (userAnswers[index] !== undefined && userAnswers[index] === i) {
             li.style.backgroundColor = "#4a90e2";
             li.style.color = "white";
        }
        
        li.addEventListener("click", (e) => {
            const selectedIndex = parseInt(e.currentTarget.dataset.optionIndex);
            userAnswers[current] = selectedIndex; 

            // 標示選取
            optionsList.querySelectorAll("li").forEach(item => {
                item.style.backgroundColor = "";
                item.style.color = "";
            });
            e.currentTarget.style.backgroundColor = "#4a90e2";
            e.currentTarget.style.color = "white";
        });
        optionsList.appendChild(li);
    });

    updateButtonVisibility();
}

// -------------------------
// 下一題按鈕
// -------------------------
function setupNextButton() {
    if (!nextBtn) return; 

    nextBtn.addEventListener("click", () => {
        if (userAnswers[current] === undefined) {
            alert("請先選擇答案！"); 
            return;
        }

        current++;
        if (current >= questions.length) {
            // 🎯 修正：完成測驗，跳轉到新的結果頁面
            localStorage.setItem("user_answers", JSON.stringify(userAnswers));
            alert(`第 ${questions.length} 題作答完成！即將判定結果。`);
            // 跳轉到新的結果判定頁面
            const resultUrl = document.body.dataset.resultUrl;
            window.location.href = resultUrl;
 
        } else {
            showQuestion(current);
        }
    });
}

// -------------------------
// 上一題
// -------------------------
function setupPrevButton() {
    prevBtn.addEventListener("click", () => {
        if (current === 0) return;

        current--;
        showQuestion(current);
    });
}

// -------------------------
// 顯示/隱藏按鈕
// -------------------------
function updateButtonVisibility() {
    // 第一題 → 不顯示上一題
    prevBtn.style.display = current === 0 ? "none" : "inline-block";

    // 最後一題 → 還是顯示下一題（由程式判定結束）
    nextBtn.style.display = "inline-block";
}