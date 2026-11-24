// ══════════════════════════════════════════════════════════════
// Presets: configured for Sugeno Fuzzy Logic Controller Studio
// ══════════════════════════════════════════════════════════════
export const presets = [
  {
    id: 'tipping',
    name: 'Restaurant Tipping',
    iconKey: 'restaurant',
    description: 'Calculate tip percentage based on food quality and service. Classic textbook example for Sugeno FLC.',
    inputs: [
      {
        name: 'Food Quality', short: 'Food', range: [0, 10], defaultValue: 4, unit: '/10',
        membershipFunctions: [
          { name: 'Poor', type: 'trapezoidal', params: [0, 0, 2, 5], color: 'var(--color-curve-red)' },
          { name: 'Average', type: 'triangular', params: [2, 5, 8], color: 'var(--color-curve-amber)' },
          { name: 'Good', type: 'trapezoidal', params: [5, 8, 10, 10], color: 'var(--color-curve-green)' },
        ],
      },
      {
        name: 'Service Quality', short: 'Service', range: [0, 10], defaultValue: 7, unit: '/10',
        membershipFunctions: [
          { name: 'Poor', type: 'trapezoidal', params: [0, 0, 2, 5], color: 'var(--color-curve-red)' },
          { name: 'Average', type: 'triangular', params: [2, 5, 8], color: 'var(--color-curve-amber)' },
          { name: 'Excellent', type: 'trapezoidal', params: [5, 8, 10, 10], color: 'var(--color-curve-green)' },
        ],
      },
    ],
    output: { name: 'Tip', unit: '%', range: [0, 30] },
    rules: [
      { antecedents: ['Poor', 'Poor'], consequent: 5, label: 'Very Low' },
      { antecedents: ['Poor', 'Average'], consequent: 10, label: 'Low' },
      { antecedents: ['Poor', 'Excellent'], consequent: 10, label: 'Low' },
      { antecedents: ['Average', 'Poor'], consequent: 10, label: 'Low' },
      { antecedents: ['Average', 'Average'], consequent: 15, label: 'Medium' },
      { antecedents: ['Average', 'Excellent'], consequent: 20, label: 'High' },
      { antecedents: ['Good', 'Poor'], consequent: 15, label: 'Medium' },
      { antecedents: ['Good', 'Average'], consequent: 20, label: 'High' },
      { antecedents: ['Good', 'Excellent'], consequent: 25, label: 'Very High' },
    ],
  },
  {
    id: 'ac-controller',
    name: 'AC Temperature Controller',
    iconKey: 'ac',
    description: 'Control air conditioning fan speed based on temperature error and rate of change.',
    inputs: [
      {
        name: 'Temperature Error', short: 'Error', range: [-10, 10], defaultValue: 3, unit: '°C',
        membershipFunctions: [
          { name: 'Negative', type: 'trapezoidal', params: [-10, -10, -5, 0], color: 'var(--color-curve-blue)' },
          { name: 'Zero', type: 'triangular', params: [-4, 0, 4], color: 'var(--color-curve-purple)' },
          { name: 'Positive', type: 'trapezoidal', params: [0, 5, 10, 10], color: 'var(--color-curve-orange)' },
        ],
      },
      {
        name: 'Error Rate', short: 'Rate', range: [-5, 5], defaultValue: 1, unit: '°C/s',
        membershipFunctions: [
          { name: 'Falling', type: 'trapezoidal', params: [-5, -5, -2, 0], color: 'var(--color-curve-blue)' },
          { name: 'Steady', type: 'triangular', params: [-2, 0, 2], color: 'var(--color-curve-purple)' },
          { name: 'Rising', type: 'trapezoidal', params: [0, 2, 5, 5], color: 'var(--color-curve-orange)' },
        ],
      },
    ],
    output: { name: 'Fan Speed', unit: '%', range: [0, 100] },
    rules: [
      { antecedents: ['Negative', 'Falling'], consequent: 10, label: 'Very Low' },
      { antecedents: ['Negative', 'Steady'], consequent: 20, label: 'Low' },
      { antecedents: ['Negative', 'Rising'], consequent: 40, label: 'Medium' },
      { antecedents: ['Zero', 'Falling'], consequent: 20, label: 'Low' },
      { antecedents: ['Zero', 'Steady'], consequent: 50, label: 'Medium' },
      { antecedents: ['Zero', 'Rising'], consequent: 70, label: 'High' },
      { antecedents: ['Positive', 'Falling'], consequent: 40, label: 'Medium' },
      { antecedents: ['Positive', 'Steady'], consequent: 80, label: 'High' },
      { antecedents: ['Positive', 'Rising'], consequent: 100, label: 'Maximum' },
    ],
  },
  {
    id: 'washing-machine',
    name: 'Washing Machine Controller',
    iconKey: 'washing-machine',
    description: 'Determine optimal wash time based on dirtiness and fabric type grease level.',
    inputs: [
      {
        name: 'Dirtiness', short: 'Dirt', range: [0, 10], defaultValue: 6, unit: '/10',
        membershipFunctions: [
          { name: 'Low', type: 'trapezoidal', params: [0, 0, 2, 5], color: 'var(--color-curve-green)' },
          { name: 'Medium', type: 'triangular', params: [2, 5, 8], color: 'var(--color-curve-amber)' },
          { name: 'High', type: 'trapezoidal', params: [5, 8, 10, 10], color: 'var(--color-curve-red)' },
        ],
      },
      {
        name: 'Grease Level', short: 'Grease', range: [0, 10], defaultValue: 4, unit: '/10',
        membershipFunctions: [
          { name: 'Low', type: 'trapezoidal', params: [0, 0, 2, 5], color: 'var(--color-curve-green)' },
          { name: 'Medium', type: 'triangular', params: [2, 5, 8], color: 'var(--color-curve-amber)' },
          { name: 'High', type: 'trapezoidal', params: [5, 8, 10, 10], color: 'var(--color-curve-red)' },
        ],
      },
    ],
    output: { name: 'Wash Time', unit: ' min', range: [0, 60] },
    rules: [
      { antecedents: ['Low', 'Low'], consequent: 10, label: 'Quick' },
      { antecedents: ['Low', 'Medium'], consequent: 20, label: 'Short' },
      { antecedents: ['Low', 'High'], consequent: 30, label: 'Normal' },
      { antecedents: ['Medium', 'Low'], consequent: 20, label: 'Short' },
      { antecedents: ['Medium', 'Medium'], consequent: 35, label: 'Normal' },
      { antecedents: ['Medium', 'High'], consequent: 45, label: 'Long' },
      { antecedents: ['High', 'Low'], consequent: 30, label: 'Normal' },
      { antecedents: ['High', 'Medium'], consequent: 45, label: 'Long' },
      { antecedents: ['High', 'High'], consequent: 55, label: 'Extra Long' },
    ],
  },
];

export const STEP_INFO = [
  {
    id: 0, key: 'setup', label: 'Setup', iconKey: 'setup',
    title: 'Define the Problem',
    description: 'In the Sugeno Fuzzy Logic Controller, we define input variables with linguistic terms mapped by membership functions. Each MF converts a crisp value into a degree of membership between 0 and 1. Unlike Mamdani, the Sugeno method uses constant or linear functions as rule consequents, making it computationally efficient and well-suited for optimization.',
    formula: 'μ_A(x) ∈ [0, 1]  for each linguistic term A',
    highlight: 'Pick a preset, then move the sliders to see how each input changes the membership degrees and the output.',
  },
  {
    id: 1, key: 'fuzzify', label: 'Fuzzify', iconKey: 'fuzzify',
    title: 'Fuzzification',
    description: 'Fuzzification converts each crisp input into fuzzy membership degrees. We evaluate every membership function at the input value. The dashed indicator on the chart marks where the input intersects each curve: the intersection height is the degree of membership.',
    formula: 'μ_A(x) = degree of membership of x in fuzzy set A',
    highlight: 'Watch the intersection dots. Their heights are the membership degrees shown in the badges below.',
  },
  {
    id: 2, key: 'rules', label: 'Rules', iconKey: 'rules',
    title: 'Rule Evaluation',
    description: 'Each fuzzy IF-THEN rule combines conditions using AND (minimum) or OR (maximum). The firing strength of a rule equals the minimum of its antecedent membership degrees. Only rules with non-zero firing strength contribute to the final output.',
    formula: 'wᵢ = min( μ_A(x₁), μ_B(x₂) )',
    highlight: 'Brighter cells have higher firing strengths, meaning these rules dominate the output.',
  },
  {
    id: 3, key: 'compute', label: 'Compute', iconKey: 'compute',
    title: 'Consequent Computation',
    description: "In Sugeno's method, each rule's consequent is a crisp function: either a constant (zero-order) or a linear function of inputs (first-order). This is the key difference from Mamdani: no fuzzy output sets, no complex aggregation. Each active rule directly outputs a number.",
    formula: 'Zero-order: zᵢ = cᵢ   |   First-order: zᵢ = p₁x₁ + p₂x₂ + r',
    highlight: 'Each card shows an active rule, its weight, output value, and weighted contribution.',
  },
  {
    id: 4, key: 'defuzzify', label: 'Result', iconKey: 'defuzzify',
    title: 'Defuzzification: Weighted Average',
    description: "The final crisp output is the weighted average of all active rule outputs. The weights are the firing strengths from rule evaluation. This is simpler and faster than Mamdani's centroid method, and guarantees a smooth output surface.",
    formula: 'z* = Σ(wᵢ × zᵢ) / Σ(wᵢ)',
    highlight: 'Verify the result against the hand calculation breakdown below.',
  },
];

export default presets;
