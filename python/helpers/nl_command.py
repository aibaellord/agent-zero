"""
NATURAL LANGUAGE COMMAND INTERFACE
==================================
Parse and execute natural language commands.

Features:
- Command parsing
- Intent recognition
- Entity extraction
- Command routing
- Help system
- Fuzzy matching
"""

from __future__ import annotations

import difflib
import re
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


@dataclass
class Command:
    """A registered command"""
    name: str
    patterns: List[str]  # Regex patterns
    handler: Optional[Callable] = None
    description: str = ""
    examples: List[str] = field(default_factory=list)
    parameters: List[Dict] = field(default_factory=list)
    aliases: List[str] = field(default_factory=list)
    category: str = "general"


@dataclass
class ParsedCommand:
    """Result of parsing a command"""
    command: Command
    raw_input: str
    matched_pattern: str
    confidence: float
    entities: Dict[str, Any]
    parameters: Dict[str, Any]


@dataclass
class Intent:
    """Recognized user intent"""
    name: str
    confidence: float
    entities: Dict[str, Any]


class EntityExtractor:
    """Extracts entities from natural language"""

    # Common patterns
    PATTERNS = {
        "file_path": r'["\']?([/\w\-\.]+\.[a-zA-Z]{2,4})["\']?',
        "url": r'https?://[^\s]+',
        "email": r'[\w\.-]+@[\w\.-]+\.\w+',
        "number": r'\b(\d+(?:\.\d+)?)\b',
        "date": r'\b(\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{2,4})\b',
        "time": r'\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\b',
        "quoted": r'"([^"]+)"|\'([^\']+)\'',
        "variable": r'\$\{?(\w+)\}?',
        "command_name": r'\b([a-z_][a-z0-9_]*)\b'
    }

    def extract(self, text: str) -> Dict[str, List[str]]:
        """Extract all entities from text"""
        entities = {}

        for entity_type, pattern in self.PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Flatten tuple matches
                flat_matches = []
                for m in matches:
                    if isinstance(m, tuple):
                        flat_matches.extend([x for x in m if x])
                    else:
                        flat_matches.append(m)
                entities[entity_type] = flat_matches

        return entities

    def extract_parameters(self, text: str,
                          expected: List[Dict]) -> Dict[str, Any]:
        """Extract expected parameters"""
        params = {}

        for param in expected:
            name = param["name"]
            param_type = param.get("type", "string")
            pattern = param.get("pattern")

            if pattern:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    value = match.group(1) if match.groups() else match.group(0)
                    params[name] = self._convert_type(value, param_type)
            else:
                # Try to extract by type
                entities = self.extract(text)
                if param_type == "number" and "number" in entities:
                    params[name] = float(entities["number"][0])
                elif param_type == "file" and "file_path" in entities:
                    params[name] = entities["file_path"][0]
                elif param_type == "url" and "url" in entities:
                    params[name] = entities["url"][0]

        return params

    def _convert_type(self, value: str, type_name: str) -> Any:
        """Convert value to specified type"""
        if type_name == "number":
            try:
                return float(value)
            except ValueError:
                return value
        elif type_name == "bool":
            return value.lower() in ("true", "yes", "1", "on")
        return value


class IntentRecognizer:
    """Recognizes user intent from natural language"""

    # Intent patterns
    INTENT_PATTERNS = {
        "create": [
            r'\b(create|make|new|generate|build|add)\b',
            r'\b(write|compose|draft)\b'
        ],
        "delete": [
            r'\b(delete|remove|destroy|erase|drop)\b',
            r'\b(get rid of|clear)\b'
        ],
        "update": [
            r'\b(update|modify|change|edit|alter)\b',
            r'\b(fix|patch|revise)\b'
        ],
        "read": [
            r'\b(read|show|display|get|fetch|view)\b',
            r'\b(list|find|search|look)\b'
        ],
        "run": [
            r'\b(run|execute|start|launch|invoke)\b',
            r'\b(call|trigger|fire)\b'
        ],
        "stop": [
            r'\b(stop|halt|terminate|kill|end|abort)\b',
            r'\b(cancel|interrupt)\b'
        ],
        "help": [
            r'\b(help|assist|how to|what is|explain)\b',
            r'\bhow (do|can|should) I\b'
        ],
        "analyze": [
            r'\b(analyze|check|inspect|examine|review)\b',
            r'\b(diagnose|debug|test)\b'
        ],
        "configure": [
            r'\b(configure|setup|set|config)\b',
            r'\b(enable|disable|toggle)\b'
        ]
    }

    def recognize(self, text: str) -> List[Intent]:
        """Recognize intents in text"""
        intents = []
        text_lower = text.lower()

        for intent_name, patterns in self.INTENT_PATTERNS.items():
            score = 0.0

            for pattern in patterns:
                matches = re.findall(pattern, text_lower)
                score += len(matches) * 0.3

            if score > 0:
                intents.append(Intent(
                    name=intent_name,
                    confidence=min(score, 1.0),
                    entities={}
                ))

        return sorted(intents, key=lambda i: i.confidence, reverse=True)


class CommandParser:
    """
    Natural Language Command Interface.
    Parse and execute commands from natural language.
    """

    def __init__(self):
        self.commands: Dict[str, Command] = {}
        self.entity_extractor = EntityExtractor()
        self.intent_recognizer = IntentRecognizer()
        self.history: List[ParsedCommand] = []
        self._setup_default_commands()

    def _setup_default_commands(self):
        """Setup default commands"""
        defaults = [
            Command(
                name="help",
                patterns=[r'^help\s*(.*)$', r'^what can you do', r'^\?$'],
                description="Show help for commands",
                examples=["help", "help create", "what can you do"],
                category="system"
            ),
            Command(
                name="list_commands",
                patterns=[r'^(list|show)\s+commands?$', r'^commands$'],
                description="List all available commands",
                examples=["list commands", "show commands"],
                category="system"
            ),
            Command(
                name="status",
                patterns=[r'^status$', r'^show status$', r'^how are you'],
                description="Show system status",
                examples=["status", "show status"],
                category="system"
            ),
            Command(
                name="create_file",
                patterns=[
                    r'^create\s+(?:a\s+)?(?:new\s+)?file\s+(.+)$',
                    r'^make\s+(?:a\s+)?file\s+(.+)$'
                ],
                description="Create a new file",
                examples=["create file test.py", "make a new file example.txt"],
                parameters=[{"name": "filename", "type": "file"}],
                category="files"
            ),
            Command(
                name="run_code",
                patterns=[
                    r'^run\s+(.+)$',
                    r'^execute\s+(.+)$'
                ],
                description="Run code or command",
                examples=["run python test.py", "execute npm install"],
                parameters=[{"name": "command", "type": "string"}],
                category="execution"
            ),
            Command(
                name="search",
                patterns=[
                    r'^search\s+(?:for\s+)?(.+)$',
                    r'^find\s+(.+)$'
                ],
                description="Search for something",
                examples=["search for python tutorials", "find API documentation"],
                parameters=[{"name": "query", "type": "string"}],
                category="search"
            ),
            Command(
                name="analyze",
                patterns=[
                    r'^analyze\s+(.+)$',
                    r'^check\s+(.+)$'
                ],
                description="Analyze code or data",
                examples=["analyze this code", "check for errors"],
                parameters=[{"name": "target", "type": "string"}],
                category="analysis"
            )
        ]

        for cmd in defaults:
            self.register_command(cmd)

    def register_command(self, command: Command):
        """Register a command"""
        self.commands[command.name] = command
        for alias in command.aliases:
            self.commands[alias] = command

    def parse(self, input_text: str) -> Optional[ParsedCommand]:
        """Parse natural language input into command"""
        input_lower = input_text.strip().lower()

        # Try exact pattern matching first
        for cmd in self.commands.values():
            for pattern in cmd.patterns:
                match = re.match(pattern, input_lower, re.IGNORECASE)
                if match:
                    entities = self.entity_extractor.extract(input_text)
                    params = self.entity_extractor.extract_parameters(
                        input_text, cmd.parameters
                    )

                    # Add captured groups as parameters
                    for i, group in enumerate(match.groups()):
                        if group:
                            params[f"arg{i}"] = group

                    parsed = ParsedCommand(
                        command=cmd,
                        raw_input=input_text,
                        matched_pattern=pattern,
                        confidence=1.0,
                        entities=entities,
                        parameters=params
                    )
                    self.history.append(parsed)
                    return parsed

        # Try fuzzy matching
        best_match = self._fuzzy_match(input_text)
        if best_match:
            self.history.append(best_match)
            return best_match

        return None

    def _fuzzy_match(self, input_text: str) -> Optional[ParsedCommand]:
        """Try fuzzy matching for commands"""
        input_words = input_text.lower().split()
        best_cmd = None
        best_score = 0.0

        for cmd in self.commands.values():
            # Check name similarity
            name_score = difflib.SequenceMatcher(
                None, input_text.lower(), cmd.name
            ).ratio()

            # Check example similarity
            example_scores = [
                difflib.SequenceMatcher(None, input_text.lower(), ex.lower()).ratio()
                for ex in cmd.examples
            ]
            max_example_score = max(example_scores) if example_scores else 0

            # Check description words
            desc_words = cmd.description.lower().split()
            word_matches = sum(1 for w in input_words if w in desc_words)
            word_score = word_matches / max(len(input_words), 1)

            total_score = (name_score * 0.3 + max_example_score * 0.5 + word_score * 0.2)

            if total_score > best_score and total_score > 0.3:
                best_score = total_score
                best_cmd = cmd

        if best_cmd:
            entities = self.entity_extractor.extract(input_text)
            return ParsedCommand(
                command=best_cmd,
                raw_input=input_text,
                matched_pattern="fuzzy",
                confidence=best_score,
                entities=entities,
                parameters={}
            )

        return None

    def get_help(self, command_name: str = None) -> str:
        """Get help text"""
        if command_name:
            cmd = self.commands.get(command_name)
            if cmd:
                lines = [f"**{cmd.name}**: {cmd.description}"]
                if cmd.examples:
                    lines.append("Examples:")
                    for ex in cmd.examples:
                        lines.append(f"  - {ex}")
                if cmd.parameters:
                    lines.append("Parameters:")
                    for p in cmd.parameters:
                        lines.append(f"  - {p['name']}: {p.get('type', 'string')}")
                return "\n".join(lines)
            return f"Unknown command: {command_name}"

        # General help
        categories = {}
        for cmd in self.commands.values():
            cat = cmd.category
            if cat not in categories:
                categories[cat] = []
            if cmd.name not in [c.name for c in categories[cat]]:
                categories[cat].append(cmd)

        lines = ["**Available Commands**\n"]
        for cat, cmds in sorted(categories.items()):
            lines.append(f"\n**{cat.title()}**:")
            for cmd in cmds:
                lines.append(f"  - `{cmd.name}`: {cmd.description}")

        return "\n".join(lines)

    def suggest_commands(self, input_text: str, limit: int = 3) -> List[str]:
        """Suggest commands based on input"""
        intents = self.intent_recognizer.recognize(input_text)
        suggestions = []

        for intent in intents[:2]:
            for cmd in self.commands.values():
                if intent.name in cmd.description.lower():
                    suggestions.append(cmd.name)

        # Add fuzzy suggestions
        for cmd in self.commands.values():
            if cmd.name not in suggestions:
                score = difflib.SequenceMatcher(
                    None, input_text.lower(), cmd.description.lower()
                ).ratio()
                if score > 0.3:
                    suggestions.append(cmd.name)

        return suggestions[:limit]

    def get_command_categories(self) -> Dict[str, List[str]]:
        """Get commands organized by category"""
        categories = {}
        for cmd in self.commands.values():
            if cmd.category not in categories:
                categories[cmd.category] = []
            if cmd.name not in categories[cmd.category]:
                categories[cmd.category].append(cmd.name)
        return categories

    def get_statistics(self) -> Dict[str, Any]:
        """Get parser statistics"""
        return {
            "total_commands": len(set(c.name for c in self.commands.values())),
            "categories": len(self.get_command_categories()),
            "history_size": len(self.history),
            "avg_confidence": sum(p.confidence for p in self.history[-100:]) /
                            max(len(self.history[-100:]), 1)
        }


# Singleton
_command_parser: Optional[CommandParser] = None


def get_command_parser() -> CommandParser:
    """Get the Command Parser singleton"""
    global _command_parser
    if _command_parser is None:
        _command_parser = CommandParser()
    return _command_parser
