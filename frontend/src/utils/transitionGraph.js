/**
 * Transition graph utilities.
 *
 * Builds a directed weighted graph from keystroke timing data.
 * Each edge represents a character-to-character transition with
 * latency and error tracking.
 */

/**
 * Build a transition graph from raw keystroke log data.
 *
 * @param {Array} keystrokes - Array of { char, expected, timestamp, correct }
 * @returns {Object} Graph with edges map, node stats, and analytics
 */
export function buildTransitionGraph(keystrokes) {
  if (!keystrokes || keystrokes.length < 2) {
    return { edges: {}, nodeErrors: {}, analytics: {} };
  }

  const edges = {}; // "a→b" => { totalLatency, count, errors, avgLatency, errorRate }
  const nodeErrors = {}; // "a" => { errors, total }

  for (let i = 1; i < keystrokes.length; i++) {
    const prev = keystrokes[i - 1];
    const curr = keystrokes[i];

    const fromChar = prev.expected.toLowerCase();
    const toChar = curr.expected.toLowerCase();
    const latency = curr.timestamp - prev.timestamp;
    const isError = !curr.correct;

    // Skip if latency is unreasonable (> 5 seconds pause)
    if (latency > 5000 || latency < 0) continue;

    // Edge key
    const key = `${fromChar}→${toChar}`;

    if (!edges[key]) {
      edges[key] = {
        from: fromChar,
        to: toChar,
        totalLatency: 0,
        count: 0,
        errors: 0,
      };
    }

    edges[key].totalLatency += latency;
    edges[key].count += 1;
    if (isError) edges[key].errors += 1;

    // Track per-character errors
    if (!nodeErrors[toChar]) {
      nodeErrors[toChar] = { errors: 0, total: 0 };
    }
    nodeErrors[toChar].total += 1;
    if (isError) nodeErrors[toChar].errors += 1;
  }

  // Compute averages
  for (const key of Object.keys(edges)) {
    const edge = edges[key];
    edge.avgLatency = Math.round(edge.totalLatency / edge.count);
    edge.errorRate = Math.round((edge.errors / edge.count) * 100);
  }

  // Compute node error rates
  for (const key of Object.keys(nodeErrors)) {
    const node = nodeErrors[key];
    node.errorRate = Math.round((node.errors / node.total) * 100);
  }

  // Analytics
  const edgeList = Object.values(edges);
  const analytics = {
    totalEdges: edgeList.length,
    slowestTransitions: [...edgeList]
      .sort((a, b) => b.avgLatency - a.avgLatency)
      .slice(0, 10),
    mostErrors: [...edgeList]
      .filter((e) => e.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10),
    avgLatency: edgeList.length
      ? Math.round(edgeList.reduce((s, e) => s + e.avgLatency, 0) / edgeList.length)
      : 0,
  };

  return { edges, nodeErrors, analytics };
}

/**
 * Get the color for a key based on its error rate.
 * @param {number} errorRate - Error rate percentage (0-100)
 * @returns {string} HSL color string
 */
export function getKeyColor(errorRate) {
  if (errorRate === undefined || errorRate === null) return '#252536';
  // Green (120) → Yellow (60) → Red (0)
  const hue = Math.max(0, 120 - (errorRate * 1.2));
  const saturation = Math.min(80, 30 + errorRate);
  return `hsl(${hue}, ${saturation}%, 40%)`;
}

/**
 * Get latency classification.
 * @param {number} latency - Latency in ms
 * @returns {string} 'fast' | 'medium' | 'slow'
 */
export function getLatencyClass(latency) {
  if (latency < 100) return 'fast';
  if (latency < 200) return 'medium';
  return 'slow';
}
