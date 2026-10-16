/* Small, ideal-state calculations shared by the articles and their numerical checks. */
((root) => {
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const abs2 = (a) => a[0] * a[0] + a[1] * a[1];
  const s = Math.SQRT1_2;
  const gates = {
    H: [[[s, 0], [s, 0]], [[s, 0], [-s, 0]]],
    X: [[[0, 0], [1, 0]], [[1, 0], [0, 0]]],
    Y: [[[0, 0], [0, -1]], [[0, 1], [0, 0]]],
    Z: [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]],
  };
  const ry = (angle) => {
    const c = Math.cos(angle / 2), s = Math.sin(angle / 2);
    return [[[c, 0], [-s, 0]], [[s, 0], [c, 0]]];
  };
  const gate = (state, matrix) => matrix.map((row) => add(mul(row[0], state[0]), mul(row[1], state[1])));
  const qubit = (theta, phi, gamma = 0) => {
    const phase = [Math.cos(gamma), Math.sin(gamma)];
    return [mul([Math.cos(theta / 2), 0], phase), mul([Math.sin(theta / 2) * Math.cos(phi), Math.sin(theta / 2) * Math.sin(phi)], phase)];
  };
  const bloch = ([a, b]) => ({
    x: 2 * (a[0] * b[0] + a[1] * b[1]),
    y: 2 * (a[0] * b[1] - a[1] * b[0]),
    z: abs2(a) - abs2(b),
  });
  const modTau = (angle) => ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const angles = (state) => {
    const theta = 2 * Math.atan2(Math.sqrt(abs2(state[1])), Math.sqrt(abs2(state[0])));
    const gamma = abs2(state[0]) > 1e-20 ? Math.atan2(state[0][1], state[0][0]) : Math.atan2(state[1][1], state[1][0]);
    const phi = abs2(state[0]) > 1e-20 && abs2(state[1]) > 1e-20 ? Math.atan2(state[1][1], state[1][0]) - gamma : 0;
    return { theta, phi: modTau(phi), gamma: modTau(gamma) };
  };
  const probabilities = (state) => state.map(abs2);
  // Two-qubit strings are |q0 q1>; q0 is the leftmost (most significant) bit.
  const tensor = (a, b) => a.flatMap((x) => b.map((y) => mul(x, y)));
  const cnot = (state) => [state[0], state[1], state[3], state[2]].map((z) => [...z]);
  const hadamardBoth = (state) => Array.from({ length: 4 }, (_, out) => state.reduce((sum, a, input) => {
    const bits = out & input;
    const sign = ((bits & 1) + ((bits >> 1) & 1)) % 2 ? -0.5 : 0.5;
    return add(sum, [sign * a[0], sign * a[1]]);
  }, [0, 0]));
  const jointProbabilities = (kind, basis) => {
    const zero = [[1, 0], [0, 0]], one = [[0, 0], [1, 0]], plus = gate(zero, gates.H);
    const read = (state) => probabilities(basis === 'X' ? hadamardBoth(state) : state);
    if (kind === 'mixture') {
      const a = read(tensor(zero, zero)), b = read(tensor(one, one));
      return a.map((p, i) => (p + b[i]) / 2);
    }
    return read(kind === 'bell' ? cnot(tensor(plus, zero)) : tensor(zero, plus));
  };
  const interference = (phi) => {
    const phase = [[[1, 0], [0, 0]], [[0, 0], [Math.cos(phi), Math.sin(phi)]]];
    return probabilities(gate(gate(gate([[1, 0], [0, 0]], gates.H), phase), gates.H));
  };
  const qnn = (x, theta) => probabilities(gate(gate([[1, 0], [0, 0]], ry(x)), ry(theta)))[1];
  const qnnDerivative = (x, theta) => (qnn(x, theta + Math.PI / 2) - qnn(x, theta - Math.PI / 2)) / 2;
  const trainingData = Array.from({ length: 9 }, (_, i) => {
    const x = -Math.PI + i * Math.PI / 4;
    return { x, y: Math.sin((x + 1.1) / 2) ** 2 };
  });
  const loss = (theta) => trainingData.reduce((sum, d) => sum + (qnn(d.x, theta) - d.y) ** 2, 0) / trainingData.length;
  const lossGradient = (theta) => trainingData.reduce((sum, d) => sum + 2 * (qnn(d.x, theta) - d.y) * qnnDerivative(d.x, theta), 0) / trainingData.length;
  const trainStep = (theta, rate = 0.8) => theta - rate * lossGradient(theta);
  const uniform = (n) => Array(n).fill(1 / Math.sqrt(n));
  const oracle = (amplitudes, target) => amplitudes.map((a, i) => i === target ? -a : a);
  const diffuse = (amplitudes) => {
    const mean = amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length;
    return amplitudes.map((a) => 2 * mean - a);
  };
  const sample = (probs, shots, random = Math.random) => {
    const counts = probs.map(() => 0);
    for (let i = 0; i < shots; i++) {
      const r = random();
      let cumulative = 0, selected = probs.length - 1;
      for (let j = 0; j < probs.length; j++) {
        cumulative += probs[j];
        if (r < cumulative) { selected = j; break; }
      }
      counts[selected]++;
    }
    return counts;
  };
  const api = { gates, gate, ry, qubit, bloch, angles, probabilities, tensor, cnot, hadamardBoth, jointProbabilities, interference, qnn, qnnDerivative, trainingData, loss, lossGradient, trainStep, uniform, oracle, diffuse, sample };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QuantumMath = api;
})(globalThis);
