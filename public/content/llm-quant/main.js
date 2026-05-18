// ===== LLM Quant Interactive Page - Main JS (Scroll-based) =====

document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  initSideNav();
  initFadeUp();
  initLeaderboard();
  initPipelineViz();
  initCycleViz();
  initRiskCalculator();
  initPromptPlayground();
  initAgentCards();
  initPortfolioViz();
});

/* ===== Progress Bar ===== */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', Math.round(pct));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ===== Side Nav (IntersectionObserver) ===== */
function initSideNav() {
  const nav = document.getElementById('side-nav');
  if (!nav) return;

  const links = nav.querySelectorAll('.side-nav-link');
  const sectionIds = Array.from(links).map(l => l.dataset.section);
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => {
            l.classList.toggle('active', l.dataset.section === id);
          });
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  );

  sections.forEach(s => observer.observe(s));
}

/* ===== Fade-up Scroll Animations ===== */
function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (els.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
  );

  els.forEach(el => observer.observe(el));
}

/* ===== Leaderboard Bar Animation ===== */
function initLeaderboard() {
  const bars = document.querySelectorAll('.lb-bar[data-width]');
  if (bars.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const w = bar.dataset.width;
          setTimeout(() => { bar.style.width = w + '%'; }, 200);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(b => observer.observe(b));
}

/* ===== Pipeline Visualization ===== */
function initPipelineViz() {
  const stages = document.querySelectorAll('.pipeline-stage');
  const detail = document.getElementById('pipeline-detail');
  if (stages.length === 0 || !detail) return;

  const stageInfo = {
    fetch: `<strong style="color:var(--accent)">Stage 1: 数据采集</strong><br><br>` +
      `系统并行调用多个 API 获取原始数据：<br>` +
      `<code>Hyperliquid Info API</code> → 当前价格、24h涨跌幅、24h成交量、资金费率<br>` +
      `<code>Hyperliquid User State API</code> → 当前持仓、账户余额、保证金率<br>` +
      `<code>Candle API</code> → 近期 K 线数据 (OHLCV)<br>` +
      `<code>本地数据库</code> → 最近 10-20 条交易记录<br><br>` +
      `原始数据量约 5-10KB，包含大量 LLM 不需要的底层字段。`,

    clean: `<strong style="color:var(--accent2)">Stage 2: 清洗压缩</strong><br><br>` +
      `原始数据被清洗、压缩为 LLM 可理解的人类可读文本：<br>` +
      `• <code>数值格式化</code>: volume 45200000000 → "45.2B"<br>` +
      `• <code>K 线聚合</code>: 100+ 条 1h K 线 → 24 条关键数据点 + 技术指标摘要<br>` +
      `• <code>技术指标计算</code>: 从 K 线计算 RSI(14)、MACD、布林带位置<br>` +
      `• <code>持仓摘要</code>: 多个持仓 → 简洁列表 (方向/仓位/盈亏%)<br>` +
      `• <code>历史精选</code>: 50 条记录 → 最近 5 条 + 累计统计<br><br>` +
      `压缩后数据约 1-2KB，Token 消耗约 500-800 Token。`,

    inject: `<strong style="color:var(--accent3)">Stage 3: Prompt 组装</strong><br><br>` +
      `清洗后的数据被注入 Prompt 模板的 4 个层级：<br>` +
      `<code>Layer 1</code> · 角色定义 — "你是专业交易员，风险偏好中等偏保守"<br>` +
      `<code>Layer 2</code> · 市场数据 — 来自 Stage 2 的行情快照 + 技术指标<br>` +
      `<code>Layer 3</code> · 记忆注入 — 最近交易记录 + 累计统计 + 上次决策理由<br>` +
      `<code>Layer 4</code> · 输出约束 — JSON Schema + 风控规则 (仓位≤30%, 风险≤2%)<br><br>` +
      `完整 Prompt 约 1500-2500 Token，在大多数模型的上下文窗口内。`,

    llm: `<strong style="color:var(--accent5)">Stage 4: LLM 推理</strong><br><br>` +
      `组装好的 Prompt 被发送给 LLM API：<br>` +
      `<code>模型选择</code>: Qwen3-Max / DeepSeek / GPT-5 / Claude / Gemini / Grok<br>` +
      `<code>推理延迟</code>: 2-10 秒 (取决于模型大小和 API 负载)<br>` +
      `<code>输出格式</code>: JSON 对象，包含 action/symbol/direction/position_size_pct/stop_loss/take_profit/reasoning<br>` +
      `<code>异常处理</code>: JSON 解析失败 → 重试 (最多 3 次) → 兜底策略 (hold)<br><br>` +
      `LLM 的 reasoning 字段是可追溯的决策逻辑，用于事后复盘。`
  };

  stages.forEach(stage => {
    stage.addEventListener('click', () => {
      const key = stage.dataset.stage;
      stages.forEach(s => s.classList.remove('active'));
      stage.classList.add('active');
      detail.innerHTML = stageInfo[key] || '点击阶段查看详情...';
    });
  });
}

/* ===== Cycle Viz ===== */
function initCycleViz() {
  const ring = document.getElementById('cycle-ring');
  const detail = document.getElementById('cycle-detail');
  if (!ring || !detail) return;

  const cycleInfo = {
    receive: '<strong>📥 数据接收</strong><br>系统从 Hyperliquid API 获取实时行情、K 线数据、持仓状态。所有数据被序列化为结构化文本，准备注入 Prompt。这是决策循环的起点——数据质量直接决定决策上限。',
    analyze: '<strong>🧠 LLM 分析</strong><br>组装好的 Prompt 被发送给 LLM。模型基于角色定义、市场数据、风险规则进行推理，生成包含交易决策的文本输出。这一步的延迟通常为 2-10 秒。',
    output: '<strong>📋 JSON 输出</strong><br>LLM 的文本输出被解析为 JSON 对象。系统需要处理各种异常：夹带解释文本、字段缺失、非法值。鲁棒的解析器是系统稳定性的基础。',
    execute: '<strong>🚀 自动执行</strong><br>通过 Hyperliquid SDK 将校验通过的决策转化为链上交易。开仓、平仓、设置止损止盈——全部自动化，无需人类确认。执行前必须通过风控硬校验。',
    record: '<strong>📊 记录</strong><br>交易结果被记录到数据库，包括决策理由、执行价格、盈亏结果。这些记录将在下一个决策周期被注入 Prompt，形成反思闭环。',
    update: '<strong>🔄 状态更新</strong><br>系统更新持仓状态、账户余额、保证金率。如果触发止损或止盈，相应仓位被平掉。然后等待下一个决策周期开始，循环往复。'
  };

  const nodes = ring.querySelectorAll('.cycle-node');
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const key = node.dataset.cycle;
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      detail.innerHTML = cycleInfo[key] || '点击节点查看详情...';
    });
  });
}

/* ===== Risk Calculator ===== */
function initRiskCalculator() {
  const posSize = document.getElementById('pos-size');
  const leverage = document.getElementById('leverage');
  const stopDist = document.getElementById('stop-dist');
  if (!posSize || !leverage || !stopDist) return;

  function calc() {
    const pos = parseFloat(posSize.value);
    const lev = parseFloat(leverage.value);
    const stop = parseFloat(stopDist.value);

    // Update display values
    document.getElementById('pos-size-val').textContent = pos + '%';
    document.getElementById('leverage-val').textContent = lev + 'x';
    document.getElementById('stop-dist-val').textContent = stop + '%';

    // Max loss = position_size * leverage * stop_distance
    const maxLoss = pos * lev * stop / 100;
    const maxLossEl = document.getElementById('max-loss');
    maxLossEl.textContent = '-' + maxLoss.toFixed(1) + '%';
    maxLossEl.style.color = maxLoss > 20 ? 'var(--red)' : maxLoss > 10 ? 'var(--yellow)' : 'var(--red)';

    // Liquidation distance = 1 / leverage * 100
    const liqDist = (1 / lev * 100).toFixed(1);
    const liqEl = document.getElementById('liq-price');
    liqEl.textContent = '-' + liqDist + '%';
    liqEl.style.color = parseFloat(liqDist) < 5 ? 'var(--red)' : 'var(--yellow)';

    // Risk-reward ratio (assume 1.5:1 target)
    const rr = (1.5 * stop / stop).toFixed(1);
    document.getElementById('risk-reward').textContent = '1:' + rr;

    // Risk per trade
    const riskPct = (pos * stop / 100).toFixed(1);
    const riskPctEl = document.getElementById('risk-pct');
    riskPctEl.textContent = riskPct + '%';
    riskPctEl.style.color = riskPct > 2 ? 'var(--red)' : 'var(--accent)';

    // Compliance check
    const compEl = document.getElementById('compliance');
    const violations = [];
    if (pos > 30) violations.push('仓位超限');
    if (riskPct > 2) violations.push('单笔风险超限');
    if (maxLoss > 30) violations.push('最大亏损过高');
    if (violations.length === 0) {
      compEl.textContent = '✅ 合规';
      compEl.style.color = 'var(--green)';
    } else {
      compEl.textContent = '❌ ' + violations.join('、');
      compEl.style.color = 'var(--red)';
    }
  }

  posSize.addEventListener('input', calc);
  leverage.addEventListener('input', calc);
  stopDist.addEventListener('input', calc);
  calc();
}

/* ===== Prompt Playground ===== */
function initPromptPlayground() {
  const editor = document.getElementById('prompt-editor');
  const output = document.getElementById('prompt-output');
  const runBtn = document.getElementById('run-prompt-btn');
  const resetBtn = document.getElementById('reset-prompt-btn');
  if (!editor || !output || !runBtn) return;

  const defaultPrompt = editor.value;

  // Simulated LLM outputs based on prompt content
  const simulations = [
    {
      action: 'open',
      symbol: 'ETH',
      direction: 'long',
      position_size_pct: 15,
      stop_loss: 3580,
      take_profit: 3780,
      leverage: 10,
      reasoning: 'ETH 突破 3640 阻力位，24h 涨幅 +1.8%，成交量放大。BTC 强势带动 ETH 跟涨。止损设 3580 (前低支撑)，止盈 3780 (前期高点)。仓位 15%，风险可控。'
    },
    {
      action: 'hold',
      symbol: 'BTC',
      direction: 'long',
      position_size_pct: 0,
      stop_loss: 96000,
      take_profit: 105000,
      leverage: 10,
      reasoning: 'BTC 当前持仓盈利 +0.7%，趋势尚未走完但短期有回调压力。维持当前仓位，止损下移至 96000 锁定部分利润。'
    },
    {
      action: 'open',
      symbol: 'SOL',
      direction: 'short',
      position_size_pct: 10,
      stop_loss: 192,
      take_profit: 175,
      leverage: 10,
      reasoning: 'SOL 24h 跌 -0.5%，跌破 186 支撑后可能加速下行。做空至 175，止损 192。仓位 10%，风险 1.2%。'
    }
  ];

  runBtn.addEventListener('click', () => {
    // Pick a simulation based on prompt content
    let sim;
    const text = editor.value.toLowerCase();
    if (text.includes('保守') || text.includes('风险厌恶')) {
      sim = simulations[1]; // hold
    } else if (text.includes('激进') || text.includes('高风险')) {
      sim = simulations[2]; // short
    } else {
      sim = simulations[Math.floor(Math.random() * simulations.length)];
    }

    // Animate output
    output.innerHTML = '<span style="color:var(--accent)">⏳ LLM 推理中...</span>';
    setTimeout(() => {
      const json = JSON.stringify(sim, null, 2);
      output.innerHTML = '<span style="color:var(--accent3)">✅ 决策输出：</span>\n' +
        json.replace(/"([^"]+)":/g, '<span style="color:#82aaff">"$1"</span>:')
            .replace(/: "([^"]+)"/g, ': <span style="color:#c3e88d">"$1"</span>')
            .replace(/: (\d+\.?\d*)/g, ': <span style="color:#f78c6c">$1</span>');
    }, 800);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      editor.value = defaultPrompt;
      output.innerHTML = '<span style="color:var(--text-muted)">点击"模拟输出"查看 LLM 决策结果...</span>';
    });
  }
}

/* ===== Agent Cards ===== */
function initAgentCards() {
  const grid = document.getElementById('agent-grid');
  const detail = document.getElementById('agent-detail');
  const detailContent = document.getElementById('agent-detail-content');
  if (!grid || !detail || !detailContent) return;

  const agentInfo = {
    analyst: '<h4 style="margin-bottom:8px">📊 Market Analyst</h4><p style="color:var(--text-dim);font-size:0.88rem">负责技术面和基本面分析。读取 K 线数据、技术指标（RSI、MACD、布林带）、财务报表、新闻摘要。输出结构化的市场分析报告，包含趋势判断、支撑阻力位、信号强度评估。</p><p style="color:var(--text-dim);font-size:0.82rem;margin-top:8px"><strong>数据源</strong>：行情 API、财务数据 API、新闻 API</p>',
    risk: '<h4 style="margin-bottom:8px">🛡️ Risk Manager</h4><p style="color:var(--text-dim);font-size:0.88rem">独立的风险评估 Agent。接收 Analyst 的分析报告，评估当前市场风险水平、仓位风险、相关性风险。有权<strong>否决</strong>任何交易决策。计算最优仓位大小和止损位置。</p><p style="color:var(--text-dim);font-size:0.82rem;margin-top:8px"><strong>否决条件</strong>：单笔风险 >2%、总仓位 >30%、相关性过高、市场极端波动</p>',
    portfolio: '<h4 style="margin-bottom:8px">🎯 Portfolio Manager</h4><p style="color:var(--text-dim);font-size:0.88rem">最终决策者。综合 Analyst 的分析报告和 Risk Manager 的风险评估，做出最终投资决策。考虑投资组合整体配置、跨资产相关性、资金利用率。输出最终交易指令。</p><p style="color:var(--text-dim);font-size:0.82rem;margin-top:8px"><strong>决策模式</strong>：综合评分 + 阈值判断</p>',
    trader: '<h4 style="margin-bottom:8px">⚡ Trader</h4><p style="color:var(--text-dim);font-size:0.88rem">执行层 Agent。接收 Portfolio Manager 的交易指令，通过交易所 API 执行下单、平仓、设置止损止盈。处理滑点、部分成交、网络异常等执行层面的问题。</p><p style="color:var(--text-dim);font-size:0.82rem;margin-top:8px"><strong>执行保障</strong>：重试机制、超时处理、成交确认</p>'
  };

  const cards = grid.querySelectorAll('.agent-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.agent;
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      detail.style.display = 'block';
      detailContent.innerHTML = agentInfo[key] || '';
    });
  });
}

/* ===== Portfolio Visualization ===== */
function initPortfolioViz() {
  const container = document.getElementById('portfolio-chart');
  if (!container) return;

  // Season 1 approximate equity curves (normalized to 100 = start)
  const curves = {
    'Qwen3-Max':   [100,102,101,104,106,108,107,110,112,114,113,116,118,120,119,122,121,124,126,128,127,130,129,132,134,136,135,138,140,142,141,144,143,146,148,150,149,152,151,154,156,158,157,160,162,164,163,166,168,170,169,172,174,176,175,178,180,182,181,184,186,188,187,190,192,194,193,196,198,200,199,202,204,206,205,208,210,212,211,214,216,218,217,220,222,224],
    'DeepSeek':    [100,101,100,102,103,104,103,105,106,107,106,108,107,109,110,108,107,109,110,111,109,108,110,111,112,110,109,111,112,113,111,110,112,113,114,112,111,113,114,115,113,112,114,115,116,114,113,115,116,117,115,114,116,117,118,116,115,117,118,119,117,116,118,119,120,118,117,119,120,121,119,118,120,121,122,120,119,121,122,123,121,120,122,123,124,122,121,123,124,125],
    'Claude':      [100,98,96,94,92,90,88,86,84,82,80,78,76,74,72,70,68,66,64,62,60,58,56,54,52,50,48,46,44,42,40,38,36,34,32,30,28,26,24,22,20,18,16,14,12,10,8,6,4,2,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69],
    'Grok':        [100,97,94,91,88,85,82,79,76,73,70,67,64,61,58,55,52,49,46,43,40,37,34,31,28,25,22,19,16,13,10,7,4,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55],
    'Gemini':      [100,96,92,88,84,80,76,72,68,64,60,56,52,48,44,40,36,32,28,24,20,16,12,8,4,2,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43],
    'GPT-5':       [100,95,90,85,80,75,70,65,60,55,50,45,40,35,30,25,20,15,10,5,2,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37]
  };

  const colors = {
    'Qwen3-Max': '#22c55e',
    'DeepSeek': '#34d399',
    'Claude': '#ef4444',
    'Grok': '#fb923c',
    'Gemini': '#a78bfa',
    'GPT-5': '#f472b6'
  };

  // Normalize all curves to same length
  const maxLen = Math.max(...Object.values(curves).map(c => c.length));
  const numBars = 60;

  // Create bars for each time step
  for (let i = 0; i < numBars; i++) {
    const dataIdx = Math.floor(i * (maxLen - 1) / (numBars - 1));
    const bar = document.createElement('div');
    bar.className = 'portfolio-bar';
    bar.style.flex = '1';

    // Use Qwen as reference for height (best performer)
    const qwenVal = curves['Qwen3-Max'][Math.min(dataIdx, curves['Qwen3-Max'].length - 1)];
    const heightPct = Math.max(4, (qwenVal / 225) * 100);
    bar.style.height = heightPct + '%';
    bar.style.background = `linear-gradient(to top, ${colors['Qwen3-Max']}88, ${colors['Qwen3-Max']}44)`;

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    const day = Math.round(i * 30 / numBars);
    tooltip.textContent = `Day ${day}`;
    bar.appendChild(tooltip);

    container.appendChild(bar);
  }

  // Animate bars on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bars = container.querySelectorAll('.portfolio-bar');
          bars.forEach((bar, i) => {
            bar.style.height = '0%';
            setTimeout(() => {
              const dataIdx = Math.floor(i * (maxLen - 1) / (numBars - 1));
              const qwenVal = curves['Qwen3-Max'][Math.min(dataIdx, curves['Qwen3-Max'].length - 1)];
              const heightPct = Math.max(4, (qwenVal / 225) * 100);
              bar.style.height = heightPct + '%';
            }, i * 15);
          });
          observer.unobserve(container);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(container);
}
