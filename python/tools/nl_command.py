from python.helpers import nl_command as nlc
from python.helpers.tool import Response, Tool


class NaturalCommand(Tool):
    """Tool for parsing and executing natural language commands."""

    async def execute(self, **kwargs):
        operation = self.args.get("operation", "parse")

        parser = nlc.get_command_parser()

        if operation == "parse":
            input_text = self.args.get("input", "")

            if not input_text:
                return Response(
                    message="❌ Input text required.",
                    break_loop=False
                )

            parsed = parser.parse(input_text)

            if parsed:
                return Response(
                    message=f"✅ **Parsed Command**\n" +
                            f"  Command: {parsed.command.name}\n" +
                            f"  Confidence: {parsed.confidence:.0%}\n" +
                            f"  Category: {parsed.command.category}\n" +
                            f"  Parameters: {parsed.parameters}\n" +
                            f"  Entities: {parsed.entities}",
                    break_loop=False
                )
            return Response(
                message=f"⚠️ Could not parse: '{input_text}'\n" +
                        f"Suggestions: {parser.suggest_commands(input_text)}",
                break_loop=False
            )

        elif operation == "help":
            command_name = self.args.get("command", "")

            help_text = parser.get_help(command_name if command_name else None)

            return Response(
                message=f"📚 **Help**\n{help_text}",
                break_loop=False
            )

        elif operation == "suggest":
            input_text = self.args.get("input", "")
            limit = self.args.get("limit", 3)

            suggestions = parser.suggest_commands(input_text, limit)

            return Response(
                message=f"💡 Suggestions for '{input_text}':\n" +
                        f"  {', '.join(suggestions) if suggestions else 'No suggestions'}",
                break_loop=False
            )

        elif operation == "register":
            name = self.args.get("name", "")
            patterns = self.args.get("patterns", [])
            description = self.args.get("description", "")
            examples = self.args.get("examples", [])
            category = self.args.get("category", "custom")

            if not name:
                return Response(
                    message="❌ Command name required.",
                    break_loop=False
                )

            command = nlc.Command(
                name=name,
                patterns=patterns,
                description=description,
                examples=examples,
                category=category
            )
            parser.register_command(command)

            return Response(
                message=f"✅ Registered command: {name}\n" +
                        f"  Category: {category}\n" +
                        f"  Patterns: {len(patterns)}\n" +
                        f"  Examples: {examples}",
                break_loop=False
            )

        elif operation == "categories":
            categories = parser.get_command_categories()

            cat_list = "\n".join([
                f"  **{cat}**: {', '.join(cmds)}"
                for cat, cmds in categories.items()
            ])

            return Response(
                message=f"📂 **Command Categories**\n{cat_list}",
                break_loop=False
            )

        elif operation == "list":
            categories = parser.get_command_categories()
            total = sum(len(cmds) for cmds in categories.values())

            return Response(
                message=f"📋 **Available Commands** ({total} total)\n" +
                        "\n".join([
                            f"{cat}: {len(cmds)} commands"
                            for cat, cmds in categories.items()
                        ]),
                break_loop=False
            )

        else:  # status
            stats = parser.get_statistics()

            return Response(
                message=f"📊 **NL Command Parser Status**\n" +
                        f"Total commands: {stats['total_commands']}\n" +
                        f"Categories: {stats['categories']}\n" +
                        f"History size: {stats['history_size']}\n" +
                        f"Avg confidence: {stats['avg_confidence']:.0%}",
                break_loop=False
            )
