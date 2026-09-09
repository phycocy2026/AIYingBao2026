import base64
import json
import mimetypes
import os
import re
import threading
import urllib.error
import urllib.request
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None

VISION_API_KEY_ENV = "DASHSCOPE_API_KEY"
VISION_API_URL_ENV = "AIYINGBAO_VISION_API_URL"
VISION_MODEL_ENV = "AIYINGBAO_VISION_MODEL"
DEFAULT_VISION_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
DEFAULT_VISION_MODEL = "qwen-vl-plus"
VISION_TIMEOUT_SECONDS = 45


FOODS = {
    "轻食碗": {
        "name": "鸡胸藜麦碗",
        "macro": "520 kcal | 蛋白 42g | 脂肪 15g",
        "carbs": 34,
        "protein": 42,
        "fat": 15,
        "colors": ("#69a874", "#f0c75e", "#d87b63"),
    },
    "面食": {
        "name": "番茄牛肉面",
        "macro": "690 kcal | 蛋白 31g | 碳水 92g",
        "carbs": 92,
        "protein": 31,
        "fat": 21,
        "colors": ("#f1d588", "#56a067", "#cf5546"),
    },
    "沙拉": {
        "name": "牛油果彩蔬沙拉",
        "macro": "410 kcal | 蛋白 18g | 脂肪 24g",
        "carbs": 28,
        "protein": 18,
        "fat": 24,
        "colors": ("#5ba96a", "#98c96e", "#efc65a"),
    },
    "米饭套餐": {
        "name": "糙米鸡腿饭",
        "macro": "630 kcal | 蛋白 36g | 碳水 76g",
        "carbs": 76,
        "protein": 36,
        "fat": 18,
        "colors": ("#e6d6a8", "#8bb36b", "#c97855"),
    },
    "牛肉盖饭": {
        "name": "温泉蛋牛肉盖饭",
        "macro": "760 kcal | 蛋白 42g | 碳水 72g",
        "carbs": 72,
        "protein": 42,
        "fat": 32,
        "colors": ("#8f463c", "#f0a21a", "#efe1b5"),
    },
    "牛肉面": {
        "name": "清汤牛肉面",
        "macro": "720 kcal | 蛋白 36g | 碳水 88g",
        "carbs": 88,
        "protein": 36,
        "fat": 24,
        "colors": ("#f2d889", "#9b6b52", "#65a866"),
    },
    "粥品": {
        "name": "南瓜燕麦粥",
        "macro": "360 kcal | 蛋白 14g | 碳水 58g",
        "carbs": 58,
        "protein": 14,
        "fat": 8,
        "colors": ("#edc768", "#f3df9b", "#81aa78"),
    },
    "包点": {
        "name": "全麦鸡蛋包",
        "macro": "450 kcal | 蛋白 22g | 碳水 62g",
        "carbs": 62,
        "protein": 22,
        "fat": 12,
        "colors": ("#d9bd8a", "#f1e6c4", "#df914f"),
    },
    "鱼虾": {
        "name": "清蒸鱼虾蔬菜盘",
        "macro": "480 kcal | 蛋白 45g | 脂肪 12g",
        "carbs": 30,
        "protein": 45,
        "fat": 12,
        "colors": ("#8fc7c0", "#f2f0df", "#6daf7a"),
    },
    "火锅": {
        "name": "番茄菌菇小火锅",
        "macro": "780 kcal | 蛋白 38g | 脂肪 35g",
        "carbs": 68,
        "protein": 38,
        "fat": 35,
        "colors": ("#d95d4f", "#e7bb63", "#77a86d"),
    },
    "汉堡": {
        "name": "牛肉芝士汉堡",
        "macro": "850 kcal | 蛋白 34g | 脂肪 46g",
        "carbs": 72,
        "protein": 34,
        "fat": 46,
        "colors": ("#c78b45", "#8f513b", "#e1bf4f"),
    },
    "水果": {
        "name": "酸奶莓果杯",
        "macro": "290 kcal | 蛋白 12g | 碳水 42g",
        "carbs": 42,
        "protein": 12,
        "fat": 7,
        "colors": ("#c85d87", "#f3efe7", "#d7a642"),
    },
    "百合绿豆水": {
        "name": "百合绿豆水",
        "macro": "165 kcal | 糖 28g | 蛋白 2g",
        "carbs": 34,
        "protein": 2,
        "fat": 0,
        "colors": ("#d7bd77", "#b57a3c", "#f1e8c9"),
    },
    "杯装咖啡": {
        "name": "Costa 杯装咖啡",
        "macro": "180 kcal | 糖 18g | 脂肪 6g",
        "carbs": 24,
        "protein": 6,
        "fat": 6,
        "colors": ("#7b1230", "#f3ead6", "#c4a06c"),
    },
}

FOOD_KEYWORDS = {
    "牛肉面": ("beefnoodle", "beef-noodle", "niuroumian", "牛肉面", "兰州拉面", "拉面"),
    "牛肉盖饭": ("beefrice", "beef-rice", "niuroufan", "牛肉饭", "牛肉盖饭", "盖浇饭"),
    "面食": ("noodle", "mian", "面", "粉", "pasta", "spaghetti", "ramen"),
    "沙拉": ("salad", "shala", "蔬", "菜", "avocado", "沙拉"),
    "米饭套餐": ("rice", "fan", "饭", "米", "盖饭", "便当", "鸡腿饭"),
    "粥品": ("porridge", "zhou", "粥", "oat", "燕麦", "南瓜"),
    "包点": ("bao", "bun", "包", "馒头", "饺", "dumpling"),
    "鱼虾": ("fish", "yu", "shrimp", "seafood", "鱼", "虾", "海鲜"),
    "火锅": ("hotpot", "huoguo", "火锅", "麻辣烫", "汤锅"),
    "汉堡": ("burger", "hamburger", "pizza", "fries", "汉堡", "披萨", "薯条"),
    "水果": ("fruit", "apple", "banana", "berry", "yogurt", "水果", "苹果", "香蕉", "莓", "酸奶"),
    "百合绿豆水": ("绿豆水", "百合绿豆", "lily", "mung", "mungbean", "plantdrink"),
    "杯装咖啡": ("coffee", "costa", "latte", "americano", "咖啡", "拿铁", "美式"),
    "轻食碗": ("bowl", "chicken", "quinoa", "轻食", "鸡胸", "藜麦"),
}

MODEL_LABEL_ALIASES = {
    "牛肉面": ("beef noodle", "beef noodles", "ramen", "noodle", "noodles", "soup noodle", "拉面", "牛肉面"),
    "牛肉盖饭": ("beef rice", "gyudon", "donburi", "rice bowl", "beef bowl", "steak rice", "roast beef", "steak", "牛肉饭", "牛肉盖饭", "牛排", "烤牛肉", "温泉蛋"),
    "米饭套餐": ("rice", "fried rice", "rice dish", "bento", "lunch box", "盖饭", "便当"),
    "沙拉": ("salad", "caesar salad", "vegetable salad", "avocado salad", "沙拉"),
    "鱼虾": ("fish", "shrimp", "seafood", "steamed fish", "prawn", "鱼", "虾", "海鲜"),
    "火锅": ("hot pot", "hotpot", "malatang", "soup pot", "火锅", "麻辣烫"),
    "汉堡": ("hamburger", "burger", "cheeseburger", "pizza", "french fries", "汉堡", "披萨"),
    "水果": ("fruit", "apple", "banana", "berry", "yogurt", "水果", "酸奶"),
    "百合绿豆水": ("mung bean drink", "mung bean soup", "plant drink", "bottle drink", "lily mung bean", "绿豆水", "百合绿豆水", "植物饮料", "瓶装饮料"),
    "杯装咖啡": ("coffee", "latte", "americano", "cappuccino", "paper cup", "takeaway coffee", "costa", "咖啡", "拿铁", "纸杯咖啡", "杯装咖啡"),
    "粥品": ("porridge", "congee", "oatmeal", "粥", "燕麦"),
    "包点": ("bun", "baozi", "dumpling", "steamed bun", "包子", "饺子"),
    "轻食碗": ("quinoa bowl", "chicken bowl", "healthy bowl", "grain bowl", "轻食"),
}

GOALS = {
    "均衡维持": "balance",
    "控糖减脂": "fatLoss",
    "增肌恢复": "muscle",
    "心血管友好": "heart",
}


class NutritionApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("AI智营宝 - 智能健康与营养管理助手")
        self.geometry("1180x760")
        self.minsize(1040, 680)
        self.configure(bg="#f5f7f4")

        self.goal_var = tk.StringVar(value="均衡维持")
        self.age_var = tk.IntVar(value=29)
        self.sleep_var = tk.DoubleVar(value=7.0)
        self.steps_var = tk.IntVar(value=8200)
        self.glucose_var = tk.StringVar(value="稳定")
        self.food_var = tk.StringVar(value="轻食碗")
        self.lactose_var = tk.BooleanVar(value=False)
        self.low_salt_var = tk.BooleanVar(value=False)
        self.vegetarian_var = tk.BooleanVar(value=False)
        self.coach_input_var = tk.StringVar()
        self.current_section_var = tk.StringVar(value="当前模块：今日总览")
        self.last_update_var = tk.StringVar(value="建议等待刷新")
        self.food_recognition_var = tk.StringVar(value="未上传图片，可点击“上传图片识别”。")
        self.uploaded_image_name = ""
        self.nav_buttons = {}
        self.cards = {}
        self.recognition_index = 0
        self.refresh_count = 0

        self.palette = {
            "bg": "#f5f7f4",
            "surface": "#ffffff",
            "ink": "#1e2b24",
            "muted": "#65756b",
            "line": "#dce4dd",
            "green": "#2f8a57",
            "dark": "#10251c",
            "mint": "#dff2e7",
            "gold": "#d8a637",
            "tomato": "#d9634f",
        }

        self._setup_styles()
        self._build_layout()
        self.refresh_plan(show_toast=False)

    def _setup_styles(self):
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure("TFrame", background=self.palette["bg"])
        style.configure("Card.TFrame", background=self.palette["surface"], relief="flat")
        style.configure("Active.Card.TFrame", background="#eef8f1", relief="flat")
        style.configure("Sidebar.TFrame", background=self.palette["dark"])
        style.configure("TLabel", background=self.palette["bg"], foreground=self.palette["ink"])
        style.configure("Card.TLabel", background=self.palette["surface"], foreground=self.palette["ink"])
        style.configure("Muted.Card.TLabel", background=self.palette["surface"], foreground=self.palette["muted"])
        style.configure("Title.Card.TLabel", background=self.palette["surface"], foreground=self.palette["ink"], font=("Microsoft YaHei UI", 20, "bold"))
        style.configure("Section.Card.TLabel", background=self.palette["surface"], foreground=self.palette["ink"], font=("Microsoft YaHei UI", 13, "bold"))
        style.configure("Stat.Card.TLabel", background=self.palette["surface"], foreground=self.palette["green"], font=("Microsoft YaHei UI", 24, "bold"))
        style.configure("TButton", font=("Microsoft YaHei UI", 10), padding=(12, 7))
        style.configure("Primary.TButton", background=self.palette["green"], foreground="#ffffff")
        style.map("Primary.TButton", background=[("active", "#28784b")])
        style.configure("TCheckbutton", background=self.palette["surface"], foreground=self.palette["ink"])
        style.configure("TRadiobutton", background=self.palette["surface"], foreground=self.palette["ink"])
        style.configure("TCombobox", padding=6)

    def _build_layout(self):
        self.columnconfigure(1, weight=1)
        self.rowconfigure(0, weight=1)

        sidebar = ttk.Frame(self, style="Sidebar.TFrame", width=250)
        sidebar.grid(row=0, column=0, sticky="nsew")
        sidebar.grid_propagate(False)
        self._build_sidebar(sidebar)

        main = ttk.Frame(self, padding=22)
        main.grid(row=0, column=1, sticky="nsew")
        main.columnconfigure(0, weight=1)
        main.rowconfigure(1, weight=1)

        self._build_hero(main)
        content = ttk.Frame(main)
        content.grid(row=1, column=0, sticky="nsew", pady=(18, 0))
        content.columnconfigure(0, weight=1)
        content.columnconfigure(1, weight=1)
        content.rowconfigure(0, weight=1)

        left = ttk.Frame(content)
        left.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        left.columnconfigure(0, weight=1)

        right = ttk.Frame(content)
        right.grid(row=0, column=1, sticky="nsew", padx=(10, 0))
        right.columnconfigure(0, weight=1)

        self._build_profile_card(left)
        self._build_food_card(left)
        self._build_recommendation_card(right)
        self._build_coach_card(right)
        self._build_community_card(right)
        self.select_section("今日总览", announce=False)

    def _build_sidebar(self, parent):
        tk.Label(parent, text="AI", width=4, height=2, bg="#dff2e7", fg="#123324", font=("Microsoft YaHei UI", 16, "bold")).pack(anchor="w", padx=24, pady=(28, 10))
        tk.Label(parent, text="AI智营宝", bg=self.palette["dark"], fg="#ffffff", font=("Microsoft YaHei UI", 18, "bold")).pack(anchor="w", padx=24)
        tk.Label(parent, text="智能健康与营养管理助手", bg=self.palette["dark"], fg="#b8c9bf", font=("Microsoft YaHei UI", 10)).pack(anchor="w", padx=24, pady=(4, 28))

        for text in ("今日总览", "营养分析", "健康教练", "社区支持"):
            button = tk.Button(
                parent,
                text=text,
                bg="#173629" if text == "今日总览" else self.palette["dark"],
                fg="#ffffff",
                activebackground="#214b39",
                activeforeground="#ffffff",
                anchor="w",
                padx=18,
                pady=10,
                relief="flat",
                cursor="hand2",
                font=("Microsoft YaHei UI", 11),
                command=lambda section=text: self.select_section(section),
            )
            button.pack(fill="x", padx=16, pady=3)
            self.nav_buttons[text] = button

        tk.Frame(parent, bg=self.palette["dark"]).pack(expand=True, fill="both")
        status = tk.Frame(parent, bg="#173629", padx=16, pady=14)
        status.pack(fill="x", padx=16, pady=22)
        tk.Label(status, text="● 手环已同步", bg="#173629", fg="#78e0a1", font=("Microsoft YaHei UI", 10, "bold")).pack(anchor="w")
        tk.Label(status, text="心率、步数、睡眠、血糖趋势", bg="#173629", fg="#b8c9bf", font=("Microsoft YaHei UI", 9)).pack(anchor="w", pady=(4, 0))

    def _card(self, parent, row, title, tag=None):
        card = ttk.Frame(parent, style="Card.TFrame", padding=18)
        card.grid(row=row, column=0, sticky="ew", pady=(0, 16))
        card.columnconfigure(0, weight=1)
        self.cards[title] = card
        header = ttk.Frame(card, style="Card.TFrame")
        header.grid(row=0, column=0, sticky="ew")
        header.columnconfigure(0, weight=1)
        ttk.Label(header, text=title, style="Section.Card.TLabel").grid(row=0, column=0, sticky="w")
        if tag:
            ttk.Label(header, text=tag, style="Muted.Card.TLabel").grid(row=0, column=1, sticky="e")
        return card

    def _build_hero(self, parent):
        hero = ttk.Frame(parent, style="Card.TFrame", padding=22)
        hero.grid(row=0, column=0, sticky="ew")
        hero.columnconfigure(0, weight=1)
        hero.columnconfigure(1, weight=0)

        ttk.Label(hero, text="今日动态饮食方案", style="Title.Card.TLabel").grid(row=0, column=0, sticky="w")
        ttk.Label(hero, text="根据身体数据、餐食记录和健康目标，实时生成营养建议。", style="Muted.Card.TLabel").grid(row=1, column=0, sticky="w", pady=(6, 14))
        ttk.Button(hero, text="重新生成建议", style="Primary.TButton", command=self.regenerate_advice).grid(row=0, column=1, rowspan=2, sticky="ne")
        ttk.Label(hero, textvariable=self.current_section_var, style="Muted.Card.TLabel").grid(row=2, column=0, sticky="w", pady=(0, 12))
        ttk.Label(hero, textvariable=self.last_update_var, style="Muted.Card.TLabel").grid(row=2, column=1, sticky="e", pady=(0, 12))

        stat_frame = ttk.Frame(hero, style="Card.TFrame")
        stat_frame.grid(row=3, column=0, columnspan=2, sticky="ew")
        for i in range(3):
            stat_frame.columnconfigure(i, weight=1)

        self.score_value = ttk.Label(stat_frame, style="Stat.Card.TLabel")
        self.calorie_value = ttk.Label(stat_frame, style="Stat.Card.TLabel")
        self.protein_value = ttk.Label(stat_frame, style="Stat.Card.TLabel")
        for col, (label, widget) in enumerate((("健康评分", self.score_value), ("建议热量", self.calorie_value), ("蛋白目标", self.protein_value))):
            box = ttk.Frame(stat_frame, style="Card.TFrame", padding=12)
            box.grid(row=0, column=col, sticky="ew", padx=(0 if col == 0 else 8, 0 if col == 2 else 8))
            widget.grid(row=0, column=0, sticky="w")
            ttk.Label(box, text=label, style="Muted.Card.TLabel").grid(row=1, column=0, sticky="w")

    def _build_profile_card(self, parent):
        card = self._card(parent, 0, "身体与目标", "动态监测")
        form = ttk.Frame(card, style="Card.TFrame")
        form.grid(row=1, column=0, sticky="ew", pady=(16, 0))
        for i in range(2):
            form.columnconfigure(i, weight=1)

        self._field(form, 0, 0, "目标", ttk.Combobox(form, textvariable=self.goal_var, values=list(GOALS.keys()), state="readonly"))
        self._field(form, 0, 1, "年龄", ttk.Spinbox(form, from_=12, to=90, textvariable=self.age_var, command=self.refresh_plan))
        self._field(form, 1, 0, "今日步数", ttk.Spinbox(form, from_=0, to=50000, increment=500, textvariable=self.steps_var, command=self.refresh_plan))
        self._field(form, 1, 1, "血糖趋势", ttk.Combobox(form, textvariable=self.glucose_var, values=["稳定", "偏高", "偏低"], state="readonly"))

        sleep_box = ttk.Frame(form, style="Card.TFrame")
        sleep_box.grid(row=2, column=0, columnspan=2, sticky="ew", pady=(12, 0))
        ttk.Label(sleep_box, text="睡眠时长", style="Muted.Card.TLabel").grid(row=0, column=0, sticky="w")
        self.sleep_label = ttk.Label(sleep_box, style="Card.TLabel")
        self.sleep_label.grid(row=0, column=1, sticky="e")
        sleep_box.columnconfigure(0, weight=1)
        ttk.Scale(sleep_box, from_=3, to=10, variable=self.sleep_var, command=lambda _: self.refresh_plan()).grid(row=1, column=0, columnspan=2, sticky="ew", pady=(6, 0))

        checks = ttk.Frame(card, style="Card.TFrame")
        checks.grid(row=2, column=0, sticky="w", pady=(14, 0))
        for text, var in (("乳糖不耐", self.lactose_var), ("低盐", self.low_salt_var), ("素食优先", self.vegetarian_var)):
            ttk.Checkbutton(checks, text=text, variable=var, command=self.refresh_plan).pack(side="left", padx=(0, 18))

        for var in (self.goal_var, self.glucose_var):
            var.trace_add("write", lambda *_: self.refresh_plan())

    def _field(self, parent, row, col, label, widget):
        box = ttk.Frame(parent, style="Card.TFrame")
        box.grid(row=row, column=col, sticky="ew", padx=(0 if col == 0 else 8, 8 if col == 0 else 0), pady=(0, 12))
        box.columnconfigure(0, weight=1)
        ttk.Label(box, text=label, style="Muted.Card.TLabel").grid(row=0, column=0, sticky="w", pady=(0, 5))
        widget.grid(row=1, column=0, sticky="ew")
        widget.bind("<KeyRelease>", lambda _event: self.refresh_plan())
        widget.bind("<<ComboboxSelected>>", lambda _event: self.refresh_plan())

    def _build_food_card(self, parent):
        card = self._card(parent, 1, "图片上传识别", "AR营养卡")
        self.food_canvas = tk.Canvas(card, width=430, height=210, bg="#eef4ed", highlightthickness=0)
        self.food_canvas.grid(row=1, column=0, sticky="ew", pady=(16, 10))
        self.food_canvas.bind("<Configure>", lambda _event: self.refresh_plan(show_toast=False))

        action_row = ttk.Frame(card, style="Card.TFrame")
        action_row.grid(row=2, column=0, sticky="ew", pady=(0, 10))
        action_row.columnconfigure(1, weight=1)
        button_group = ttk.Frame(action_row, style="Card.TFrame")
        button_group.grid(row=0, column=0, sticky="w", padx=(0, 16))
        ttk.Button(button_group, text="上传图片识别", style="Primary.TButton", command=self.select_image_for_recognition).pack(side="left", padx=(0, 10))
        ttk.Button(button_group, text="模拟识别一次", command=self.simulate_food_recognition).pack(side="left")
        ttk.Label(action_row, textvariable=self.food_recognition_var, style="Muted.Card.TLabel", wraplength=320).grid(row=0, column=1, sticky="w")

        buttons = ttk.Frame(card, style="Card.TFrame")
        buttons.grid(row=3, column=0, sticky="ew")
        for label in FOODS:
            ttk.Radiobutton(buttons, text=label, value=label, variable=self.food_var, command=self.manual_choose_food).pack(side="left", padx=(0, 16))

    def _build_recommendation_card(self, parent):
        card = self._card(parent, 0, "个性化推荐", "刚刚更新")
        self.recommendation_text = tk.Text(card, height=10, wrap="word", bd=0, padx=10, pady=10, bg="#f7fbf8", fg=self.palette["ink"], font=("Microsoft YaHei UI", 10), relief="flat")
        self.recommendation_text.grid(row=1, column=0, sticky="ew", pady=(16, 0))
        self.recommendation_text.configure(state="disabled")

    def _build_coach_card(self, parent):
        card = self._card(parent, 1, "虚拟健康教练", "可解释建议")
        self.coach_text = tk.Text(card, height=6, wrap="word", bd=0, padx=10, pady=10, bg="#f7fbf8", fg=self.palette["ink"], font=("Microsoft YaHei UI", 10), relief="flat")
        self.coach_text.grid(row=1, column=0, sticky="ew", pady=(16, 10))
        self.coach_text.configure(state="disabled")

        row = ttk.Frame(card, style="Card.TFrame")
        row.grid(row=2, column=0, sticky="ew")
        row.columnconfigure(0, weight=1)
        entry = ttk.Entry(row, textvariable=self.coach_input_var)
        entry.grid(row=0, column=0, sticky="ew", padx=(0, 10))
        entry.bind("<Return>", lambda _event: self.ask_coach())
        ttk.Button(row, text="发送", style="Primary.TButton", command=self.ask_coach).grid(row=0, column=1)

    def _build_community_card(self, parent):
        card = self._card(parent, 2, "社区支持", "连续打卡 12 天")
        text = "控糖早餐挑战：早餐添加优质蛋白，减少含糖饮品。\n晚餐轻负担小组：运动后补充碳水与蛋白，避免过量油脂。"
        ttk.Label(card, text=text, style="Muted.Card.TLabel", justify="left").grid(row=1, column=0, sticky="w", pady=(16, 0))

    def select_section(self, section, announce=True):
        targets = {
            "今日总览": ["身体与目标", "图片上传识别", "个性化推荐"],
            "营养分析": ["身体与目标", "图片上传识别", "个性化推荐"],
            "健康教练": ["虚拟健康教练"],
            "社区支持": ["社区支持"],
        }
        descriptions = {
            "今日总览": "当前模块：今日总览",
            "营养分析": "当前模块：营养分析，已定位到身体数据、餐食识别和推荐结果",
            "健康教练": "当前模块：健康教练，可输入问题获取饮食建议",
            "社区支持": "当前模块：社区支持，查看打卡和小组挑战",
        }

        self.current_section_var.set(descriptions.get(section, f"当前模块：{section}"))

        for name, button in self.nav_buttons.items():
            button.configure(bg="#173629" if name == section else self.palette["dark"])

        active_cards = set(targets.get(section, []))
        for title, card in self.cards.items():
            card.configure(style="Active.Card.TFrame" if title in active_cards else "Card.TFrame")

        if active_cards:
            first_title = next(iter(active_cards))
            self.cards[first_title].focus_set()

        if announce:
            self.title(f"AI智营宝 - {section}")

    def manual_choose_food(self):
        food = FOODS[self.food_var.get()]
        self.uploaded_image_name = ""
        self.food_recognition_var.set(f"已手动选择：{food['name']}，营养卡已更新。")
        self.refresh_plan()

    def select_image_for_recognition(self):
        image_path = filedialog.askopenfilename(
            title="选择餐食图片",
            filetypes=[
                ("图片文件", "*.png;*.jpg;*.jpeg;*.bmp;*.gif"),
                ("所有文件", "*.*"),
            ],
        )
        if not image_path:
            return
        self.uploaded_image_name = Path(image_path).name
        self.food_recognition_var.set(f"正在识别图片：{self.uploaded_image_name}，请稍候...")
        threading.Thread(target=self._recognize_image_async, args=(image_path,), daemon=True).start()

    def _recognize_image_async(self, image_path):
        label, prefix, detail = self.recognize_food_image(image_path)
        self.after(0, lambda: self.apply_recognition_result(label, prefix, detail))

    def simulate_food_recognition(self):
        labels = list(FOODS)
        label = labels[self.recognition_index % len(labels)]
        self.recognition_index += 1
        self.uploaded_image_name = "模拟餐食图片.jpg"
        self.apply_recognition_result(label, "模拟识别完成")

    def classify_food_by_name(self, image_path):
        name = Path(image_path).stem.lower()
        for label, keywords in FOOD_KEYWORDS.items():
            if any(keyword in name for keyword in keywords):
                return label
        image_label = self.classify_food_by_image(image_path)
        if image_label:
            return image_label
        labels = list(FOODS)
        index = sum(ord(char) for char in name) % len(labels)
        return labels[index]

    def recognize_food_image(self, image_path):
        model_result, model_message = self.classify_food_by_large_model(image_path)
        if model_result:
            label, dish_name, confidence = model_result
            confidence_text = f"，置信度 {int(confidence * 100)}%" if confidence is not None else ""
            detail = f"大模型判断：{dish_name}{confidence_text}。"
            return label, f"已上传图片：{self.uploaded_image_name}，大模型识别完成", detail

        label = self.classify_food_by_name(image_path)
        detail = f"{model_message}，已使用本地规则兜底。"
        return label, f"已上传图片：{self.uploaded_image_name}，本地识别完成", detail

    def classify_food_by_large_model(self, image_path):
        api_key = os.getenv(VISION_API_KEY_ENV) or os.getenv("AIYINGBAO_VISION_API_KEY")
        if not api_key:
            return None, f"未配置 {VISION_API_KEY_ENV}"

        image_data_url = self._build_image_data_url(image_path)
        if not image_data_url:
            return None, "图片读取失败"

        model_name = os.getenv(VISION_MODEL_ENV, DEFAULT_VISION_MODEL)
        api_url = os.getenv(VISION_API_URL_ENV, DEFAULT_VISION_API_URL)
        labels = "、".join(FOODS.keys())
        prompt = (
            "请识别图片中的主要餐食或饮品，并从给定分类中选择最接近的一个。"
            f"可选分类：{labels}。"
            "只返回 JSON，不要输出解释文字。格式："
            '{"label":"分类名","dish_name":"识别到的具体食物","confidence":0.0}'
        )
        payload = {
            "model": model_name,
            "temperature": 0.1,
            "max_tokens": 300,
            "messages": [
                {
                    "role": "system",
                    "content": "你是用于健康与营养管理软件的图像识别助手，只识别食物、饮品和餐食类型。",
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_data_url}},
                    ],
                },
            ],
        }
        request = urllib.request.Request(
            api_url,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=VISION_TIMEOUT_SECONDS) as response:
                raw = response.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            return None, f"大模型接口返回 HTTP {exc.code}"
        except Exception as exc:
            return None, f"大模型调用失败：{exc}"

        try:
            data = json.loads(raw)
            content = data["choices"][0]["message"]["content"]
            if isinstance(content, list):
                content = "".join(item.get("text", "") for item in content if isinstance(item, dict))
            result = self._parse_model_json(str(content))
        except Exception:
            return None, "大模型结果解析失败"

        dish_name = str(result.get("dish_name") or result.get("name") or result.get("food") or "").strip()
        label_text = str(result.get("label") or dish_name).strip()
        label = self.map_model_label(label_text, dish_name)
        if label is None:
            return None, f"大模型返回了未匹配分类：{label_text or dish_name or '空结果'}"

        confidence = self._safe_float(result.get("confidence"), None)
        if confidence is not None:
            confidence = max(0.0, min(1.0, confidence))
        return (label, dish_name or label_text or label, confidence), "大模型识别成功"

    def _build_image_data_url(self, image_path):
        try:
            mime_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"
            with open(image_path, "rb") as image_file:
                encoded = base64.b64encode(image_file.read()).decode("ascii")
            return f"data:{mime_type};base64,{encoded}"
        except Exception:
            return None

    def _parse_model_json(self, content):
        text = content.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE).strip()
            text = re.sub(r"\s*```$", "", text).strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, flags=re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(0))

    def map_model_label(self, label_text, dish_name=""):
        combined = f"{label_text} {dish_name}".strip()
        if not combined:
            return None
        for label in FOODS:
            if label == label_text or label in combined:
                return label

        lower_text = combined.lower()
        for label, aliases in MODEL_LABEL_ALIASES.items():
            if any(alias.lower() in lower_text for alias in aliases):
                return label
        for label, keywords in FOOD_KEYWORDS.items():
            if any(keyword.lower() in lower_text for keyword in keywords):
                return label
        return None

    def classify_food_by_image(self, image_path):
        if Image is None:
            return None
        try:
            with Image.open(image_path) as image:
                image = image.convert("RGB")
                width, height = image.size
                image.thumbnail((96, 96))
                pixels = list(image.getdata())
        except Exception:
            return None

        total = max(len(pixels), 1)
        orange = 0
        noodle = 0
        beef = 0
        white = 0
        green = 0
        dark_meat = 0
        deep_red = 0
        cream = 0
        amber = 0
        beige = 0

        for red, green_value, blue in pixels:
            if red > 185 and 70 <= green_value <= 150 and blue < 70:
                orange += 1
            if red > 170 and green_value > 145 and 80 <= blue <= 145:
                noodle += 1
            if 90 <= red <= 180 and 35 <= green_value <= 105 and 25 <= blue <= 95:
                beef += 1
            if red > 210 and green_value > 205 and blue > 185:
                white += 1
            if green_value > red * 1.1 and green_value > blue * 1.1 and green_value > 80:
                green += 1
            if 45 <= red <= 130 and 25 <= green_value <= 90 and 20 <= blue <= 75:
                dark_meat += 1
            if 85 <= red <= 170 and 5 <= green_value <= 55 and 30 <= blue <= 90:
                deep_red += 1
            if red > 205 and green_value > 190 and 145 <= blue <= 190:
                cream += 1
            if red > 150 and 75 <= green_value <= 135 and blue < 80:
                amber += 1
            if 150 <= red <= 220 and 125 <= green_value <= 190 and 80 <= blue <= 145:
                beige += 1

        orange_ratio = orange / total
        noodle_ratio = noodle / total
        beef_ratio = beef / total
        white_ratio = white / total
        green_ratio = green / total
        dark_meat_ratio = dark_meat / total
        deep_red_ratio = deep_red / total
        cream_ratio = cream / total
        amber_ratio = amber / total
        beige_ratio = beige / total
        landscape = width > height * 1.15
        portrait = height > width * 1.15

        if portrait and deep_red_ratio > 0.06 and cream_ratio > 0.25 and white_ratio > 0.25:
            return "杯装咖啡"
        if portrait and beige_ratio > 0.3 and cream_ratio > 0.05 and white_ratio < 0.15:
            return "百合绿豆水"
        if landscape and orange_ratio > 0.09 and noodle_ratio > 0.06:
            return "牛肉面"
        if noodle_ratio > 0.16 and (beef_ratio + dark_meat_ratio) > 0.08:
            return "牛肉面"
        if white_ratio > 0.18 and orange_ratio > 0.015 and (beef_ratio + dark_meat_ratio) > 0.12:
            return "牛肉盖饭"
        if green_ratio > 0.16 and white_ratio > 0.12:
            return "沙拉"
        if orange_ratio > 0.18 and beef_ratio > 0.1:
            return "火锅"
        return None

    def apply_recognition_result(self, label, prefix, detail=""):
        self.food_var.set(label)
        food = FOODS[label]
        suffix = f" {detail}" if detail else ""
        self.food_recognition_var.set(f"{prefix}，结果为：{food['name']}。{suffix}")
        self.select_section("营养分析", announce=False)
        self.refresh_plan()

    def regenerate_advice(self):
        self.refresh_plan(show_toast=True, force_feedback=True)

    def refresh_plan(self, show_toast=True, force_feedback=False):
        food = FOODS.get(self.food_var.get(), FOODS["轻食碗"])
        goal = GOALS.get(self.goal_var.get(), "balance")
        glucose = self.glucose_var.get()
        steps = self._safe_int_var(self.steps_var, 0)
        sleep = self._safe_float_var(self.sleep_var, 7.0)

        active_score = min(18, steps // 700)
        sleep_score = max(0, round((sleep - 4) * 7))
        glucose_penalty = 12 if glucose == "偏高" else 7 if glucose == "偏低" else 0
        score = max(45, min(98, 58 + active_score + sleep_score - glucose_penalty))
        calorie_base = 1500 if goal == "fatLoss" else 2050 if goal == "muscle" else 1680 if goal == "heart" else 1780
        calorie = calorie_base + (120 if steps > 10000 else 0) - (90 if glucose == "偏高" else 0)
        protein = 105 if goal == "muscle" else 86 if goal == "fatLoss" else 78

        self.score_value.configure(text=str(score))
        self.calorie_value.configure(text=str(calorie))
        self.protein_value.configure(text=f"{protein}g")
        self.sleep_label.configure(text=f"{sleep:.1f} 小时")

        tips = self._build_tips(score, calorie, protein, food, glucose, sleep)
        self._set_text(self.recommendation_text, "\n\n".join(f"{i + 1}. {tip}" for i, tip in enumerate(tips)))
        self._set_text(self.coach_text, f"我会根据你的{self.goal_var.get()}目标、可穿戴数据和餐食记录动态调整建议。今天的重点是：{tips[1]}")
        self._draw_food(food, score)

        if show_toast:
            self.refresh_count += 1
            stamp = datetime.now().strftime("%H:%M:%S")
            self.last_update_var.set(f"建议已刷新 {self.refresh_count} 次 · {stamp}")
            title_text = f"AI智营宝 - 已于 {stamp} 更新建议"
            self.title(title_text)
            if force_feedback:
                self.food_recognition_var.set(f"已重新生成建议：{food['name']}，营养卡和推荐已更新。")

    def _build_tips(self, score, calorie, protein, food, glucose, sleep):
        tips = [
            f"当前目标为“{self.goal_var.get()}”，今日建议热量约 {calorie} kcal，优先保证蛋白质 {protein}g。",
            "餐后血糖偏高，下一餐减少精制主食，增加蔬菜和优质蛋白。" if glucose == "偏高" else "血糖有回落趋势，运动后可补充少量全谷物和水果。" if glucose == "偏低" else "血糖趋势稳定，可以保持目前主食比例，并关注晚餐脂肪摄入。",
            "睡眠不足会影响食欲调节，今晚建议减少咖啡因并提前安排晚餐。" if sleep < 6.5 else "睡眠状态良好，适合安排中等强度运动并维持规律进餐。",
        ]
        if self.lactose_var.get():
            tips.append("已避开乳制品，推荐无糖豆浆、豆腐、鱼虾或鸡蛋补充蛋白。")
        elif self.vegetarian_var.get():
            tips.append("已优先考虑素食，推荐豆腐、鹰嘴豆、坚果和全谷物组合。")
        else:
            tips.append(f"识别到“{food['name']}”，本餐蛋白 {food['protein']}g，可作为今日主要蛋白来源之一。")
        if self.low_salt_var.get():
            tips.append("低盐模式已开启，建议选择清蒸、炖煮和天然香辛料调味。")
        if score < 70:
            tips.append("健康评分偏低，建议先稳定作息，再逐步调整饮食结构。")
        return tips

    def _draw_food(self, food, score):
        canvas = self.food_canvas
        canvas.delete("all")
        width = max(canvas.winfo_width(), 430)
        center_x = width // 2
        canvas.create_oval(center_x - 110, 22, center_x + 110, 198, fill="#ffffff", outline="#d8dfd7", width=12)
        colors = food["colors"]
        canvas.create_oval(center_x - 78, 68, center_x - 18, 128, fill=colors[0], outline="")
        canvas.create_oval(center_x + 8, 58, center_x + 76, 126, fill=colors[1], outline="")
        canvas.create_oval(center_x - 10, 118, center_x + 72, 190, fill=colors[2], outline="")
        canvas.create_rectangle(20, 142, width - 20, 198, fill="#ffffff", outline="#dce4dd")
        canvas.create_text(38, 160, text=food["name"], anchor="w", fill=self.palette["ink"], font=("Microsoft YaHei UI", 12, "bold"))
        canvas.create_text(38, 182, text=f"{food['macro']} | 评分 {score}", anchor="w", fill=self.palette["muted"], font=("Microsoft YaHei UI", 9))
        if self.uploaded_image_name:
            canvas.create_rectangle(22, 18, 202, 58, fill="#dff2e7", outline="#b9dfc8")
            canvas.create_text(34, 31, text="已上传图片", anchor="w", fill=self.palette["green"], font=("Microsoft YaHei UI", 9, "bold"))
            canvas.create_text(34, 47, text=self.uploaded_image_name[:22], anchor="w", fill=self.palette["muted"], font=("Microsoft YaHei UI", 8))

    def ask_coach(self):
        question = self.coach_input_var.get().strip()
        if not question:
            return
        glucose_note = "主食减半，优先选择全谷物。" if self.glucose_var.get() == "偏高" else "主食可以保留一拳左右。"
        answer = f"关于“{question}”：如果今晚已吃过{FOODS[self.food_var.get()]['name']}，下一餐建议补足深色蔬菜和水分，{glucose_note}我会继续结合步数、睡眠和餐后血糖更新计划。"
        self._set_text(self.coach_text, answer)
        self.coach_input_var.set("")

    @staticmethod
    def _safe_int(value, default):
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _safe_int_var(variable, default):
        try:
            return int(variable.get())
        except (tk.TclError, TypeError, ValueError):
            return default

    @staticmethod
    def _safe_float_var(variable, default):
        try:
            return float(variable.get())
        except (tk.TclError, TypeError, ValueError):
            return default

    @staticmethod
    def _set_text(widget, text):
        widget.configure(state="normal")
        widget.delete("1.0", "end")
        widget.insert("1.0", text)
        widget.configure(state="disabled")


if __name__ == "__main__":
    try:
        app = NutritionApp()
        app.mainloop()
    except Exception as exc:
        messagebox.showerror("AI智营宝启动失败", str(exc))
