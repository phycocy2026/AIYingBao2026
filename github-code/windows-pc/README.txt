AI智营宝 Windows PC 版

运行方式：
1. 双击 run_AIYingBao_PC.bat
2. 或在命令行进入本目录后运行：
   python AIYingBao_PC.py

图像识别大模型配置：
1. 当前版本已支持接入 OpenAI 兼容格式的视觉大模型接口，默认按阿里云百炼 DashScope 的 qwen-vl-plus 调用。
2. 在运行前设置环境变量：
   PowerShell:
   $env:DASHSCOPE_API_KEY="你的API Key"
   python AIYingBao_PC.py

3. 可选环境变量：
   AIYINGBAO_VISION_MODEL：指定视觉模型名称，默认 qwen-vl-plus。
   AIYINGBAO_VISION_API_URL：指定 OpenAI 兼容接口地址，默认 https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
   AIYINGBAO_VISION_API_KEY：备用 API Key 变量；如果未设置 DASHSCOPE_API_KEY，会读取该变量。

说明：
- 上传图片后，软件会优先调用视觉大模型识别餐食或饮品。
- 如果未配置 API Key、网络不可用或接口返回失败，软件会自动使用本地图片规则兜底，保证营养分析模块仍可更新。
- 大模型只用于识别图片中的食物/饮品类别，识别结果会映射到软件内置营养卡分类。

主要功能：
- 健康评分与建议热量、蛋白目标
- 身体数据、睡眠、步数、血糖趋势输入
- 饮食限制：乳糖不耐、低盐、素食优先
- 图片上传识别与 AR 营养卡
- 个性化营养推荐
- 虚拟健康教练问答
- 社区支持信息
