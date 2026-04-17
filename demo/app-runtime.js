const CONFIG_URL = "./config/ciiuti-21q-bf-ciiu-v2.json";
const LEVEL_NUM = { L: 1, M: 2, H: 3 };

let config = null;

const state = {
  answers: {},
  startedAt: 0,
};

const app = document.getElementById("app");

function renderLoading() {
  app.innerHTML = `
    <div class="card result-card">
      <p class="result-line-1">正在加载题库...</p>
    </div>
  `;
}

function renderLoadError(message) {
  app.innerHTML = `
    <div class="card">
      <h2>题库加载失败</h2>
      <p class="muted">${message}</p>
      <p class="muted">建议用本地静态服务打开（如 Live Server）再试。</p>
    </div>
  `;
}

function validateConfig(json) {
  if (!json || !Array.isArray(json.questions) || !Array.isArray(json.roles) || !Array.isArray(json.dimensions)) {
    throw new Error("配置缺少 questions/roles/dimensions");
  }
}

async function loadConfig() {
  renderLoading();
  try {
    const res = await fetch(CONFIG_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    validateConfig(json);
    config = json;
    renderIntro();
  } catch (err) {
    renderLoadError(`无法读取 ${CONFIG_URL}：${String(err.message || err)}`);
  }
}

function rawToAdjusted(raw, reverseScored) {
  return reverseScored ? 5 - raw : raw;
}

function sumToLevel(sum) {
  if (sum <= 6) return "L";
  if (sum <= 9) return "M";
  return "H";
}

function computeUserPattern(answers) {
  const byDim = {};
  config.dimensions.forEach((d) => {
    byDim[d.id] = [];
  });
  config.questions.forEach((q) => {
    const raw = answers[q.id];
    const adj = rawToAdjusted(raw, Boolean(q.reverseScored));
    byDim[q.dimensionId].push(adj);
  });

  const pattern = {};
  const sums = {};
  config.dimensions.forEach((d) => {
    const vals = byDim[d.id];
    const sum = vals.reduce((a, b) => a + b, 0);
    sums[d.id] = sum;
    pattern[d.id] = sumToLevel(sum);
  });
  return { pattern, sums };
}

function manhattanPatternDistance(userPattern, rolePattern) {
  let dist = 0;
  config.dimensions.forEach((d) => {
    const u = LEVEL_NUM[userPattern[d.id]];
    const t = LEVEL_NUM[rolePattern[d.id]];
    dist += Math.abs(u - t);
  });
  return dist;
}

function rankRoles(userPattern) {
  const maxDist = config.dimensions.length * 2;
  return config.roles
    .map((role) => {
      const distance = manhattanPatternDistance(userPattern, role.pattern);
      const similarity = Math.max(0, Math.round((1 - distance / maxDist) * 100));
      return { role, distance, similarity };
    })
    .sort((a, b) => a.distance - b.distance || b.similarity - a.similarity);
}

function fillRandomAnswers() {
  config.questions.forEach((q) => {
    const pool = Array.isArray(q.options) ? q.options : [];
    const randomIndex = Math.floor(Math.random() * pool.length);
    state.answers[q.id] = pool[randomIndex].score;
  });
}

function renderIntro() {
  app.innerHTML = `
    <div class="start-shell">
      <div class="start-card">
        <h2 class="start-title">${config.meta.title || "CIIUTI"}</h2>
        <p class="start-subtitle">${config.meta.subtitle || ""}</p>
        <button class="start-btn" id="startBtn">来798报到</button>
        <p class="disclaimer">友情提醒：${config.meta.disclaimer || "本测试仅供娱乐，不收集任何个人信息。"}</p>
        <p class="start-sign">Designed by zzzxl</p>
      </div>
    </div>
  `;
  document.getElementById("startBtn").addEventListener("click", () => {
    state.answers = {};
    state.startedAt = Date.now();
    renderQuestions();
  });
}

function renderQuestions() {
  if (Object.keys(state.answers).length === 0) {
    fillRandomAnswers();
  }

  const total = config.questions.length;
  const finishedCount = Object.keys(state.answers).length;
  const progress = Math.round((finishedCount / total) * 100);

  app.innerHTML = `
    <div class="test-shell">
      <div class="progress-sticky-wrap">
        <div class="card progress-card">
          <div class="progress-head">
            <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
            <strong>${finishedCount} / ${total}</strong>
          </div>
        </div>
      </div>
      <div id="questionList"></div>
      <div class="actions actions-single">
        <button class="primary submit-full" id="submitBtn">决定好那就出发</button>
      </div>
    </div>
  `;

  const questionList = document.getElementById("questionList");
  config.questions.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "card question-card";
    card.innerHTML = `
      <span class="q-index">第 ${index + 1} 题</span>
      <h3 class="q-title">${q.text}</h3>
      <div class="options single-col" id="opt-${q.id}"></div>
    `;
    questionList.appendChild(card);

    const optWrap = card.querySelector(`#opt-${q.id}`);
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "opt";
      btn.type = "button";
      btn.innerHTML = `<span class="opt-letter">${opt.id}</span><span>${opt.label}</span>`;
      if (state.answers[q.id] === opt.score) btn.classList.add("active");
      btn.addEventListener("click", () => {
        state.answers[q.id] = opt.score;
        [...optWrap.children].forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        updateProgress();
      });
      optWrap.appendChild(btn);
    });
  });

  document.getElementById("submitBtn").addEventListener("click", () => {
    submitTest();
  });

  function updateProgress() {
    const done = Object.keys(state.answers).length;
    const p = Math.round((done / total) * 100);
    const fill = document.querySelector(".progress-fill");
    const text = document.querySelector(".progress-head strong");
    if (fill) fill.style.width = `${p}%`;
    if (text) text.textContent = `${done} / ${total}`;
  }
}

function formatPatternLine() {
  return config.dimensions.map((d) => d.name).join(" · ");
}

function submitTest() {
  if (Object.keys(state.answers).length !== config.questions.length) {
    alert("请先完成所有题目。");
    return;
  }
  const { pattern, sums } = computeUserPattern(state.answers);
  const ranked = rankRoles(pattern);
  const top1 = ranked[0];
  const top2 = ranked[1];
  renderResult(top1, top2, pattern, sums, ranked);
}

function renderResult(top1, top2, userPattern, sums, ranked) {
  const confidenceGap = top1.similarity - top2.similarity;
  const deploymentUrl = config.meta?.deploymentUrl || window.location.origin;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(deploymentUrl)}`;

  const dimDetail = config.dimensions
    .map(
      (d) => `
      <div class="dim-row">
        <span class="dim-name">${d.name}</span>
        <span class="dim-val">已完成</span>
      </div>
    `
    )
    .join("");

  const top3 = ranked
    .slice(0, 3)
    .map((x) => `<li>${x.role.name}：${x.similarity}%</li>`)
    .join("");

  app.innerHTML = `
    <div class="card result-card">
      <p class="result-line-1">你在CIIU中的身份是</p>
      <h2 class="result-line-2">${top1.role.name}</h2>
      <p class="muted pattern-summary">${formatPatternLine()}</p>
      <div class="result-image-slot"><p class="result-image-label">成员视觉图（待替换）</p></div>
      <div class="qr-row">
        <img src="${qrUrl}" alt="分享二维码" class="qr-image" width="88" height="88" />
        <div class="qr-copy">
          <p class="qr-copy-title">扫码分享本测试</p>
          <p class="qr-copy-sub">二维码会自动指向你配置的部署地址</p>
        </div>
      </div>
      <p class="disclaimer">友情提醒：${config.meta.disclaimer || "本测试仅供娱乐，不收集任何个人信息。"}</p>
      ${confidenceGap < 8 ? `<p class="muted">边界提示：你与 ${top2.role.name} 接近（差 ${confidenceGap}%）。</p>` : ""}
      <div class="muted top3-block">匹配度 Top3：<ol class="top3-list">${top3}</ol></div>
      <div class="actions actions-single">
        <button class="primary submit-full" id="retryBtn">重新出道</button>
      </div>
    </div>
  `;

  document.getElementById("retryBtn").addEventListener("click", () => {
    state.answers = {};
    state.startedAt = Date.now();
    renderQuestions();
  });
}

loadConfig();
