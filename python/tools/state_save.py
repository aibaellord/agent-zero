from python.helpers import state_serializer as ss
from python.helpers.tool import Response, Tool


class StateSave(Tool):
    """Tool for saving and restoring agent state with checkpoints."""

    async def execute(self, **kwargs):
        operation = self.args.get("operation", "status")

        serializer = ss.get_state_serializer()

        if operation == "set":
            key = self.args.get("key", "")
            value = self.args.get("value")

            if not key:
                return Response(message="❌ Key required.", break_loop=False)

            serializer.set_state(key, value)
            return Response(
                message=f"✅ State set: {key} = {str(value)[:50]}",
                break_loop=False
            )

        elif operation == "get":
            key = self.args.get("key", "")
            default = self.args.get("default")

            value = serializer.get_state(key, default)
            return Response(
                message=f"📦 State[{key}] = {str(value)[:200]}",
                break_loop=False
            )

        elif operation == "checkpoint":
            name = self.args.get("name", "checkpoint")
            compress = self.args.get("compress", False)

            checkpoint = serializer.create_checkpoint(name, compress)
            return Response(
                message=f"💾 Checkpoint created:\n" +
                        f"  ID: {checkpoint.id}\n" +
                        f"  Name: {checkpoint.name}\n" +
                        f"  Size: {checkpoint.get_size()} bytes",
                break_loop=False
            )

        elif operation == "restore":
            checkpoint_id = self.args.get("checkpoint_id", "")

            if not checkpoint_id:
                return Response(
                    message="❌ checkpoint_id required.",
                    break_loop=False
                )

            success = serializer.restore_checkpoint(checkpoint_id)
            if success:
                return Response(
                    message=f"✅ State restored from checkpoint: {checkpoint_id}",
                    break_loop=False
                )
            return Response(
                message=f"❌ Checkpoint not found: {checkpoint_id}",
                break_loop=False
            )

        elif operation == "rollback":
            steps = self.args.get("steps", 1)

            success = serializer.rollback(steps)
            if success:
                return Response(
                    message=f"⏪ Rolled back {steps} checkpoint(s).",
                    break_loop=False
                )
            return Response(
                message=f"❌ Cannot rollback {steps} steps (not enough checkpoints).",
                break_loop=False
            )

        elif operation == "list":
            checkpoints = serializer.list_checkpoints()

            if checkpoints:
                cp_list = "\n".join([
                    f"  - {cp['id']}: {cp['name']} ({cp['size']} bytes)"
                    for cp in checkpoints[-10:]
                ])
                return Response(
                    message=f"📋 Checkpoints:\n{cp_list}",
                    break_loop=False
                )
            return Response(message="No checkpoints available.", break_loop=False)

        elif operation == "changes":
            count = self.args.get("count", 10)
            changes = serializer.get_recent_changes(count)

            if changes:
                change_list = "\n".join([
                    f"  - [{c['operation']}] {c['key']}"
                    for c in changes
                ])
                return Response(
                    message=f"📝 Recent changes:\n{change_list}",
                    break_loop=False
                )
            return Response(message="No changes recorded.", break_loop=False)

        elif operation == "export":
            compress = self.args.get("compress", True)
            data = serializer.export_state(compress)
            return Response(
                message=f"📤 State exported ({len(data)} chars, compressed: {compress})",
                break_loop=False
            )

        else:  # status
            stats = serializer.get_statistics()

            return Response(
                message=f"📊 **State Serializer Status**\n" +
                        f"Current state keys: {stats['current_state_keys']}\n" +
                        f"Total checkpoints: {stats['total_checkpoints']}\n" +
                        f"Total changes: {stats['total_changes']}\n" +
                        f"Checkpoint size: {stats['total_checkpoint_size']} bytes\n" +
                        f"Newest: {stats['newest_checkpoint']}",
                break_loop=False
            )
