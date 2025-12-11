// 先引入 Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyBGmdTWLvh00bp4yg7pGNRBDfV5u71Dg-w",
    authDomain: "erptest-6a27e.firebaseapp.com",
    projectId: "erptest-6a27e",
    storageBucket: "erptest-6a27e.firebasestorage.app",
    messagingSenderId: "452335653196",
    appId: "1:452335653196:web:b720ba373ac317493e7fe9",
    measurementId: "G-9MTLH6QCCN"
};

// 🔹 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ⚡ 下面放你的按鈕監聽與 loadQuestions 函式
const buttons = document.querySelectorAll(".category-btn");
const questionList = document.getElementById("question-list");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        loadQuestions(category);
    });
});

async function loadQuestions(categoryName) {
    questionList.innerHTML = `<p>讀取中…</p>`;

    try {
        const categoryRef = collection(db, categoryName);
        const snapshot = await getDocs(categoryRef);

        if (snapshot.empty) {
            questionList.innerHTML = `<p>目前沒有題目。</p>`;
            return;
        }

        let html = "";
        let num = 1;

        snapshot.forEach(doc => {
            const data = doc.data();
            html += `
                <div class="question-item">
                    <div class="question-number">第 ${num} 題</div>
                    <div class="question-text">${data.question}</div>

                    <ul style="margin-top:10px;">
                        ${data.options.map((opt, i) => `
                            <li>${i + 1}. ${opt}</li>
                        `).join("")}
                    </ul>

                    <div style="margin-top:8px; color:#2c3e50;">
                        <strong>正確答案：</strong> ${data.answer + 1}
                    </div>
                </div>
            `;
            num++;
        });

        questionList.innerHTML = html;

    } catch (err) {
        console.error(err);
        questionList.innerHTML = `<p style="color:red;">讀取失敗，請稍後再試。</p>`;
    }
}


