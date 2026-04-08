/**
 * Memory Engine Configuration
 *
 * All parameters are grounded in neuroscience literature:
 * - Index sparsity ~12.5% matches observed sparse firing in dentate gyrus
 *   (Leutgeb et al., 2007; ~12.5 Hz baseline / ~100 Hz max = 12.5%).
 * - Hopfield capacity ~0.138N matches the theoretical maximum for reliable
 *   pattern storage (Amit, Gutfreund & Sompolinsky, 1985).
 * - Working memory capacity 7±2 matches Miller's magical number (Miller, 1956).
 * - STDP window ~40 ms matches experimental observations in hippocampal
 *   slice preparations (Bi & Poo, 1998).
 */

export const MEMORY_CONFIG = {
  // -----------------------------------------------------------------------
  // Sparse Index (Dentate Gyrus / CA3)
  // -----------------------------------------------------------------------
  /** Dimensionality of sparse index codes (number of "index neurons"). */
  indexDimensions: 256,
  /** Target sparsity: fraction of neurons active (+1) in each index code. */
  indexSparsity: 0.125,

  // -----------------------------------------------------------------------
  // Hopfield Network (CA3 autoassociative memory)
  // -----------------------------------------------------------------------
  /**
   * Maximum patterns the Hopfield network can store reliably.
   * ≈ 0.138 × 256 ≈ 35 patterns.
   */
  hopfieldMaxPatterns: 35,
  /** Maximum number of asynchronous update iterations during recall. */
  hopfieldMaxIterations: 100,
  /** Convergence threshold: energy change below this → converged. */
  hopfieldConvergenceThreshold: 0.001,

  // -----------------------------------------------------------------------
  // Pattern Separation (Dentate Gyrus k-WTA)
  // -----------------------------------------------------------------------
  /** Number of winner-take-all winners (k-WTA). k = sparsity × dimensions. */
  separationWinners: 32,

  // -----------------------------------------------------------------------
  // Neocortex (embedding dimensions)
  // -----------------------------------------------------------------------
  /** Dimensionality of dense embeddings for neocortical similarity search. */
  embeddingDimensions: 128,

  // -----------------------------------------------------------------------
  // Working Memory (Prefrontal Cortex)
  // -----------------------------------------------------------------------
  /** Capacity of the working memory buffer (Miller's Law: 7±2). */
  workingMemoryCapacity: 7,
  /** Per-tick importance decay factor for working memory items. */
  workingMemoryDecay: 0.95,

  // -----------------------------------------------------------------------
  // Consolidation (Sleep-dependent memory transfer)
  // -----------------------------------------------------------------------
  /** Increment to consolidation level per successful recall. */
  consolidationIncrement: 0.1,
  /** Consolidation level above which a memory is "fully consolidated". */
  consolidationThreshold: 0.8,
  /** Per-time-step decay of hippocampal trace strength. */
  hippocampalDecay: 0.99,
  /** Per-recall growth of neocortical trace strength. */
  neocorticalGrowth: 0.15,

  // -----------------------------------------------------------------------
  // STDP (Spike-Timing-Dependent Plasticity)
  // -----------------------------------------------------------------------
  /** Temporal integration window in abstract "ticks" (models ~40 ms). */
  stdpWindowMs: 40,
  /** Learning rate for STDP weight updates. */
  stdpLearningRate: 0.01,
  /** Maximum absolute synaptic weight in the STDP graph. */
  stdpMaxWeight: 1.0,
  /** Minimum synaptic weight before pruning the edge. */
  stdpPruneThreshold: 0.01,

  // -----------------------------------------------------------------------
  // General
  // -----------------------------------------------------------------------
  /** Default PRNG seed for deterministic reproducibility. */
  seed: 42,

  // -----------------------------------------------------------------------
  // Recall
  // -----------------------------------------------------------------------
  /** Default number of results to return from a recall query. */
  recallDefaultTopK: 5,
} as const;

/** TypeScript type derived from the frozen config object. */
export type MemoryConfig = typeof MEMORY_CONFIG;

/** Multi-tenant configuration exports. */
export * from './tenant-types';
