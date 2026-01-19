"""
QUANTUM REASONING TOOL
======================
Harness quantum-inspired superposition for parallel hypothesis exploration.
"""

import json

from python.helpers.heisenberg_core import get_heisenberg_core
from python.helpers.tool import Response, Tool


class QuantumReasoning(Tool):
    """
    Quantum-inspired reasoning with superposition of hypotheses.
    Enables parallel exploration of solution paths.
    """

    async def execute(self, **kwargs):
        heisenberg = get_heisenberg_core()

        task = self.args.get("task", "")
        hypotheses = self.args.get("hypotheses", [])
        evidence = self.args.get("evidence", "")
        action = self.args.get("action", "create")  # create, apply, collapse, status

        if action == "create":
            # Create superposition of hypotheses
            if not hypotheses:
                hypotheses = [
                    f"Direct approach: {task}",
                    f"Decompose: {task}",
                    f"Abstract pattern: {task}",
                    f"Analogical: {task}",
                    f"First principles: {task}",
                    f"Invert problem: {task}",
                    f"Constraint relaxation: {task}",
                    f"Meta-cognitive: {task}"
                ]

            branch_ids = heisenberg.quantum.create_superposition(hypotheses)

            result = {
                "action": "create",
                "branches_created": len(branch_ids),
                "branch_ids": branch_ids[:8],
                "initial_probabilities": {
                    bid: float(heisenberg.quantum.branches[bid].probability)
                    for bid in branch_ids[:8]
                }
            }

            return Response(
                message=f"Created quantum superposition with {len(branch_ids)} parallel hypotheses.\n\n"
                       f"Top branches:\n" +
                       "\n".join([
                           f"- {heisenberg.quantum.branches[bid].hypothesis} (p={heisenberg.quantum.branches[bid].probability:.3f})"
                           for bid in branch_ids[:5]
                       ]),
                break_loop=False
            )

        elif action == "apply":
            # Apply evidence to update probabilities
            if not evidence:
                return Response(
                    message="No evidence provided. Use 'evidence' parameter.",
                    break_loop=False
                )

            def relevance_fn(hypothesis: str, ev: str) -> float:
                # Simple keyword matching
                h_words = set(hypothesis.lower().split())
                e_words = set(ev.lower().split())
                overlap = len(h_words & e_words)
                return overlap / max(len(h_words), 1) * 0.5

            heisenberg.quantum.apply_evidence(evidence, relevance_fn)

            top_branches = heisenberg.quantum.get_top_branches(5)

            return Response(
                message=f"Applied evidence: '{evidence[:100]}...'\n\n"
                       f"Updated probabilities:\n" +
                       "\n".join([
                           f"- {b.hypothesis} (p={b.probability:.3f}, confidence={b.confidence:.2f})"
                           for b in top_branches
                       ]),
                break_loop=False
            )

        elif action == "collapse":
            # Collapse superposition to single state
            if len(heisenberg.quantum.branches) == 0:
                return Response(
                    message="No active superposition to collapse. Create one first.",
                    break_loop=False
                )

            collapsed = heisenberg.quantum.measure_and_collapse()

            return Response(
                message=f"Quantum collapse!\n\n"
                       f"**Selected hypothesis**: {collapsed.hypothesis}\n"
                       f"**Probability at collapse**: {collapsed.probability:.3f}\n"
                       f"**Confidence**: {collapsed.confidence:.2f}\n"
                       f"**Evidence accumulated**: {len(collapsed.evidence)} pieces",
                break_loop=False
            )

        elif action == "status":
            # Get current quantum state
            if len(heisenberg.quantum.branches) == 0:
                return Response(
                    message="No active quantum superposition.",
                    break_loop=False
                )

            top_branches = heisenberg.quantum.get_top_branches(8)
            uncertainty = heisenberg.quantum.get_heisenberg_bounds()
            interference = heisenberg.quantum.calculate_interference()

            status_lines = [
                f"**Active Branches**: {len(heisenberg.quantum.branches)}",
                f"**Measurements**: {len(heisenberg.quantum.measurement_history)}",
                f"**Entangled Pairs**: {len(heisenberg.quantum.entanglement_pairs)}",
                "",
                "**Top Hypotheses**:"
            ]

            for b in top_branches:
                int_score = interference.get(b.id, 0)
                status_lines.append(
                    f"- {b.hypothesis[:60]}... (p={b.probability:.3f}, interference={int_score:.3f})"
                )

            return Response(
                message="\n".join(status_lines),
                break_loop=False
            )

        return Response(
            message=f"Unknown action: {action}. Use: create, apply, collapse, status",
            break_loop=False
        )
