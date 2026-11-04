import {type Problem} from "../../types/frontendTypes"
import {generateStandardProblems} from "../game/generateProblem"
import generateVector from "./vectorizeProblem"

const D = 23;        // feature vector size
const SIGMA2 = 0.25; // noise variance of y (tune later)


export interface BayesModel {
  A: number[][];     // D×D posterior precision matrix
  b: number[];       // length-D vector
}


/** Prior: weights ~ Normal(0, 1/λ). λ is one number, or one per feature. */
export function initModel(priorPrecision: number | number[] = 1): BayesModel {
  const A = Array.from({ length: D }, () => new Array<number>(D).fill(0));
  const b = new Array<number>(D).fill(0);
  for (let i = 0; i < D; i++) {
    A[i][i] = Array.isArray(priorPrecision) ? priorPrecision[i] : priorPrecision;
  }
  return { A, b };
}



/** Add one observation: x is the feature vector, y the normalized log time. */
export function bayesUpdate(model: BayesModel, x: number[], y: number): void {
  if (x.length !== D) throw new Error(`expected ${D} features, got ${x.length}`);
  for (let i = 0; i < D; i++) {
    if (x[i] === 0) continue;               // zero features change nothing
    model.b[i] += (x[i] * y) / SIGMA2;
    for (let j = 0; j < D; j++) {
      model.A[i][j] += (x[i] * x[j]) / SIGMA2;
    }
  }
}


// Feature blocks per operation. Assumes indices 0..3 = add, subtract, multiply, divide.
const OP_BLOCKS: [number, number][] = [
  [4, 7],    // 0: addition
  [8, 11],   // 1: subtraction
  [12, 18],  // 2: multiplication
  [19, 22],  // 3: division
];

/** Throws if a vector breaks the layout: one operation flag, other blocks all zero. */
export function checkGating(x: number[]): void {
  if (x.length !== D) throw new Error(`expected ${D} features, got ${x.length}`);
  const ops = x.slice(0, 4);
  const active = ops.findIndex(v => v === 1);
  if (active === -1 || ops.filter(v => v !== 0).length !== 1) {
    throw new Error("exactly one operation flag (indices 0-3) must be 1");
  }
  OP_BLOCKS.forEach(([lo, hi], op) => {
    if (op === active) return;
    for (let i = lo; i <= hi; i++) {
      if (x[i] !== 0) throw new Error(`feature ${i} must be 0 for operation ${active}`);
    }
  });
}

/** Thompson step: one weight sample, score 200 candidates, return the best vector. */
export function chooseVector(model: BayesModel): Problem {

  const w = sampleWeights(model);
  const candidates = generateStandardProblems(200);

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const p of candidates) {
    const x = generateVector(p)
    checkGating(x);
    const score = dot(w, x);
    if (score > bestScore) {
        bestScore = score
        best = p
    }
  }
  return best;
}

/** One draw w ~ Normal(m, A⁻¹), where m = A⁻¹ b. */
export function sampleWeights(model: BayesModel): number[] {
  const L = cholesky(model.A);
  const m = backSolve(L, forwardSolve(L, model.b));      // posterior mean
  const z = Array.from({ length: D }, () => randn());
  const noise = backSolve(L, z);                         // L⁻ᵀ z has covariance A⁻¹
  return m.map((mi, i) => mi + noise[i]);
}

// ---------- linear algebra helpers ----------

function cholesky(A: number[][]): number[][] {           // A = L Lᵀ
  const L = Array.from({ length: D }, () => new Array<number>(D).fill(0));
  for (let i = 0; i < D; i++) {
    for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) {
        if (s <= 0) throw new Error("A is not positive definite");
        L[i][i] = Math.sqrt(s);
      } else {
        L[i][j] = s / L[j][j];
      }
    }
  }
  return L;
}

function forwardSolve(L: number[][], v: number[]): number[] {   // solve L y = v
  const y = new Array<number>(D).fill(0);
  for (let i = 0; i < D; i++) {
    let s = v[i];
    for (let k = 0; k < i; k++) s -= L[i][k] * y[k];
    y[i] = s / L[i][i];
  }
  return y;
}

function backSolve(L: number[][], v: number[]): number[] {      // solve Lᵀ x = v
  const x = new Array<number>(D).fill(0);
  for (let i = D - 1; i >= 0; i--) {
    let s = v[i];
    for (let k = i + 1; k < D; k++) s -= L[k][i] * x[k];
    x[i] = s / L[i][i];
  }
  return x;
}

function randn(): number {                                // Box–Muller
  const u = 1 - Math.random(), v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}