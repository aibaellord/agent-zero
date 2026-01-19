from python.helpers import knowledge_graph as kg
from python.helpers.tool import Response, Tool


class KnowledgeGraph(Tool):
    """Tool for managing knowledge graphs with entities and relationships."""

    async def execute(self, **kwargs):
        operation = self.args.get("operation", "status")
        graph_name = self.args.get("graph", "default")

        graph = kg.get_knowledge_graph(graph_name)

        if operation == "add_entity":
            name = self.args.get("name", "")
            entity_type = self.args.get("type", "concept")
            properties = self.args.get("properties", {})

            entity = graph.add_entity(name, entity_type, properties)
            return Response(
                message=f"✅ Added entity '{name}' (type: {entity_type}, id: {entity.id})",
                break_loop=False
            )

        elif operation == "add_relationship":
            source = self.args.get("source", "")
            target = self.args.get("target", "")
            relation = self.args.get("relation", "related_to")

            source_entity = graph.find_entity_by_name(source)
            target_entity = graph.find_entity_by_name(target)

            if not source_entity or not target_entity:
                return Response(
                    message=f"❌ Entity not found. Source: {source}, Target: {target}",
                    break_loop=False
                )

            rel = graph.add_relationship(source_entity.id, target_entity.id, relation)
            return Response(
                message=f"✅ Added relationship: {source} --[{relation}]--> {target}",
                break_loop=False
            )

        elif operation == "add_triple":
            subject = self.args.get("subject", "")
            subject_type = self.args.get("subject_type", "concept")
            predicate = self.args.get("predicate", "related_to")
            obj = self.args.get("object", "")
            obj_type = self.args.get("object_type", "concept")

            s, r, o = graph.add_triple(subject, subject_type, predicate, obj, obj_type)
            return Response(
                message=f"✅ Added triple: {subject} --[{predicate}]--> {obj}",
                break_loop=False
            )

        elif operation == "query":
            pattern = self.args.get("pattern", "")
            results = graph.query(pattern)

            if results:
                result_str = "\n".join([str(r) for r in results[:10]])
                return Response(
                    message=f"📊 Query results ({len(results)} found):\n{result_str}",
                    break_loop=False
                )
            return Response(message="No results found for query.", break_loop=False)

        elif operation == "find_path":
            start = self.args.get("start", "")
            end = self.args.get("end", "")

            paths = graph.find_path(start, end)

            if paths:
                path_strs = [" → ".join(p) for p in paths[:5]]
                return Response(
                    message=f"🛤️ Paths from {start} to {end}:\n" + "\n".join(path_strs),
                    break_loop=False
                )
            return Response(message=f"No path found between {start} and {end}.", break_loop=False)

        elif operation == "infer":
            count = graph.run_inference()
            return Response(
                message=f"🧠 Inference complete. {count} new relationships inferred.",
                break_loop=False
            )

        elif operation == "patterns":
            patterns = graph.find_patterns()
            return Response(
                message=f"🔍 Pattern Analysis:\n" +
                        f"  Triangles: {len(patterns['triangles'])}\n" +
                        f"  Hubs: {patterns['hubs'][:5]}\n" +
                        f"  Cluster sizes: {patterns['clusters'][:5]}",
                break_loop=False
            )

        elif operation == "subgraph":
            entity_name = self.args.get("entity", "")
            depth = self.args.get("depth", 2)

            entity = graph.find_entity_by_name(entity_name)
            if not entity:
                return Response(message=f"Entity '{entity_name}' not found.", break_loop=False)

            subgraph = graph.get_subgraph(entity.id, depth)
            return Response(
                message=f"📊 Subgraph around '{entity_name}':\n" +
                        f"  Entities: {subgraph['entities'][:10]}\n" +
                        f"  Relationships: {len(subgraph['relationships'])}",
                break_loop=False
            )

        else:  # status
            stats = graph.get_statistics()
            graphs = kg.list_knowledge_graphs()

            return Response(
                message=f"📊 **Knowledge Graph Status**\n" +
                        f"Available graphs: {graphs}\n" +
                        f"Current graph: {graph_name}\n" +
                        f"Entities: {stats['total_entities']}\n" +
                        f"Relationships: {stats['total_relationships']}\n" +
                        f"Entity types: {stats['entity_types']}\n" +
                        f"Relation types: {stats['relation_types']}",
                break_loop=False
            )
