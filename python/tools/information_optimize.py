"""
INFORMATION OPTIMIZE TOOL
=========================
Optimize information using information-theoretic principles.
"""

import numpy as np

from python.helpers.heisenberg_core import get_heisenberg_core
from python.helpers.tool import Response, Tool


class InformationOptimize(Tool):
    """
    Information-theoretic optimization for maximum efficiency.
    Analyzes entropy, redundancy, and compression potential.
    """

    async def execute(self, **kwargs):
        heisenberg = get_heisenberg_core()
        info = heisenberg.information

        action = self.args.get("action", "analyze")  # analyze, compare, compress
        text = self.args.get("text", "")
        text2 = self.args.get("text2", "")

        if action == "analyze":
            if not text:
                return Response(
                    message="Please provide 'text' to analyze.",
                    break_loop=False
                )

            analysis = info.optimize_message(text)

            return Response(
                message=f"**Information Analysis**\n\n"
                       f"**Text Length**: {analysis['original_length']} characters\n"
                       f"**Unique Symbols**: {analysis['unique_symbols']}\n\n"
                       f"**Entropy**: {analysis['entropy_per_char']:.4f} bits/char\n"
                       f"**Kolmogorov Estimate**: {analysis['kolmogorov_estimate']:.4f}\n"
                       f"**Minimum Bits**: {analysis['min_bits_needed']:.1f}\n\n"
                       f"**Redundancy**: {analysis['redundancy']*100:.1f}%\n"
                       f"**Compression Potential**: {analysis['compression_potential']*100:.1f}%",
                break_loop=False
            )

        elif action == "compare":
            if not text or not text2:
                return Response(
                    message="Please provide 'text' and 'text2' to compare.",
                    break_loop=False
                )

            # Analyze both texts
            analysis1 = info.optimize_message(text)
            analysis2 = info.optimize_message(text2)

            # Calculate mutual information (simplified)
            # Build joint probability from combined text
            combined = text + text2
            char_freq = {}
            for c in combined:
                char_freq[c] = char_freq.get(c, 0) + 1

            total = sum(char_freq.values())
            probs = [count/total for count in char_freq.values()]

            # Approximate mutual information
            h_combined = info.calculate_entropy(probs)
            h1 = analysis1['entropy_per_char']
            h2 = analysis2['entropy_per_char']

            # I(X;Y) ≈ H(X) + H(Y) - H(X,Y)
            mutual_info = h1 + h2 - h_combined

            return Response(
                message=f"**Information Comparison**\n\n"
                       f"**Text 1**:\n"
                       f"- Length: {analysis1['original_length']}\n"
                       f"- Entropy: {h1:.4f} bits/char\n"
                       f"- Redundancy: {analysis1['redundancy']*100:.1f}%\n\n"
                       f"**Text 2**:\n"
                       f"- Length: {analysis2['original_length']}\n"
                       f"- Entropy: {h2:.4f} bits/char\n"
                       f"- Redundancy: {analysis2['redundancy']*100:.1f}%\n\n"
                       f"**Mutual Information**: {mutual_info:.4f} bits\n"
                       f"(Higher = more shared information)",
                break_loop=False
            )

        elif action == "compress":
            if not text:
                return Response(
                    message="Please provide 'text' to analyze compression.",
                    break_loop=False
                )

            analysis = info.optimize_message(text)

            # Rate-distortion analysis
            data = np.array([ord(c) for c in text])
            distortions = [0.1, 0.5, 1.0, 2.0, 5.0]
            rates = []

            for d in distortions:
                rate = info.calculate_rate_distortion(data, d)
                rates.append(rate)

            result_lines = [
                f"**Compression Analysis**",
                f"",
                f"**Original**: {len(text)} characters",
                f"**Kolmogorov Complexity**: {analysis['kolmogorov_estimate']:.4f}",
                f"**Compression Potential**: {analysis['compression_potential']*100:.1f}%",
                f"",
                f"**Rate-Distortion Trade-off**:",
            ]

            for d, r in zip(distortions, rates):
                result_lines.append(f"  D={d:.1f}: R={r:.2f} bits")

            return Response(
                message="\n".join(result_lines),
                break_loop=False
            )

        return Response(
            message=f"Unknown action: {action}. Use: analyze, compare, compress",
            break_loop=False
        )
