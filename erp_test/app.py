# app.py (包含 MIME Type 修正)

from flask import Flask, render_template
import mimetypes  # ⬅️ 新增導入 mimetypes

# -------------------------------------------------------------
# 🚨 修正：在啟動前強制設置 .js 檔案的 MIME 類型為 text/javascript
# -------------------------------------------------------------
mimetypes.add_type('text/javascript', '.js')


# 建立 Flask 應用程式實例
app = Flask(__name__)

# --- 路由 (Routes) 定義 (與您原來的版本相同) ---

# 1. 登入/首頁
@app.route('/')
def index():
    return render_template('index.html')

# 2. 遊戲主選單
@app.route('/game.html')
def game():
    return render_template('game.html')

# 3. 闖關選單
@app.route('/quiz.html')
def quiz():
    return render_template('quiz.html')

# 4. 關卡題庫選擇
@app.route('/level.html')
def level():
    return render_template('level.html')

# 5. 關卡測驗進行中
@app.route('/level_play.html')
def level_play():
    return render_template('level_play.html')

# 6. 關卡結果
@app.route('/level_result.html')
def level_result():
    return render_template('level_result.html')

# 7. 完整題庫
@app.route('/all_question.html')
def all_question():
    return render_template('all_question.html')

# 8. 正式測驗選擇題庫S
@app.route('/full_test.html')
def full_test():
    return render_template('full_test.html')

# 9. 正式測驗進行中
@app.route('/full_test_play.html')
def full_test_play():
    return render_template('full_test_play.html')

# 10. 正式測驗結果
@app.route('/full_test_result.html')
def full_test_result():
    return render_template('full_test_result.html')

# 11. 錯題集整理
@app.route('/wrong_questions.html')
def wrong_questions():
    return render_template('wrong_questions.html')


# 運行應用程式
if __name__ == '__main__':
    app.run(debug=True)