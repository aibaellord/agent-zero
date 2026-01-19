# Tool: Information Optimize

Use this tool for information-theoretic analysis and optimization.

## Usage

```json
{
  "tool_name": "information_optimize",
  "tool_args": {
    "action": "analyze|compare|compress",
    "text": "text to analyze",
    "text2": "second text for comparison"
  }
}
```

## Actions

### `analyze`

Analyze text entropy, redundancy, Kolmogorov complexity estimate, compression potential.

### `compare`

Compare two texts: entropy, redundancy, mutual information.

### `compress`

Analyze compression potential with rate-distortion trade-off.

## Metrics Explained

- **Entropy**: Randomness/information density (bits/char)
- **Redundancy**: Predictable/repeated patterns
- **Kolmogorov Complexity**: Algorithmic information content
- **Mutual Information**: Shared information between texts

## When to Use

- Evaluating message efficiency
- Finding optimal encodings
- Detecting redundancy
- Comparing information content
