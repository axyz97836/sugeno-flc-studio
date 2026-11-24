import test from 'node:test';
import assert from 'node:assert/strict';
import { presets } from '../src/data/presets.js';
import {
  evaluateMF,
  runSugenoPipeline,
} from '../src/engine/sugeno.js';

function approxEqual(actual, expected, tolerance = 1e-4, msg = '') {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff <= tolerance,
    `${msg} Expected ${expected} ± ${tolerance}, received ${actual} (diff: ${diff})`
  );
}

// ─────────────────────────────────────────────────────────────
// 1.a Restaurant Tipping with Food 4.0 and Service 7.0
// ─────────────────────────────────────────────────────────────
test('Restaurant Tipping with Food 4.0 and Service 7.0 hand calculation', () => {
  const tippingPreset = presets.find((p) => p.id === 'tipping');
  assert.ok(tippingPreset, 'tipping preset exists');

  const foodMF = tippingPreset.inputs[0].membershipFunctions;
  const serviceMF = tippingPreset.inputs[1].membershipFunctions;

  // Membership degrees
  const foodPoor = evaluateMF(4.0, foodMF.find((m) => m.name === 'Poor'));
  const foodAverage = evaluateMF(4.0, foodMF.find((m) => m.name === 'Average'));
  const foodGood = evaluateMF(4.0, foodMF.find((m) => m.name === 'Good'));

  const servicePoor = evaluateMF(7.0, serviceMF.find((m) => m.name === 'Poor'));
  const serviceAverage = evaluateMF(7.0, serviceMF.find((m) => m.name === 'Average'));
  const serviceExcellent = evaluateMF(7.0, serviceMF.find((m) => m.name === 'Excellent'));

  // Tolerances: 1e-4
  approxEqual(foodPoor, 1 / 3, 1e-4, 'Food Poor at 4.0');
  approxEqual(foodAverage, 2 / 3, 1e-4, 'Food Average at 4.0');
  approxEqual(foodGood, 0.0, 1e-4, 'Food Good at 4.0');

  approxEqual(servicePoor, 0.0, 1e-4, 'Service Poor at 7.0');
  approxEqual(serviceAverage, 1 / 3, 1e-4, 'Service Average at 7.0');
  approxEqual(serviceExcellent, 2 / 3, 1e-4, 'Service Excellent at 7.0');

  // Full pipeline execution
  const pipeline = runSugenoPipeline(tippingPreset, [4.0, 7.0]);
  const activeRules = pipeline.evaluatedRules.filter((r) => r.firingStrength > 0);

  // Exactly four active rules
  assert.strictEqual(activeRules.length, 4, 'Four rules should fire');

  // Rule 2: Poor & Average -> consequent 10, weight min(1/3, 1/3) = 1/3
  const r2 = activeRules.find(
    (r) => r.antecedents[0] === 'Poor' && r.antecedents[1] === 'Average'
  );
  assert.ok(r2);
  approxEqual(r2.firingStrength, 1 / 3, 1e-4, 'R2 firing strength');
  assert.strictEqual(r2.consequent, 10, 'R2 consequent');

  // Rule 3: Poor & Excellent -> consequent 10, weight min(1/3, 2/3) = 1/3
  const r3 = activeRules.find(
    (r) => r.antecedents[0] === 'Poor' && r.antecedents[1] === 'Excellent'
  );
  assert.ok(r3);
  approxEqual(r3.firingStrength, 1 / 3, 1e-4, 'R3 firing strength');
  assert.strictEqual(r3.consequent, 10, 'R3 consequent');

  // Rule 5: Average & Average -> consequent 15, weight min(2/3, 1/3) = 1/3
  const r5 = activeRules.find(
    (r) => r.antecedents[0] === 'Average' && r.antecedents[1] === 'Average'
  );
  assert.ok(r5);
  approxEqual(r5.firingStrength, 1 / 3, 1e-4, 'R5 firing strength');
  assert.strictEqual(r5.consequent, 15, 'R5 consequent');

  // Rule 6: Average & Excellent -> consequent 20, weight min(2/3, 2/3) = 2/3
  const r6 = activeRules.find(
    (r) => r.antecedents[0] === 'Average' && r.antecedents[1] === 'Excellent'
  );
  assert.ok(r6);
  approxEqual(r6.firingStrength, 2 / 3, 1e-4, 'R6 firing strength');
  assert.strictEqual(r6.consequent, 20, 'R6 consequent');

  // Sum of w * z = (1/3)*10 + (1/3)*10 + (1/3)*15 + (2/3)*20 = 75/3 = 25.0
  const expectedSumWz = 25.0;
  approxEqual(pipeline.result.numerator, expectedSumWz, 1e-4, 'Sum of w * z');

  // Sum of w = 1/3 + 1/3 + 1/3 + 2/3 = 5/3 = 1.6666666667
  const expectedSumW = 5 / 3;
  approxEqual(pipeline.result.denominator, expectedSumW, 1e-4, 'Sum of w');

  // Crisp output z* = 25.0 / (5/3) = 15.0000000000 (tolerance 1e-9)
  const expectedZ = 15.0;
  approxEqual(pipeline.result.output, expectedZ, 1e-9, 'Defuzzified output z*');
});

// ─────────────────────────────────────────────────────────────
// 1.b No-rule-fires case across presets
// ─────────────────────────────────────────────────────────────
test('No-rule-fires case: within preset ranges all inputs fire; out-of-bounds returns 0 without NaN/Infinity', () => {
  // Grid search to confirm that within normal ranges, all inputs fire (no zero-weight points exist)
  for (const p of presets) {
    const [in1, in2] = p.inputs;
    const step1 = (in1.range[1] - in1.range[0]) / 25;
    const step2 = (in2.range[1] - in2.range[0]) / 25;
    for (let x = in1.range[0]; x <= in1.range[1]; x += step1) {
      for (let y = in2.range[0]; y <= in2.range[1]; y += step2) {
        const res = runSugenoPipeline(p, [x, y]);
        assert.ok(
          res.result.denominator > 0,
          `Preset ${p.name} at [${x}, ${y}] within range has non-zero total weight`
        );
      }
    }
  }

  // Where total weight is 0 (inputs placed beyond any membership function support),
  // assert the engine handles denominator === 0 cleanly by returning 0 (no NaN, no Infinity).
  for (const p of presets) {
    const farOutOfBounds = [p.inputs[0].range[0] - 100, p.inputs[1].range[1] + 100];
    const pipeline = runSugenoPipeline(p, farOutOfBounds);

    // Assert current behavior: output 0, no NaN, no Infinity
    // The UI must present it as "no rule fires" (see DefuzzView.jsx empty state).
    assert.strictEqual(pipeline.result.denominator, 0, 'Denominator is 0 when no rules fire');
    assert.strictEqual(pipeline.result.numerator, 0, 'Numerator is 0 when no rules fire');
    assert.strictEqual(pipeline.result.output, 0, 'Output is 0 when no rules fire');
    assert.ok(!Number.isNaN(pipeline.result.output), 'Output must not be NaN');
    assert.ok(Number.isFinite(pipeline.result.output), 'Output must be finite');
  }
});

// ─────────────────────────────────────────────────────────────
// 1.c One hand-checked case per other preset
// ─────────────────────────────────────────────────────────────
test('AC Temperature Controller hand-checked case (Error = 2.0, Rate = 1.0)', () => {
  const acPreset = presets.find((p) => p.id === 'ac-controller');
  assert.ok(acPreset);

  const errorMF = acPreset.inputs[0].membershipFunctions;
  const rateMF = acPreset.inputs[1].membershipFunctions;

  // Temperature Error = 2.0:
  // Negative [-10, -10, -5, 0]: 0
  // Zero [-4, 0, 4] triangular: (4 - 2)/(4 - 0) = 2/4 = 0.5
  // Positive [0, 5, 10, 10] trapezoidal: (2 - 0)/(5 - 0) = 2/5 = 0.4
  const muErrZero = evaluateMF(2.0, errorMF.find((m) => m.name === 'Zero'));
  const muErrPos = evaluateMF(2.0, errorMF.find((m) => m.name === 'Positive'));
  approxEqual(muErrZero, 0.5, 1e-9, 'muErrZero at 2.0');
  approxEqual(muErrPos, 0.4, 1e-9, 'muErrPos at 2.0');

  // Error Rate = 1.0:
  // Falling [-5, -5, -2, 0]: 0
  // Steady [-2, 0, 2] triangular: (2 - 1)/(2 - 0) = 1/2 = 0.5
  // Rising [0, 2, 5, 5] trapezoidal: (1 - 0)/(2 - 0) = 1/2 = 0.5
  const muRateSteady = evaluateMF(1.0, rateMF.find((m) => m.name === 'Steady'));
  const muRateRising = evaluateMF(1.0, rateMF.find((m) => m.name === 'Rising'));
  approxEqual(muRateSteady, 0.5, 1e-9, 'muRateSteady at 1.0');
  approxEqual(muRateRising, 0.5, 1e-9, 'muRateRising at 1.0');

  // Active rules:
  // Zero & Steady (consequent 50): w = min(0.5, 0.5) = 0.5 -> w*z = 25.0
  // Zero & Rising (consequent 70): w = min(0.5, 0.5) = 0.5 -> w*z = 35.0
  // Positive & Steady (consequent 80): w = min(0.4, 0.5) = 0.4 -> w*z = 32.0
  // Positive & Rising (consequent 100): w = min(0.4, 0.5) = 0.4 -> w*z = 40.0
  // Sum w*z = 25.0 + 35.0 + 32.0 + 40.0 = 132.0
  // Sum w = 0.5 + 0.5 + 0.4 + 0.4 = 1.8
  // z* = 132.0 / 1.8 = 220 / 3 ≈ 73.33333333333333
  const expectedNum = 132.0;
  const expectedDen = 1.8;
  const expectedZ = 220 / 3;

  const pipeline = runSugenoPipeline(acPreset, [2.0, 1.0]);
  approxEqual(pipeline.result.numerator, expectedNum, 1e-9, 'AC numerator');
  approxEqual(pipeline.result.denominator, expectedDen, 1e-9, 'AC denominator');
  approxEqual(pipeline.result.output, expectedZ, 1e-9, 'AC output z*');
});

test('Washing Machine Controller hand-checked case (Dirtiness = 3.5, Grease = 2.0)', () => {
  const washPreset = presets.find((p) => p.id === 'washing-machine');
  assert.ok(washPreset);

  const dirtMF = washPreset.inputs[0].membershipFunctions;
  const greaseMF = washPreset.inputs[1].membershipFunctions;

  // Dirtiness = 3.5:
  // Low [0, 0, 2, 5] trapezoidal: (5 - 3.5)/(5 - 2) = 1.5/3 = 0.5
  // Medium [2, 5, 8] triangular: (3.5 - 2)/(5 - 2) = 1.5/3 = 0.5
  // High [5, 8, 10, 10]: 0
  const muDirtLow = evaluateMF(3.5, dirtMF.find((m) => m.name === 'Low'));
  const muDirtMed = evaluateMF(3.5, dirtMF.find((m) => m.name === 'Medium'));
  approxEqual(muDirtLow, 0.5, 1e-9, 'muDirtLow at 3.5');
  approxEqual(muDirtMed, 0.5, 1e-9, 'muDirtMed at 3.5');

  // Grease Level = 2.0:
  // Low [0, 0, 2, 5] trapezoidal: flat 1 from 0 to 2, so at 2.0 is 1.0
  // Medium [2, 5, 8] triangular: (2 - 2) = 0.0
  // High: 0.0
  const muGreaseLow = evaluateMF(2.0, greaseMF.find((m) => m.name === 'Low'));
  const muGreaseMed = evaluateMF(2.0, greaseMF.find((m) => m.name === 'Medium'));
  approxEqual(muGreaseLow, 1.0, 1e-9, 'muGreaseLow at 2.0');
  approxEqual(muGreaseMed, 0.0, 1e-9, 'muGreaseMed at 2.0');

  // Active rules:
  // Low & Low (consequent 10): w = min(0.5, 1.0) = 0.5 -> w*z = 5.0
  // Medium & Low (consequent 20): w = min(0.5, 1.0) = 0.5 -> w*z = 10.0
  // Sum w*z = 5.0 + 10.0 = 15.0
  // Sum w = 0.5 + 0.5 = 1.0
  // z* = 15.0 / 1.0 = 15.00
  const expectedNum = 15.0;
  const expectedDen = 1.0;
  const expectedZ = 15.0;

  const pipeline = runSugenoPipeline(washPreset, [3.5, 2.0]);
  approxEqual(pipeline.result.numerator, expectedNum, 1e-9, 'Wash numerator');
  approxEqual(pipeline.result.denominator, expectedDen, 1e-9, 'Wash denominator');
  approxEqual(pipeline.result.output, expectedZ, 1e-9, 'Wash output z*');
});

// ─────────────────────────────────────────────────────────────
// 1.d Property checks over 25 sampled input pairs per preset
// ─────────────────────────────────────────────────────────────
test('Property checks over 25 sampled input pairs per preset', () => {
  for (const preset of presets) {
    const [in1, in2] = preset.inputs;
    const allConsequents = preset.rules.map((r) => r.consequent);
    const minConsequent = Math.min(...allConsequents);
    const maxConsequent = Math.max(...allConsequents);

    // 5 samples per dimension = 25 pairs
    const samples1 = [0, 0.25, 0.5, 0.75, 1.0].map(
      (t) => in1.range[0] + t * (in1.range[1] - in1.range[0])
    );
    const samples2 = [0, 0.25, 0.5, 0.75, 1.0].map(
      (t) => in2.range[0] + t * (in2.range[1] - in2.range[0])
    );

    let pairsCount = 0;
    for (const x of samples1) {
      for (const y of samples2) {
        pairsCount++;
        const res = runSugenoPipeline(preset, [x, y]);
        const z = res.result.output;

        // Output must be finite
        assert.ok(Number.isFinite(z), `${preset.name} output must be finite at [${x}, ${y}]`);
        assert.ok(!Number.isNaN(z), `${preset.name} output must not be NaN at [${x}, ${y}]`);

        // Convex combination property: weighted average of constant consequents
        // must lie between min(c_i) and max(c_i)
        assert.ok(
          z >= minConsequent - 1e-9,
          `${preset.name} z* (${z}) >= min consequent (${minConsequent}) at [${x}, ${y}]`
        );
        assert.ok(
          z <= maxConsequent + 1e-9,
          `${preset.name} z* (${z}) <= max consequent (${maxConsequent}) at [${x}, ${y}]`
        );
      }
    }
    assert.strictEqual(pairsCount, 25, `${preset.name} sampled 25 pairs`);
  }
});
