"""
GUI AUTOMATION TOOL
===================
Hidden power tool for desktop automation.
"""

from python.helpers.gui_automation import get_gui_automation_engine
from python.helpers.tool import Response, Tool


class GUIAutomation(Tool):
    """GUI automation power tool"""

    async def execute(self, **kwargs):
        engine = get_gui_automation_engine()
        operation = self.args.get("operation", "status")

        if operation == "record":
            name = self.args.get("name", "workflow")
            result = engine.record(name)
            return Response(message=f"🎬 {result}", break_loop=False)

        elif operation == "stop":
            result = engine.stop_recording()
            return Response(message=f"⏹️ {result}", break_loop=False)

        elif operation == "play":
            name = self.args.get("name")
            if not name:
                return Response(message="❌ Workflow name required", break_loop=False)

            result = await engine.play(name)
            if "error" in result:
                return Response(message=f"❌ {result['error']}", break_loop=False)

            return Response(
                message=f"""▶️ **Workflow '{name}' Executed**

Completed: {result['completed']}/{result['total_steps']}
Failed: {result['failed']}""",
                break_loop=False
            )

        elif operation == "action":
            action = self.args.get("action")
            target = self.args.get("target")
            params = self.args.get("params", {})

            result = await engine.quick_action(action, target, **params)
            status = "✅" if result["success"] else "❌"
            return Response(
                message=f"{status} Action '{action}' on '{target}'",
                break_loop=False
            )

        elif operation == "list":
            workflows = engine.list_workflows()
            if not workflows:
                return Response(message="📋 No saved workflows", break_loop=False)

            return Response(
                message=f"📋 **Saved Workflows:**\n" +
                "\n".join(f"  • {w}" for w in workflows),
                break_loop=False
            )

        elif operation == "export":
            name = self.args.get("name")
            data = engine.export_workflow(name)
            if not data:
                return Response(message=f"❌ Workflow '{name}' not found", break_loop=False)
            return Response(message=f"📤 **Workflow '{name}':**\n```json\n{data}\n```", break_loop=False)

        elif operation == "import":
            name = self.args.get("name")
            data = self.args.get("data")
            result = engine.import_workflow(name, data)
            return Response(message=f"📥 {result}", break_loop=False)

        elif operation == "status":
            status = engine.get_status()
            return Response(
                message=f"""🖥️ **GUI Automation Status**

- Saved Workflows: {status['saved_workflows']}
- Total Executions: {status['total_executions']}
- Recording: {'Yes' if status['recording'] else 'No'}
- Current Workflow: {status['current_workflow'] or 'None'}

**Available Workflows:**
{chr(10).join('  • ' + w for w in status['workflow_names']) if status['workflow_names'] else '  (none)'}""",
                break_loop=False
            )

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: record, stop, play, action, list, export, import, status",
                break_loop=False
            )
