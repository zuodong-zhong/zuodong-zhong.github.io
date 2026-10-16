const test = require('node:test');
const assert = require('node:assert/strict');
const Q = require('../blog/quantum/quantum-math.js');
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const vectorClose = (actual, expected) => actual.forEach((value, i) => Array.isArray(value) ? vectorClose(value, expected[i]) : close(value, expected[i]));

test('H, X, Y and Z preserve normalization and each undo themselves', () => {
  for (const theta of [0, .3, 1.2, Math.PI]) for (const phi of [0, .7, 4.1]) {
    const state = Q.qubit(theta, phi, .8);
    for (const matrix of Object.values(Q.gates)) {
      const transformed = Q.gate(state, matrix);
      close(Q.probabilities(transformed).reduce((a, b) => a + b), 1);
      vectorClose(Q.gate(transformed, matrix), state);
    }
  }
});

test('Y has the required imaginary phases, and HZH equals X', () => {
  vectorClose(Q.gate(Q.qubit(0, 0), Q.gates.Y), [[0, 0], [0, 1]]);
  const state = Q.qubit(1.2, .7, -.2);
  vectorClose(Q.gate(Q.gate(Q.gate(state, Q.gates.H), Q.gates.Z), Q.gates.H), Q.gate(state, Q.gates.X));
});

test('Bloch coordinates agree with spherical coordinates and ignore global phase', () => {
  for (const theta of [0, .6, Math.PI / 2, Math.PI]) for (const phi of [0, .4, 2.9, 5.5]) for (const gamma of [0, .3, 2.8]) {
    const state = Q.qubit(theta, phi, gamma), b = Q.bloch(state);
    close(b.x, Math.sin(theta) * Math.cos(phi)); close(b.y, Math.sin(theta) * Math.sin(phi)); close(b.z, Math.cos(theta));
    close(b.x ** 2 + b.y ** 2 + b.z ** 2, 1);
    const a = Q.angles(state);
    vectorClose(Q.qubit(a.theta, a.phi, a.gamma), state);
  }
});

test('phase interference reproduces cos²(phi/2) including cancellation at pi', () => {
  for (const phi of [0, .4, Math.PI / 2, Math.PI, 1.8 * Math.PI, 2 * Math.PI]) {
    vectorClose(Q.interference(phi), [Math.cos(phi / 2) ** 2, Math.sin(phi / 2) ** 2]);
  }
});

test('CNOT produces Bell amplitudes with q0 as the leftmost control bit', () => {
  const zero = Q.qubit(0, 0), plus = Q.gate(zero, Q.gates.H);
  vectorClose(Q.cnot(Q.tensor(plus, zero)), [[Math.SQRT1_2, 0], [0, 0], [0, 0], [Math.SQRT1_2, 0]]);
  vectorClose(Q.cnot(Q.tensor(zero, zero)), Q.tensor(zero, zero));
});

test('X-basis measurement distinguishes a Bell state from a classical mixture', () => {
  vectorClose(Q.jointProbabilities('bell', 'Z'), [.5, 0, 0, .5]);
  vectorClose(Q.jointProbabilities('mixture', 'Z'), [.5, 0, 0, .5]);
  vectorClose(Q.jointProbabilities('bell', 'X'), [.5, 0, 0, .5]);
  vectorClose(Q.jointProbabilities('mixture', 'X'), [.25, .25, .25, .25]);
  vectorClose(Q.jointProbabilities('product', 'Z'), [.5, .5, 0, 0]);
  vectorClose(Q.jointProbabilities('product', 'X'), [.5, 0, .5, 0]);
});

test('QNN forward and parameter-shift gradients agree with independent closed forms', () => {
  for (const x of [-2.4, -.7, 0, .9, 2.8]) for (const theta of [-2, -.3, .8, 2.4]) {
    close(Q.qnn(x, theta), Math.sin((x + theta) / 2) ** 2);
    close(Q.qnnDerivative(x, theta), Math.sin(x + theta) / 2);
    const h = 1e-5;
    close(Q.lossGradient(theta), (Q.loss(theta + h) - Q.loss(theta - h)) / (2 * h), 1e-8);
  }
});

test('50 genuine gradient steps reduce the teaching model loss', () => {
  let theta = -.8, previous = Q.loss(theta);
  for (let i = 0; i < 50; i++) {
    theta = Q.trainStep(theta);
    const next = Q.loss(theta);
    assert.ok(next <= previous + 1e-14);
    previous = next;
  }
  assert.ok(Q.loss(theta) < 1e-8);
  close(theta, 1.1, .001);
});

test('Grover matches the independent rotation formula and conserves probability', () => {
  for (const n of [4, 8, 16]) for (const target of [0, 2, n - 1]) {
    let a = Q.uniform(n);
    for (let r = 0; r <= 12; r++) {
      close(a.reduce((sum, x) => sum + x * x, 0), 1);
      close(a[target] ** 2, Math.sin((2 * r + 1) * Math.asin(1 / Math.sqrt(n))) ** 2);
      const marked = Q.oracle(a, target);
      vectorClose(marked.map((x) => x * x), a.map((x) => x * x));
      a = Q.diffuse(marked);
    }
  }
});

test('four-item search reaches certainty, then overshoots back to 25 percent', () => {
  const once = Q.diffuse(Q.oracle(Q.uniform(4), 2));
  vectorClose(once, [0, 0, 1, 0]);
  const twice = Q.diffuse(Q.oracle(once, 2));
  close(twice[2] ** 2, .25);
});

test('sampling respects zero probability, bin boundaries, and total shot count', () => {
  const draws = [0, .1, .4999, .5, .9, .99999];
  let i = 0;
  assert.deepEqual(Q.sample([.5, 0, 0, .5], 6, () => draws[i++]), [3, 0, 0, 3]);
  assert.deepEqual(Q.sample([0, 0, 1, 0], 200), [0, 0, 200, 0]);
});
