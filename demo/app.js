const CONFIG_URL = "../config/ciiuti-21q-bf-ciiu-v2.json";
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

async function loadConfig() {
  renderLoading();
  try {
    const res = await fetch(CONFIG_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    validateConfig(json);
    config = json;
    renderIntro();
  } catch (err) {
    renderLoadError(`无法读取 ${CONFIG_URL}：${String(err.message || err)}`);
  }
}

function validateConfig(json) {
  if (!json || !Array.isArray(json.questions) || !Array.isArray(json.roles) || !Array.isArray(json.dimensions)) {
    throw new Error("配置缺少 questions/roles/dimensions");
  }
}

/*
  以下逻辑使用外部 JSON 的结构：
  - meta/title/subtitle/disclaimer
  - dimensions[]
  - roles[].pattern
  - questions[].options[]
*/

// 历史废弃的题库定义已移除，避免与当前 JSON 配置混淆。

function rawToAdjusted(raw, reverseScored) {
  return reverseScored ? 5 - raw : raw;
}

/** 三题分值和 ∈ [3,12] → L/M/H */
function sumToLevel(sum) {
      id: "Q01",
      dimensionId: "D1",
      reverseScored: false,
      text: "排练时临时加了一个 solo 段落，你通常会？",
      options: [
        { id: "A", label: "尽量躲到队形后排，避免被点名", score: 1 },
        { id: "B", label: "被安排就做，但不主动争取", score: 2 },
        { id: "C", label: "主动申请尝试一次，看看效果", score: 3 },
        { id: "D", label: "直接提出完整方案并带大家走位", score: 4 }
      ]
    },
    {
      id: "Q02",
      dimensionId: "D1",
      reverseScored: false,
      text: "舞台镜头切到你时，你最常见的状态是？",
      options: [
        { id: "A", label: "略紧张，容易做保守动作", score: 1 },
        { id: "B", label: "完成动作优先，情绪收着", score: 2 },
        { id: "C", label: "会加一点个人表情和设计", score: 3 },
        { id: "D", label: "天然进入主场状态，主动抓镜头", score: 4 }
      ]
    },
    {
      id: "Q03",
      dimensionId: "D1",
      reverseScored: false,
      text: "活动现场突然冷场时，你会？",
      options: [
        { id: "A", label: "等待别人先救场", score: 1 },
        { id: "B", label: "配合别人抛梗，少说少错", score: 2 },
        { id: "C", label: "主动接一句并把气氛拉回来", score: 3 },
        { id: "D", label: "立刻接管节奏，连续抛点控场", score: 4 }
      ]
    },
    {
      id: "Q04",
      dimensionId: "D2",
      reverseScored: false,
      text: "团队有人动作总慢半拍，你通常怎么做？",
      options: [
        { id: "A", label: "各练各的，先顾好自己", score: 1 },
        { id: "B", label: "提醒一次，之后不再介入", score: 2 },
        { id: "C", label: "私下陪练几遍，帮他卡点", score: 3 },
        { id: "D", label: "主动重排配合节奏，确保全队整齐", score: 4 }
      ]
    },
    {
      id: "Q05",
      dimensionId: "D2",
      reverseScored: false,
      text: "团体采访时，你更像哪种角色？",
      options: [
        { id: "A", label: "只回答自己相关问题", score: 1 },
        { id: "B", label: "偶尔接话，但不主动补位", score: 2 },
        { id: "C", label: "会给队友递话、接梗", score: 3 },
        { id: "D", label: "主动平衡发言，让每个人有镜头", score: 4 }
      ]
    },
    {
      id: "Q06",
      dimensionId: "D2",
      reverseScored: false,
      text: "分part时你拿到不是最想要的段落，你会？",
      options: [
        { id: "A", label: "不太配合，影响训练心态", score: 1 },
        { id: "B", label: "接受安排，但投入一般", score: 2 },
        { id: "C", label: "先把当前part做好，再争取调整", score: 3 },
        { id: "D", label: "以整体效果优先，主动补队伍短板", score: 4 }
      ]
    },
    {
      id: "Q07",
      dimensionId: "D3",
      reverseScored: false,
      text: "没有监督时，你的训练习惯更接近？",
      options: [
        { id: "A", label: "看心情练，容易断档", score: 1 },
        { id: "B", label: "完成基本量就停", score: 2 },
        { id: "C", label: "按计划完成，并做简单复盘", score: 3 },
        { id: "D", label: "会额外加练并记录细节优化", score: 4 }
      ]
    },
    {
      id: "Q08",
      dimensionId: "D3",
      reverseScored: false,
      text: "连续几天状态不佳时，你会？",
      options: [
        { id: "A", label: "直接摆烂，等状态自己回来", score: 1 },
        { id: "B", label: "降低标准，先糊过去", score: 2 },
        { id: "C", label: "调节后继续按计划推进", score: 3 },
        { id: "D", label: "重做训练策略并严格执行", score: 4 }
      ]
    },
    {
      id: "Q09",
      dimensionId: "D3",
      reverseScored: false,
      text: "你对“一个动作打磨到位”的标准是？",
      options: [
        { id: "A", label: "差不多就行，不必太细", score: 1 },
        { id: "B", label: "老师不指出就不额外修", score: 2 },
        { id: "C", label: "会主动看回放修正", score: 3 },
        { id: "D", label: "反复拆解到稳定可复现", score: 4 }
      ]
    },
    {
      id: "Q10",
      dimensionId: "D4",
      reverseScored: false,
      text: "面对同一段旋律，你更常做的是？",
      options: [
        { id: "A", label: "照模板完成，不想改动", score: 1 },
        { id: "B", label: "小幅调整，整体不变", score: 2 },
        { id: "C", label: "加入个人处理和记忆点", score: 3 },
        { id: "D", label: "直接重构表达逻辑并提新方向", score: 4 }
      ]
    },
    {
      id: "Q11",
      dimensionId: "D4",
      reverseScored: false,
      text: "你在团队创作会里通常扮演？",
      options: [
        { id: "A", label: "主要听别人方案", score: 1 },
        { id: "B", label: "有想法但不常主动提", score: 2 },
        { id: "C", label: "会持续提出可落地创意", score: 3 },
        { id: "D", label: "经常抛出核心概念带动全组", score: 4 }
      ]
    },
    {
      id: "Q12",
      dimensionId: "D4",
      reverseScored: false,
      text: "如果反馈“风格太保守”，你会？",
      options: [
        { id: "A", label: "不太在意，维持原样", score: 1 },
        { id: "B", label: "表面接受，实际变化很少", score: 2 },
        { id: "C", label: "挑一个环节做实验调整", score: 3 },
        { id: "D", label: "系统升级视觉和内容表达", score: 4 }
      ]
    },
    {
      id: "Q13",
      dimensionId: "D5",
      reverseScored: false,
      text: "舞台上表达情绪时，你更像？",
      options: [
        { id: "A", label: "尽量收着，怕过头", score: 1 },
        { id: "B", label: "只做基本表情管理", score: 2 },
        { id: "C", label: "会按段落释放不同情绪", score: 3 },
        { id: "D", label: "能把观众明显带入情绪轨道", score: 4 }
      ]
    },
    {
      id: "Q14",
      dimensionId: "D5",
      reverseScored: false,
      text: "当作品引发争议评论时，你会？",
      options: [
        { id: "A", label: "完全回避，不再回应", score: 1 },
        { id: "B", label: "简单回应后迅速抽离", score: 2 },
        { id: "C", label: "理性回应并表达真实态度", score: 3 },
        { id: "D", label: "把争议转化为下一次表达素材", score: 4 }
      ]
    },
    {
      id: "Q15",
      dimensionId: "D5",
      reverseScored: false,
      text: "遇到“需要打动人”的舞台主题时，你会优先？",
      options: [
        { id: "A", label: "动作准确，不追求感染", score: 1 },
        { id: "B", label: "参考常见套路处理", score: 2 },
        { id: "C", label: "结合自身经历做情绪设计", score: 3 },
        { id: "D", label: "从音乐到表演整体构建情绪线", score: 4 }
      ]
    },
    {
      id: "Q16",
      dimensionId: "D6",
      reverseScored: false,
      text: "一个月后有重要舞台，你第一步会？",
      options: [
        { id: "A", label: "先等通知，临近再说", score: 1 },
        { id: "B", label: "先练最熟的部分", score: 2 },
        { id: "C", label: "先拆任务和时间节点", score: 3 },
        { id: "D", label: "连资源、人力、风险都先做规划", score: 4 }
      ]
    },
    {
      id: "Q17",
      dimensionId: "D6",
      reverseScored: false,
      text: "遇到资源冲突（行程/训练/拍摄）时，你会？",
      options: [
        { id: "A", label: "谁催得急就先做谁", score: 1 },
        { id: "B", label: "按习惯顺序处理", score: 2 },
        { id: "C", label: "按目标优先级取舍", score: 3 },
        { id: "D", label: "重排整体路径并同步相关人", score: 4 }
      ]
    },
    {
      id: "Q18",
      dimensionId: "D6",
      reverseScored: false,
      text: "你做决定更依赖？",
      options: [
        { id: "A", label: "当下直觉，先做再说", score: 1 },
        { id: "B", label: "身边人意见为主", score: 2 },
        { id: "C", label: "目标+数据+经验综合判断", score: 3 },
        { id: "D", label: "先看长期收益再选最优解", score: 4 }
      ]
    },
    {
      id: "Q19",
      dimensionId: "D7",
      reverseScored: false,
      text: "看到喜欢的团体发新内容，你最常见行为是？",
      options: [
        { id: "A", label: "偶尔刷到才看", score: 1 },
        { id: "B", label: "会看，但不持续跟进", score: 2 },
        { id: "C", label: "会主动追更并参与讨论", score: 3 },
        { id: "D", label: "会系统关注并拉朋友一起应援", score: 4 }
      ]
    },
    {
      id: "Q20",
      dimensionId: "D7",
      reverseScored: false,
      text: "遇到团体被误解时，你通常会？",
      options: [
        { id: "A", label: "不参与，怕麻烦", score: 1 },
        { id: "B", label: "只在熟人圈简单解释", score: 2 },
        { id: "C", label: "理性澄清并给出信息来源", score: 3 },
        { id: "D", label: "组织资料、统一口径主动引导讨论", score: 4 }
      ]
    },
    {
      id: "Q21",
      dimensionId: "D7",
      reverseScored: false,
      text: "以下哪种“支持方式”最像你？",
      options: [
        { id: "A", label: "喜欢就好，不会投入太多", score: 1 },
        { id: "B", label: "偶尔打榜/转发，随机参与", score: 2 },
        { id: "C", label: "会持续参与多个应援环节", score: 3 },
        { id: "D", label: "长期稳定投入，并自发组织协作", score: 4 }
      ]
    }
  ]
];

function rawToAdjusted(raw, reverseScored) {
  return reverseScored ? 5 - raw : raw;
}

/** 三题分值和 ∈ [3,12] → L/M/H */
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
    const adj = rawToAdjusted(raw, q.reverseScored);
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
    const pool = q.options && q.options.length ? q.options : config.options;
    const randomIndex = Math.floor(Math.random() * pool.length);
    state.answers[q.id] = pool[randomIndex].score;
  });
}

function renderIntro() {
  app.innerHTML = `
    <div class="start-shell">
      <div class="start-card">
        <h2 class="start-title">${config.meta.title}</h2>
        <p class="start-subtitle">${config.meta.description}</p>
        <button class="start-btn" id="startBtn">来798报到</button>
        <p class="disclaimer">友情提醒：本测试仅供娱乐，不收集任何个人信息。</p>
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
            <div class="progress-track">
              <div class="progress-fill" style="width:${progress}%"></div>
            </div>
            <strong>${finishedCount} / ${total}</strong>
          </div>
        </div>
      </div>
      <div id="questionList"></div>

      <div class="actions">
        <button class="ghost" id="resetBtn">重新随机</button>
        <button class="primary" id="submitBtn">决定好那就出发</button>
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
    const options = q.options && q.options.length ? q.options : config.options;
    options.forEach((opt) => {
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

  document.getElementById("resetBtn").addEventListener("click", () => {
    fillRandomAnswers();
    renderQuestions();
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

function submitTest() {
  if (Object.keys(state.answers).length !== config.questions.length) {
    alert("请先完成所有题目。");
    return;
  }

  const { pattern, sums } = computeUserPattern(state.answers);
  const ranked = rankRoles(pattern);
  const top1 = ranked[0];
  const top2 = ranked[1];
  const durationSec = Math.round((Date.now() - state.startedAt) / 1000);
  renderResult(top1, top2, pattern, sums, durationSec, ranked);
}

function formatPatternLine(pattern) {
  return config.dimensions.map((d) => `${d.id}:${pattern[d.id]}`).join(" · ");
}

function renderResult(top1, top2, userPattern, sums, durationSec, ranked) {
  const confidenceGap = top1.similarity - top2.similarity;
  const lowDuration = durationSec < 25;
  const sharePayload = `我在 CIIU 中的身份是 ${top1.role.name}，你也来测测看！`;
  const resultShareText = encodeURIComponent(sharePayload);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${resultShareText}`;

  const dimDetail = config.dimensions
    .map(
      (d) => `
      <div class="dim-row">
        <span class="dim-name">${d.name}</span>
        <span class="dim-val">${userPattern[d.id]} <span class="dim-sum">(${sums[d.id]}/12)</span></span>
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
      <p class="muted pattern-summary">${formatPatternLine(userPattern)}</p>
      <div class="result-image-slot">
        <p class="result-image-label">成员视觉图（待替换）</p>
      </div>
      <div class="qr-row">
        <img src="${qrUrl}" alt="分享二维码" class="qr-image" width="88" height="88" />
        <div class="qr-copy">
          <p class="qr-copy-title">扫码分享本测试</p>
          <p class="qr-copy-sub">把结果发给朋友，看看谁是哪种身份</p>
        </div>
      </div>
      <p class="disclaimer">友情提醒：本测试仅供娱乐，不收集任何个人信息。</p>
      <details class="dim-details">
        <summary>七维档位（SBTI 式 L/M/H）</summary>
        ${dimDetail}
      </details>
      ${
        confidenceGap < 8
          ? `<p class="muted">边界提示：你与 ${top2.role.name} 接近（差 ${confidenceGap}%），可作混合解读。</p>`
          : ""
      }
      ${
        lowDuration
          ? `<p class="muted">你作答速度很快（${durationSec}s），若想更稳可稍后重测。</p>`
          : `<p class="muted">作答时长 ${durationSec}s。</p>`
      }
      <div class="muted top3-block">匹配度 Top3：<ol class="top3-list">${top3}</ol></div>
      <div class="actions">
        <button class="primary" id="retryBtn">重新出道</button>
        <button class="ghost" id="backHomeBtn">回到练习室</button>
      </div>
    </div>
  `;

  document.getElementById("retryBtn").addEventListener("click", () => {
    state.answers = {};
    state.startedAt = Date.now();
    renderQuestions();
  });

  document.getElementById("backHomeBtn").addEventListener("click", () => {
    renderIntro();
  });
}

renderIntro();
