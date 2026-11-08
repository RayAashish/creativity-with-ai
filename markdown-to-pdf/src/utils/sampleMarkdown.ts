export const SAMPLE_SHOWCASE = `# CodexPress Feature Showcase

> [!NOTE]
> CodexPress transforms any Markdown document, source code file, or GitHub repository into an executive-ready, print-perfect PDF with full support for tables, KaTeX math, code highlighting, and Mermaid diagrams.

---

## 1. Mathematical Equations (KaTeX)

CodexPress natively supports both inline math like $E = mc^2$ or $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$, and complex block equations:

$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi
$$

$$
\\mathbf{A} = \\begin{pmatrix}
a_{11} & a_{12} & \\cdots & a_{1n} \\\\
a_{21} & a_{22} & \\cdots & a_{2n} \\\\
\\vdots & \\vdots & \\ddots & \\vdots \\\\
a_{m1} & a_{m2} & \\cdots & a_{mn}
\\end{pmatrix}
$$

---

## 2. GitHub Callout Alerts

> [!TIP]
> Use standard GitHub alert syntax \`> [!TIP]\` to highlight actionable advice and best practices for your team.

> [!IMPORTANT]
> Ensure all external dependencies are pinned before building your release artifacts.

> [!WARNING]
> Deprecated API endpoints will be decommissioned in the upcoming v3.0 release.

> [!CAUTION]
> Modifying production database schemas without a backup can lead to irreversible data loss.

---

## 3. Architecture Diagrams (Mermaid)

CodexPress renders Mermaid diagrams directly into scalable vector graphics:

\`\`\`mermaid
flowchart TD
    A[Markdown / Code File / GitHub Repo] --> B[CodexPress Parser]
    B --> C{Process Elements}
    C -->|Math| D[KaTeX Renderer]
    C -->|Diagrams| E[Mermaid Engine]
    C -->|Code| F[Syntax Highlighter]
    D --> G[Unified Document Layout]
    E --> G
    F --> G
    G --> H[High-Fidelity PDF Engine]
    H --> I[Vector PDF Download & Print]
\`\`\`

---

## 4. Code Syntax Highlighting

Here is an example in TypeScript demonstrating async stream processing:

\`\`\`typescript
interface DocumentJob {
  id: string;
  sourceUrl: string;
  format: 'A4' | 'Letter';
  timestamp: number;
}

export async function processDocument(job: DocumentJob): Promise<Uint8Array> {
  console.log(\`Starting conversion for \${job.id}...\`);
  const response = await fetch(job.sourceUrl);
  if (!response.ok) {
    throw new Error(\`Failed to fetch document: \${response.statusText}\`);
  }
  const markdown = await response.text();
  return generatePdfFromMarkdown(markdown, { format: job.format });
}
\`\`\`

And a Python snippet for machine learning inference:

\`\`\`python
import torch
import torch.nn as nn

class TransformerEncoder(nn.Module):
    def __init__(self, embed_dim: int, num_heads: int):
        super().__init__()
        self.attn = nn.MultiheadAttention(embed_dim, num_heads, batch_first=True)
        self.norm = nn.LayerNorm(embed_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        attn_out, _ = self.attn(x, x, x)
        return self.norm(x + attn_out)
\`\`\`

---

## 5. Structured Data & Comparison Tables

| Feature | Standard Markdown | CodexPress Output | Export Fidelity |
| :--- | :---: | :---: | :---: |
| **KaTeX Math** | Raw code | Fully Rendered Formula | Vector SVG |
| **Mermaid Charts** | Plain text | Crisp Diagrams | Vector SVG |
| **Syntax Highlighting** | Monospace text | Multi-language Colored | High Contrast |
| **GitHub Alerts** | Plain quote | Color-Coded Callout Cards | Styled Cards |
| **Page Break Control** | Breaks randomly | Protected Blocks | Clean Breaks |

---

## 6. Task List & Milestones

- [x] High-performance Markdown parser engine
- [x] GitHub URL automatic raw conversion
- [x] Custom themes: Academic, Modern, Minimal, Executive
- [x] Vector PDF download via headless browser
- [ ] Direct export to Google Drive / Cloud Storage
`;

export const SAMPLE_GITHUB_README = `# FastCache — High Performance Distributed Key-Value Store

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)
[![Go Report Card](https://img.shields.io/badge/go%20report-A+-success.svg)](#)

FastCache is a distributed, in-memory caching engine engineered for sub-millisecond p99 latencies, automatic horizontal clustering, and zero-downtime shard rebalancing.

---

## Key Features

- **Blazing Fast**: Sub-100 microsecond read latency using zero-copy networking.
- **Raft Consensus**: Built-in linearizable distributed consensus with auto-failover.
- **Pluggable Eviction**: LRU, LFU, TinyLFU, and FIFO cache policies.
- **Cross-Datacenter Replication**: Asynchronous multi-region active-active syncing.

---

## Quickstart

### Installation

\`\`\`bash
# Install via Go CLI
go install github.com/fastcache/engine@latest

# Or pull the official Docker image
docker run -d -p 8080:8080 fastcache/engine:latest
\`\`\`

### Basic Usage

\`\`\`go
package main

import (
	"context"
	"fmt"
	"github.com/fastcache/client"
)

func main() {
	c := client.New("localhost:8080")
	ctx := context.Background()

	// Store a value with a 10-minute TTL
	err := c.Set(ctx, "session:user_123", []byte("active"), 600)
	if err != nil {
		panic(err)
	}

	val, _ := c.Get(ctx, "session:user_123")
	fmt.Printf("Retrieved Session: %s\\n", string(val))
}
\`\`\`

---

## Performance Benchmark

\`\`\`
SET: 1,240,000 ops/sec | p99: 0.12ms
GET: 1,890,000 ops/sec | p99: 0.08ms
\`\`\`

---

## License

This project is licensed under the MIT License.
`;

export const SAMPLE_ACADEMIC_PAPER = `# Distributed Consensus in Partition-Tolerant Edge Networks

**Dr. Eleanor Vance**, Department of Computer Science, Stanford University  
**Dr. Marcus Reed**, Distributed Systems Laboratory, MIT  
*October 2026*

---

### Abstract

We investigate the problem of establishing Byzantine fault-tolerant consensus across decentralized edge networks subject to frequent intermittent partitions. We introduce **AeroBFT**, an optimistic quorum-based consensus protocol that provides $O(1)$ amortized message complexity under synchronous epochs while guaranteeing safety under arbitrary network partitions. Empirical evaluations over a 128-node geo-distributed testbed demonstrate a 4.2x throughput improvement over standard Raft.

---

## 1. System Model & Formalization

Consider a network composed of $n$ nodes where at most $f$ nodes may experience Byzantine failures. We operate under the standard partially synchronous timing assumption:

$$
n \\ge 3f + 1
$$

Let the quorum size $Q$ be defined by:

$$
Q = \\left\\lfloor \\frac{n + f}{2} \\right\\rfloor + 1
$$

The consensus objective ensures that every non-faulty node $p_i$ outputs the identical committed state sequence $\\mathcal{S}$:

$$
\\forall p_i, p_j \\in \\mathcal{N}_{\\text{honest}}, \\quad \\mathcal{S}_i[k] = \\mathcal{S}_j[k] \\quad (k \\in \\mathbb{N})
$$

---

## 2. Complexity Analysis

| Protocol | Normal Latency | Partition Recovery | Message Complexity |
| :--- | :---: | :---: | :---: |
| PBFT | $2 \\text{ RTT}$ | View Change ($O(n^2)$) | $O(n^2)$ |
| Raft | $1 \\text{ RTT}$ | Leader Election ($O(n)$) | $O(n)$ |
| **AeroBFT (Ours)** | **$1 \\text{ RTT}$** | **Optimistic Quorum ($O(1)$)** | **$O(n)$** |

---

## 3. Conclusion

AeroBFT resolves the latency trade-off in modern partition-tolerant edge computing architectures without sacrificing formal Byzantine safety guarantees.
`;
