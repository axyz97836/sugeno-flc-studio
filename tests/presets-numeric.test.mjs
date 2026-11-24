import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { presets } from '../src/data/presets.js';

test('current presets match numeric snapshot fixture exactly', () => {
  const fixturePath = path.resolve('tests/fixtures/presets-numeric.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  const currentNumeric = presets.map((p) => ({
    id: p.id,
    inputs: p.inputs.map((inp) => ({
      name: inp.name,
      range: inp.range,
      defaultValue: inp.defaultValue,
      membershipFunctions: inp.membershipFunctions.map((mf) => ({
        name: mf.name,
        type: mf.type,
        params: mf.params,
      })),
    })),
    outputRange: p.output.range,
    rules: p.rules.map((r) => ({
      antecedents: r.antecedents,
      consequent: r.consequent,
    })),
  }));

  assert.deepStrictEqual(currentNumeric, fixture);
});
