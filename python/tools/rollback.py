from python.helpers import rollback_system as rs
from python.helpers.tool import Response, Tool


class Rollback(Tool):
    """Tool for undoing and rolling back agent actions."""

    async def execute(self, **kwargs):
        operation = self.args.get("operation", "status")

        rollback = rs.get_rollback_system()

        if operation == "record":
            action_type = self.args.get("type", "custom")
            description = self.args.get("description", "")
            data = self.args.get("data", {})
            undo_data = self.args.get("undo_data", {})

            try:
                at = rs.ActionType(action_type)
            except ValueError:
                at = rs.ActionType.CUSTOM

            action = rollback.record_action(at, description, data, undo_data)

            return Response(
                message=f"📝 Recorded action:\n" +
                        f"  ID: {action.id}\n" +
                        f"  Type: {action_type}\n" +
                        f"  Description: {description}",
                break_loop=False
            )

        elif operation == "undo":
            count = self.args.get("count", 1)

            undone = rollback.undo(count)

            if undone:
                action_list = "\n".join([
                    f"  - {a.description[:50]}"
                    for a in undone
                ])
                return Response(
                    message=f"⏪ Undone {len(undone)} action(s):\n{action_list}",
                    break_loop=False
                )
            return Response(
                message="⚠️ Nothing to undo.",
                break_loop=False
            )

        elif operation == "redo":
            count = self.args.get("count", 1)

            redone = rollback.redo(count)

            if redone:
                action_list = "\n".join([
                    f"  - {a.description[:50]}"
                    for a in redone
                ])
                return Response(
                    message=f"⏩ Redone {len(redone)} action(s):\n{action_list}",
                    break_loop=False
                )
            return Response(
                message="⚠️ Nothing to redo.",
                break_loop=False
            )

        elif operation == "save_point":
            name = self.args.get("name", "")
            description = self.args.get("description", "")

            if not name:
                return Response(
                    message="❌ Restoration point name required.",
                    break_loop=False
                )

            point = rollback.create_restoration_point(name, description)

            return Response(
                message=f"💾 Created restoration point:\n" +
                        f"  ID: {point.id}\n" +
                        f"  Name: {point.name}\n" +
                        f"  Action index: {point.action_index}",
                break_loop=False
            )

        elif operation == "restore":
            point_id = self.args.get("point_id", "")

            if not point_id:
                return Response(
                    message="❌ Restoration point ID required.",
                    break_loop=False
                )

            count = rollback.restore_to_point(point_id)

            if count > 0:
                return Response(
                    message=f"✅ Restored to point {point_id}. Undone {count} actions.",
                    break_loop=False
                )
            return Response(
                message=f"⚠️ Already at or before restoration point.",
                break_loop=False
            )

        elif operation == "transaction_start":
            name = self.args.get("name", "transaction")

            tx_id = rollback.begin_transaction(name)

            return Response(
                message=f"🔄 Transaction started: {tx_id}",
                break_loop=False
            )

        elif operation == "transaction_commit":
            tx_id = self.args.get("transaction_id", "")

            if not tx_id:
                return Response(
                    message="❌ Transaction ID required.",
                    break_loop=False
                )

            success = rollback.commit_transaction(tx_id)

            if success:
                return Response(
                    message=f"✅ Transaction committed: {tx_id}",
                    break_loop=False
                )
            return Response(
                message=f"❌ Transaction not found: {tx_id}",
                break_loop=False
            )

        elif operation == "transaction_rollback":
            tx_id = self.args.get("transaction_id", "")

            if not tx_id:
                return Response(
                    message="❌ Transaction ID required.",
                    break_loop=False
                )

            count = rollback.rollback_transaction(tx_id)

            return Response(
                message=f"↩️ Transaction rolled back. {count} actions undone.",
                break_loop=False
            )

        elif operation == "history":
            count = self.args.get("count", 10)
            history = rollback.get_action_history(count)

            if history:
                action_list = "\n".join([
                    f"  {'↩️' if h['undone'] else '✓'} {h['description'][:40]} ({h['type']})"
                    for h in history
                ])
                return Response(
                    message=f"📋 Action history:\n{action_list}",
                    break_loop=False
                )
            return Response(message="No actions recorded.", break_loop=False)

        elif operation == "points":
            points = rollback.get_restoration_points()

            if points:
                point_list = "\n".join([
                    f"  - {p['id']}: {p['name']}"
                    for p in points
                ])
                return Response(
                    message=f"📍 Restoration points:\n{point_list}",
                    break_loop=False
                )
            return Response(message="No restoration points.", break_loop=False)

        else:  # status
            stats = rollback.get_statistics()

            return Response(
                message=f"📊 **Rollback System Status**\n" +
                        f"Total actions: {stats['total_actions']}\n" +
                        f"Undone: {stats['undone_actions']}\n" +
                        f"Redo available: {stats['redo_available']}\n" +
                        f"Restoration points: {stats['restoration_points']}\n" +
                        f"Active transactions: {stats['active_transactions']}\n" +
                        f"Can undo: {'Yes' if stats['can_undo'] else 'No'}\n" +
                        f"Can redo: {'Yes' if stats['can_redo'] else 'No'}",
                break_loop=False
            )
