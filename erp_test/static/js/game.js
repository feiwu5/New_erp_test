document.addEventListener("DOMContentLoaded", () => {
    // 確保 DOM 載入完成後才執行程式碼

    // --- 1. 處理歡迎訊息的邏輯 ---
    const username = localStorage.getItem("username");
    const isNewPlayer = localStorage.getItem("isNewPlayer") === "true";
    const welcomeDiv = document.getElementById("welcome-msg");

    if (username && welcomeDiv) {
        welcomeDiv.textContent = isNewPlayer
            ? `歡迎新玩家~${username}！`
            : `歡迎回來~${username}！`;
    }

    // --- 2. 處理按鈕點擊並跳轉頁面的邏輯 ---
    // 🚨 修正：原有的 bindButton 及其呼叫邏輯已被移除，
    //         因為跳轉功能已經在 game.html 的 onclick 屬性中完成。
});