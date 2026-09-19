(function () {
  "use strict";
  const DEFAULT_API = "https://aiyingbao2026.onrender.com/api/vision-recognition";
  const API = window.AIYINGBAO_API_URL || localStorage.getItem("aiyingbaoApiUrl") || DEFAULT_API;
  const $ = (id) => document.getElementById(id);
  let selectedFile = null;

  $("todayText").textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
  document.querySelectorAll(".nav a").forEach((link) => link.addEventListener("click", () => {
    document.querySelectorAll(".nav a").forEach((item) => item.classList.remove("active")); link.classList.add("active");
  }));

  $("profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const gender = $("gender").value, age = +$("age").value, height = +$("height").value, weight = +$("weight").value;
    const bmr = gender === "male" ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
    const factor = +$("activity").value, goal = $("goal").value;
    const calories = Math.max(1200, Math.round((bmr * factor + (goal === "loss" ? -300 : goal === "gain" ? 250 : 0)) / 10) * 10);
    $("calorieGoal").textContent = calories; $("proteinGoal").textContent = Math.round(weight * (goal === "gain" ? 1.8 : 1.5));
    $("healthScore").textContent = Math.min(95, Math.max(70, Math.round(88 - Math.abs(weight / ((height / 100) ** 2) - 22))));
  });

  function selectFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setStatus("请选择图片文件。", true);
    if (file.size > 8 * 1024 * 1024) return setStatus("图片不能超过 8MB。", true);
    selectedFile = file; $("preview").src = URL.createObjectURL(file); $("preview").hidden = false; $("uploadPrompt").hidden = true; $("recognizeButton").disabled = false; setStatus("照片已就绪，点击“开始识别”。");
  }
  $("chooseButton").addEventListener("click", () => $("foodUpload").click());
  $("foodUpload").addEventListener("change", (event) => selectFile(event.target.files[0]));
  $("dropZone").addEventListener("click", () => $("foodUpload").click());
  $("dropZone").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") $("foodUpload").click(); });
  ["dragenter", "dragover"].forEach((name) => $("dropZone").addEventListener(name, (e) => { e.preventDefault(); $("dropZone").classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((name) => $("dropZone").addEventListener(name, (e) => { e.preventDefault(); $("dropZone").classList.remove("dragging"); }));
  $("dropZone").addEventListener("drop", (e) => selectFile(e.dataTransfer.files[0]));
  function setStatus(text, error) { $("recognitionStatus").textContent = text; $("recognitionStatus").classList.toggle("error", !!error); }
  function asDataUrl(file) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); }); }
  function number(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? Math.round(n * 10) / 10 : fallback; }
  function scorePercent(value) { const n = number(value); return Math.max(0, Math.min(100, n <= 1 ? n * 100 : n)); }
  function escapeHtml(value) { const el = document.createElement("span"); el.textContent = String(value); return el.innerHTML; }
  function displayResult(data) {
    const labels = window.AIYingBaoLabels;
    $("foodName").textContent = labels.normalizeCategory(data.foodCategory);
    $("confidenceBadge").textContent = `可信度 ${scorePercent(data.confidence).toFixed(1)}%`;
    const ingredients = Array.isArray(data.ingredients) && data.ingredients.length ? data.ingredients.slice(0, 8) : ["食材待确认"];
    $("ingredients").innerHTML = ingredients.map((x) => `<span>${escapeHtml(x)}</span>`).join("");
    const n = data.nutrition || {}; $("calories").textContent = number(n.calories, "--"); $("protein").textContent = number(n.protein, "--"); $("carbs").textContent = number(n.carbs, "--"); $("fat").textContent = number(n.fat, "--");
    const items = Array.isArray(data.top5) ? data.top5.slice(0, 5) : [];
    $("top5").innerHTML = (items.length ? items : [{ name: data.foodCategory, score: data.confidence }]).map((item) => { const p = scorePercent(item.score); return `<li><div><span>${escapeHtml(labels.translateTop5(item.name))}</span><b>${p.toFixed(1)}%</b></div><i><em style="width:${p}%"></em></i></li>`; }).join("");
    $("resultPanel").hidden = false;
  }
  $("recognizeButton").addEventListener("click", async () => {
    if (!selectedFile) return;
    const button = $("recognizeButton"); button.disabled = true; button.textContent = "AI识别中…"; setStatus("正在分析餐食图片，Render 首次唤醒可能需要约一分钟。");
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageDataUrl: await asDataUrl(selectedFile) }) });
      const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || `服务响应异常（${response.status}）`);
      displayResult(data); setStatus("识别完成：结果已按粗粒度餐食类别展示。");
    } catch (error) { setStatus(`识别失败：${error.message}。请确认 Render 服务已启动并允许跨域访问。`, true); }
    finally { button.disabled = false; button.textContent = "重新识别"; }
  });
})();
