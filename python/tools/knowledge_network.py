"""
Knowledge Network Explorer Tool
=================================
Navigates the crystallized knowledge network for insights.
Connects disparate knowledge crystals for holistic understanding.
"""
import time
from typing import Any

from python.helpers.tool import Response, Tool


class KnowledgeNetworkExplorer(Tool):
    """
    Explores the knowledge crystal network.
    Finds connections, patterns, and insights across stored knowledge.
    """

    # Network cache
    _network_cache: dict[str, Any] = {}
    _last_cache_update: float = 0
    CACHE_TTL = 300  # 5 minutes

    async def execute(self, **kwargs) -> Response:
        """Execute knowledge network operations."""

        method = self.args.get("method", "explore")

        if method == "explore":
            return await self._explore(self.args.get("query", ""))
        elif method == "connect":
            return await self._find_connections(
                self.args.get("concept_a", ""),
                self.args.get("concept_b", "")
            )
        elif method == "cluster":
            return await self._find_clusters(self.args.get("topic", ""))
        elif method == "path":
            return await self._find_path(
                self.args.get("start", ""),
                self.args.get("end", "")
            )
        elif method == "map":
            return await self._generate_map()
        else:
            return Response(
                message=f"Unknown method: {method}. Use: explore, connect, cluster, path, map",
                break_loop=False
            )

    async def _explore(self, query: str) -> Response:
        """Explore the knowledge network starting from a query."""

        if not query:
            return Response(
                message="Please provide a query to explore the knowledge network.",
                break_loop=False
            )

        results = []

        # Search memory for related crystals
        try:
            if hasattr(self.agent, 'memory') and self.agent.memory:
                memories = await self.agent.memory.search(
                    query=query,
                    limit=10,
                )

                for mem in memories:
                    text = mem.get("text", "")
                    metadata = mem.get("metadata", {})

                    results.append({
                        "text": text[:200] + "..." if len(text) > 200 else text,
                        "type": metadata.get("type", "general"),
                        "quality": metadata.get("quality", 0.5),
                        "timestamp": metadata.get("timestamp", 0),
                    })
        except Exception as e:
            return Response(
                message=f"Error exploring knowledge network: {str(e)}",
                break_loop=False
            )

        if not results:
            return Response(
                message=f"No knowledge found for: '{query}'. The network is ready to learn.",
                break_loop=False
            )

        # Format results
        formatted = [f"## Knowledge Network Exploration: '{query}'\n"]
        for i, result in enumerate(results, 1):
            quality_stars = "★" * int(result["quality"] * 5) + "☆" * (5 - int(result["quality"] * 5))
            formatted.append(f"### {i}. [{result['type'].upper()}] {quality_stars}")
            formatted.append(f"{result['text']}\n")

        return Response(
            message="\n".join(formatted),
            break_loop=False
        )

    async def _find_connections(self, concept_a: str, concept_b: str) -> Response:
        """Find connections between two concepts."""

        if not concept_a or not concept_b:
            return Response(
                message="Please provide both concept_a and concept_b to find connections.",
                break_loop=False
            )

        connections = []

        try:
            if hasattr(self.agent, 'memory') and self.agent.memory:
                # Search for both concepts
                results_a = await self.agent.memory.search(query=concept_a, limit=5)
                results_b = await self.agent.memory.search(query=concept_b, limit=5)

                # Find overlapping concepts
                texts_a = set(m.get("text", "")[:100] for m in results_a)
                texts_b = set(m.get("text", "")[:100] for m in results_b)

                # Simple connection analysis
                for mem_a in results_a:
                    for mem_b in results_b:
                        # Check for shared terms
                        words_a = set(mem_a.get("text", "").lower().split())
                        words_b = set(mem_b.get("text", "").lower().split())
                        shared = words_a & words_b

                        if len(shared) > 3:  # Significant overlap
                            connections.append({
                                "from": concept_a,
                                "to": concept_b,
                                "via": list(shared)[:5],
                                "strength": len(shared) / max(len(words_a), len(words_b)),
                            })
        except Exception as e:
            return Response(
                message=f"Error finding connections: {str(e)}",
                break_loop=False
            )

        if not connections:
            return Response(
                message=f"No direct connections found between '{concept_a}' and '{concept_b}'.",
                break_loop=False
            )

        # Format connections
        formatted = [f"## Connections: '{concept_a}' ↔ '{concept_b}'\n"]
        for conn in connections[:5]:
            strength_bar = "█" * int(conn["strength"] * 10) + "░" * (10 - int(conn["strength"] * 10))
            formatted.append(f"**Strength:** {strength_bar} ({conn['strength']:.2f})")
            formatted.append(f"**Via:** {', '.join(conn['via'])}\n")

        return Response(
            message="\n".join(formatted),
            break_loop=False
        )

    async def _find_clusters(self, topic: str) -> Response:
        """Find knowledge clusters around a topic."""

        if not topic:
            return Response(
                message="Please provide a topic to find clusters.",
                break_loop=False
            )

        clusters = {}

        try:
            if hasattr(self.agent, 'memory') and self.agent.memory:
                memories = await self.agent.memory.search(query=topic, limit=20)

                # Group by type
                for mem in memories:
                    mem_type = mem.get("metadata", {}).get("type", "general")
                    if mem_type not in clusters:
                        clusters[mem_type] = []
                    clusters[mem_type].append(mem.get("text", "")[:100])
        except Exception as e:
            return Response(
                message=f"Error finding clusters: {str(e)}",
                break_loop=False
            )

        if not clusters:
            return Response(
                message=f"No clusters found for topic: '{topic}'",
                break_loop=False
            )

        formatted = [f"## Knowledge Clusters: '{topic}'\n"]
        for cluster_type, items in clusters.items():
            formatted.append(f"### 📦 {cluster_type.upper()} ({len(items)} items)")
            for item in items[:3]:
                formatted.append(f"  • {item}...")
            if len(items) > 3:
                formatted.append(f"  • ... and {len(items) - 3} more\n")

        return Response(
            message="\n".join(formatted),
            break_loop=False
        )

    async def _find_path(self, start: str, end: str) -> Response:
        """Find reasoning path between two concepts."""

        if not start or not end:
            return Response(
                message="Please provide both start and end concepts for path finding.",
                break_loop=False
            )

        # Simple path finding through memory
        path = [start]
        current = start
        max_steps = 5

        try:
            if hasattr(self.agent, 'memory') and self.agent.memory:
                for _ in range(max_steps):
                    # Search from current concept toward end
                    combined_query = f"{current} {end}"
                    memories = await self.agent.memory.search(query=combined_query, limit=3)

                    if memories:
                        # Extract key concept from top result
                        next_concept = memories[0].get("text", "")[:50]
                        path.append(next_concept)

                        if end.lower() in next_concept.lower():
                            path.append(end)
                            break

                        current = next_concept
        except Exception as e:
            return Response(
                message=f"Error finding path: {str(e)}",
                break_loop=False
            )

        formatted = [f"## Knowledge Path: '{start}' → '{end}'\n"]
        for i, step in enumerate(path):
            if i == 0:
                formatted.append(f"🏁 **Start:** {step}")
            elif i == len(path) - 1:
                formatted.append(f"🎯 **End:** {step}")
            else:
                formatted.append(f"   ↓ {step}")

        return Response(
            message="\n".join(formatted),
            break_loop=False
        )

    async def _generate_map(self) -> Response:
        """Generate a map of the knowledge network."""

        stats = {
            "total_nodes": 0,
            "types": {},
            "recent_additions": 0,
        }

        try:
            if hasattr(self.agent, 'memory') and self.agent.memory:
                # Get a sample of memories
                memories = await self.agent.memory.search(query="*", limit=50)
                stats["total_nodes"] = len(memories)

                for mem in memories:
                    mem_type = mem.get("metadata", {}).get("type", "general")
                    stats["types"][mem_type] = stats["types"].get(mem_type, 0) + 1

                    timestamp = mem.get("metadata", {}).get("timestamp", 0)
                    if time.time() - timestamp < 3600:  # Last hour
                        stats["recent_additions"] += 1
        except Exception:
            pass

        formatted = ["## 🗺️ Knowledge Network Map\n"]
        formatted.append(f"**Total Nodes:** {stats['total_nodes']}")
        formatted.append(f"**Recent Additions (1h):** {stats['recent_additions']}\n")
        formatted.append("### Node Types:")
        for node_type, count in sorted(stats["types"].items(), key=lambda x: -x[1]):
            bar = "█" * min(count, 20)
            formatted.append(f"  {node_type}: {bar} ({count})")

        return Response(
            message="\n".join(formatted),
            break_loop=False
        )
