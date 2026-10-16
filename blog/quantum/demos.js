(() => {
  const Q = globalThis.QuantumMath;
  if (!Q) return;
  const $ = (root, key) => root.querySelector(`[data-q="${key}"]`);
  const put = (root, key, value) => { const node = $(root, key); if (node) node.textContent = value; };
  const number = (x, digits = 3) => (Math.abs(x) < 0.5 * 10 ** -digits ? 0 : x).toFixed(digits);
  const percent = (x) => `${number(Math.min(1, Math.max(0, x)) * 100, 1)}%`;
  const rad = (deg) => deg * Math.PI / 180;
  const deg = (angle) => angle * 180 / Math.PI;
  const on = (root, key, event, fn) => $(root, key).addEventListener(event, fn);
  const bar = (root, key, p) => {
    put(root, `${key}-value`, percent(p));
    $(root, `${key}-bar`).style.width = percent(p);
  };
  const complex = ([real, imag]) => `${number(real)} ${imag < -0.0005 ? '−' : '+'} ${number(Math.abs(imag))}i`;
  const line = (node, start, end) => ['x1', 'y1', 'x2', 'y2'].forEach((key, i) => node.setAttribute(key, [...start, ...end][i]));

  function initBloch(root) {
    let state = Q.qubit(rad(60), rad(135));
    const project = (x, y, z) => [165 + 112 * (-Math.SQRT1_2 * x + Math.SQRT1_2 * y), 155 + 112 * (Math.SQRT1_2 / 2 * (x + y) - Math.sqrt(3) / 2 * z)];
    function render(syncSliders = false) {
      const b = Q.bloch(state), a = Q.angles(state);
      if (syncSliders) for (const key of ['theta', 'phi', 'gamma']) $(root, key).value = deg(a[key]);
      for (const key of ['theta', 'phi', 'gamma']) put(root, `${key}-value`, `${number(Number($(root, key).value), 1)}°`);
      const endpoint = project(b.x, b.y, b.z), ground = project(b.x, b.y, 0);
      line($(root, 'vector'), [165, 155], endpoint);
      line($(root, 'projection'), endpoint, ground);
      $(root, 'point').setAttribute('cx', endpoint[0]);
      $(root, 'point').setAttribute('cy', endpoint[1]);
      put(root, 'state', `(${complex(state[0])}) |0⟩ + (${complex(state[1])}) |1⟩`);
      for (const key of ['x', 'y', 'z']) put(root, key, number(b[key]));
      for (const [key, value] of [['z0', b.z], ['xp', b.x], ['yp', b.y]]) bar(root, key, (1 + value) / 2);
      put(root, 'sphere-description', `布洛赫向量坐标 x=${number(b.x)}，y=${number(b.y)}，z=${number(b.z)}。Z 基测到 0 的概率为 ${percent((1 + b.z) / 2)}。`);
    }
    for (const key of ['theta', 'phi', 'gamma']) on(root, key, 'input', () => {
      state = Q.qubit(rad(Number($(root, 'theta').value)), rad(Number($(root, 'phi').value)), rad(Number($(root, 'gamma').value)));
      put(root, 'feedback', '改变整体相位 γ 只会改变振幅的表示，球上位置和所有测量概率保持不变。');
      render();
    });
    root.querySelectorAll('[data-gate]').forEach((button) => button.addEventListener('click', () => {
      state = Q.gate(state, Q.gates[button.dataset.gate]);
      render(true);
      put(root, 'feedback', `已施加 ${button.dataset.gate} 门。可以连续施加两个 H 门，观察是否回到原状态。`);
    }));
    on(root, 'reset', 'click', () => { state = Q.qubit(0, 0); render(true); put(root, 'feedback', '已重置到 |0⟩，试试 H → Z → H。'); });
    render();
  }

  function initInterference(root) {
    function render() {
      const phi = rad(Number($(root, 'phase').value));
      const probs = Q.interference(phi);
      const origin = [90, 143], first = [175, 143], end = [175 + 85 * Math.cos(phi), 143 - 85 * Math.sin(phi)];
      line($(root, 'phasor-two'), first, end);
      line($(root, 'phasor-sum'), origin, end);
      $(root, 'phasor-point').setAttribute('cx', end[0]);
      $(root, 'phasor-point').setAttribute('cy', end[1]);
      put(root, 'phase-value', `${number(deg(phi), 0)}°`);
      bar(root, 'p0', probs[0]); bar(root, 'p1', probs[1]);
      put(root, 'sum', `A(0) = ${number((1 + Math.cos(phi)) / 2)} ${Math.sin(phi) < -1e-8 ? '−' : '+'} ${number(Math.abs(Math.sin(phi)) / 2)}i`);
      put(root, 'feedback', probs[0] > .9999 ? '两条路径同相，结果 0 的振幅完全增强。' : probs[0] < .0001 ? '两条路径反相，结果 0 的振幅完全抵消；结果 1 的概率为 100%。' : '先把复振幅相加，再取模长平方；两条路径各自的概率没有变化。');
    }
    on(root, 'phase', 'input', render);
    on(root, 'phase-zero', 'click', () => { $(root, 'phase').value = 0; render(); });
    on(root, 'phase-pi', 'click', () => { $(root, 'phase').value = 180; render(); });
    render();
  }

  function initEntanglement(root) {
    let counts = [0, 0, 0, 0], shots = 0;
    const probs = () => Q.jointProbabilities($(root, 'kind').value, $(root, 'basis').value);
    function render() {
      const basis = $(root, 'basis').value, kind = $(root, 'kind').value;
      probs().forEach((p, i) => {
        const label = basis === 'Z' ? i.toString(2).padStart(2, '0') : ['++', '+−', '−+', '−−'][i];
        put(root, `label-${i}`, label);
        bar(root, `joint-${i}`, p);
        put(root, `count-${i}`, shots ? `${counts[i]} / ${shots}` : '—');
      });
      put(root, 'joint-note', kind === 'bell' ? 'Bell 态在 Z 基和 X 基下都只出现相同的两个结果。单个 qubit 的结果仍然各占 50%。' : kind === 'mixture' ? '经典混合在 Z 基下也完全相关；切换到 X 基后四种结果各占 25%，可与这个 Bell 态区分。' : '这是乘积态 |0⟩ ⊗ |+⟩：Z 基下第一个结果固定，X 基下第二个结果固定。');
      put(root, 'feedback', shots ? `累计 ${shots} 次独立制备和测量。统计频率会有随机波动。` : '选择状态与测量基，再对独立制备的电路采样。');
    }
    function reset() { counts = [0, 0, 0, 0]; shots = 0; render(); }
    on(root, 'kind', 'change', reset); on(root, 'basis', 'change', reset);
    on(root, 'sample', 'click', () => { const next = Q.sample(probs(), 200); counts = counts.map((c, i) => c + next[i]); shots += 200; render(); });
    on(root, 'clear', 'click', reset);
    render();
  }

  function initQnn(root) {
    let theta = -0.8, steps = 0;
    const path = (fn) => Array.from({ length: 121 }, (_, i) => {
      const x = -Math.PI + i * Math.PI / 60;
      return `${i ? 'L' : 'M'}${42 + 496 * i / 120},${200 - 160 * fn(x)}`;
    }).join(' ');
    function render() {
      const x = Number($(root, 'input').value);
      const p = Q.qnn(x, theta);
      put(root, 'input-value', `${number(x, 2)} rad`);
      put(root, 'weight-value', `${number(theta, 3)} rad`);
      put(root, 'theta', number(theta));
      put(root, 'loss', number(Q.loss(theta), 5));
      put(root, 'steps', steps);
      put(root, 'gradient', number(Q.lossGradient(theta), 5));
      bar(root, 'prediction', p);
      $(root, 'curve').setAttribute('d', path((x) => Q.qnn(x, theta)));
      $(root, 'input-dot').setAttribute('cx', 42 + (x + Math.PI) / (2 * Math.PI) * 496);
      $(root, 'input-dot').setAttribute('cy', 200 - p * 160);
      put(root, 'curve-description', `蓝线是当前模型，橙色圆点是 9 个训练样本。当前均方误差 ${number(Q.loss(theta), 5)}，参数 θ=${number(theta)}。`);
    }
    function train(n) {
      for (let i = 0; i < n; i++) theta = Q.trainStep(theta);
      steps += n;
      $(root, 'weight').value = theta;
      render();
      put(root, 'feedback', `已完成 ${steps} 步梯度下降，学习率 η = 0.8。曲线和误差由当前电路重新计算。`);
    }
    on(root, 'input', 'input', render);
    on(root, 'weight', 'input', () => { theta = Number($(root, 'weight').value); steps = 0; render(); put(root, 'feedback', '手动修改了参数；训练步数已清零。'); });
    on(root, 'step', 'click', () => train(1)); on(root, 'train', 'click', () => train(50));
    on(root, 'reset', 'click', () => { theta = -.8; steps = 0; $(root, 'weight').value = theta; $(root, 'input').value = .7; render(); put(root, 'feedback', '已恢复初始参数 θ = −0.8。'); });
    render();
  }

  function initGrover(root) {
    let amplitudes, iterations = 0, nextOracle = true;
    const target = () => Number($(root, 'target').value);
    const bits = (i) => i.toString(2).padStart(Math.log2(amplitudes.length), '0');
    function render() {
      const n = amplitudes.length, mean = amplitudes.reduce((a, b) => a + b, 0) / n;
      put(root, 'iterations', iterations);
      put(root, 'success', percent(amplitudes[target()] ** 2));
      put(root, 'mean', number(mean));
      const firstPeak = Math.round(Math.PI / (4 * Math.asin(1 / Math.sqrt(n))) - 0.5);
      put(root, 'optimal', `单个答案、${n} 个候选：首次峰值附近为 ${firstPeak} 次迭代。`);
      put(root, 'next', nextOracle ? '下一步：Oracle 标记' : '下一步：Diffusion 放大');
      root.querySelectorAll('[data-stage]').forEach((node) => {
        const active = node.dataset.stage === (!nextOracle ? 'oracle' : iterations ? 'diffusion' : 'initial');
        if (active) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current');
      });
      // Labels and attributes below only contain locally computed numbers and fixed text.
      $(root, 'rows').innerHTML = amplitudes.map((a, i) => `<tr${i === target() ? ' class="q-marked"' : ''}><td>${bits(i)}${i === target() ? ' ★' : ''}</td><td>${number(a)}<span class="q-amplitude" aria-hidden="true"><span class="${a < 0 ? 'negative' : ''}" style="left:${a < 0 ? 50 - Math.abs(a) * 50 : 50}%;width:${Math.abs(a) * 50}%"></span></span></td><td>${percent(a * a)}<div class="q-track" aria-hidden="true"><span style="width:${percent(a * a)}"></span></div></td></tr>`).join('');
    }
    function reset(rebuildTargets = false) {
      const n = Number($(root, 'size').value);
      if (rebuildTargets) {
        const previous = Math.min(target(), n - 1);
        $(root, 'target').innerHTML = Array.from({ length: n }, (_, i) => `<option value="${i}">${i.toString(2).padStart(Math.log2(n), '0')}</option>`).join('');
        $(root, 'target').value = previous;
      }
      amplitudes = Q.uniform(n); iterations = 0; nextOracle = true;
      render(); put(root, 'feedback', '已制备均匀叠加态。先观察 Oracle 是否改变测量概率。'); put(root, 'samples', '');
    }
    on(root, 'size', 'change', () => reset(true)); on(root, 'target', 'change', () => reset());
    on(root, 'reset', 'click', () => reset());
    on(root, 'next', 'click', () => {
      if (nextOracle) {
        amplitudes = Q.oracle(amplitudes, target());
        put(root, 'feedback', 'Oracle 只翻转正确候选的振幅符号。所有测量概率保持不变。');
      } else {
        amplitudes = Q.diffuse(amplitudes); iterations++;
        put(root, 'feedback', `完成第 ${iterations} 次迭代：每个振幅都以均值为中心反射。继续迭代不一定提高成功率。`);
      }
      nextOracle = !nextOracle; put(root, 'samples', ''); render();
    });
    on(root, 'sample', 'click', () => {
      const counts = Q.sample(amplitudes.map((a) => a * a), 200);
      put(root, 'samples', `独立运行并测量 200 次：${counts[target()]} 次得到 ${bits(target())}。理论成功率 ${percent(amplitudes[target()] ** 2)}。`);
    });
    reset();
  }
  const initializers = { bloch: initBloch, interference: initInterference, entanglement: initEntanglement, qnn: initQnn, grover: initGrover };
  document.querySelectorAll('[data-quantum-demo]').forEach((root) => {
    const initialize = initializers[root.dataset.quantumDemo];
    if (!initialize) return;
    initialize(root);
    root.querySelectorAll('fieldset').forEach((fieldset) => { fieldset.disabled = false; });
  });
})();
