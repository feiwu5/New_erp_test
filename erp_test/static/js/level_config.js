const INGREDIENT_MAPPING = {
    
    1: { name: "四季豆", img: "foursidedbean.png" },
    2: { name: "甘梅地瓜", img: "sweetpotato.png" },
    3: { name: "酥炸豆干", img: "tocan.png" },
    4: { name: "鑫鑫腸", img: "xinxinchang.png" },
    5: { name: "雞蛋豆腐", img: "egg_tofu.png" },
    
    6: { name: "雞心", img: "chicken_heart.png" },
    7: { name: "玉米筍", img: "corn.png" },
    8: { name: "魷魚腳", img: "squid_legs.png" },
    9: { name: "米血糕", img: "rice_cake.png" },
    10: { name: "魷魚", img: "squid.png" },

    11: { name: "蘿蔔糕", img: "carot_cake.png" },
    12: { name: "魷魚圈", img: "squid_circle.png" },
    13: { name: "薯條", img: "french_fries.png" },
    14: { name: "雞米花", img: "chicken_corn.png" },
    15: { name: "雞翅", img: "chicken_wing.png" },

    16: { name: "甜不辣", img: "sweet_or_not_spicy.png" },
    17: { name: "魚板", img: "fish_plate.png" },
    18: { name: "雞皮", img: "chicken_skin.png" },
    19: { name: "香菇", img: "mushroom.png" },
    20: { name: "青椒", img: "green_pepper.png" },

    21: { name: "柳葉魚", img: "leaffish.png" },
    22: { name: "雞排", img: "chicken_steak.png" },
    23: { name: "金針菇", img: "enoki.png" },
    24: { name: "小黃瓜", img: "cucumber.png" },
    25: { name: "杏鮑菇", img: "king_oyster_mushroom.png" },

    26: { name: "臭豆腐", img: "stinky_tofu.png" },
    27: { name: "米腸", img: "rice_sausage.png" },
    28: { name: "百頁豆腐", img: "Baiye_Tofu.png" },
    29: { name: "地瓜球", img: "sweet_potato_balls.png" },
    30: { name: "鹹酥雞", img: "Salty_Crispy_Chicken.png" },
};
// -----------------------------------------------------------------


// 輔助函式：根據關卡號碼確定題數和容錯次數 (維持不變)
function getTierRules(level) {
    if (level <= 5) return { questions: 5, maxMistakes: 1 };
    if (level <= 10) return { questions: 10, maxMistakes: 3 };
    if (level <= 15) return { questions: 15, maxMistakes: 5 };
    if (level <= 20) return { questions: 20, maxMistakes: 7 };
    if (level <= 25) return { questions: 25, maxMistakes: 9 };
    return { questions: 30, maxMistakes: 11 };
}

// -----------------------------------------------------------------
// 核心配置：組合規則與獎勵數據
// -----------------------------------------------------------------
export const LEVEL_CONFIGS = [];

for (let i = 1; i <= 30; i++) {
    const rules = getTierRules(i);
    const ingredient = INGREDIENT_MAPPING[i] || { rewardName: "未知獎勵", rewardImg: "default.png" }; // 確保有預設值
    
    LEVEL_CONFIGS.push({
        level: i,
        questions: rules.questions, 
        maxMistakes: rules.maxMistakes,
        
        // 🚨 這裡使用映射表中的獨特值
        rewardName: ingredient.name,
        rewardImg: ingredient.img 
    });
}


// 輔助函式：根據關卡號碼獲取配置
export function getConfigByLevel(level) {
    const index = Number(level) - 1; 
    
    if (index >= 0 && index < LEVEL_CONFIGS.length) {
        return LEVEL_CONFIGS[index];
    }
    
    console.error(`找不到關卡 ${level} 的配置。`);
    return null;
}