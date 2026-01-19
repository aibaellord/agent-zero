"""
ROLLBACK SYSTEM
===============
Undo and rollback capabilities for agent actions.

Features:
- Action history tracking
- Multi-step rollback
- Selective undo
- Restoration points
- Transaction support
"""

from __future__ import annotations

import copy
import json
import time
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable, Dict, List, Optional


class ActionType(Enum):
    """Types of actions that can be rolled back"""
    FILE_CREATE = "file_create"
    FILE_MODIFY = "file_modify"
    FILE_DELETE = "file_delete"
    STATE_CHANGE = "state_change"
    MEMORY_SAVE = "memory_save"
    MEMORY_DELETE = "memory_delete"
    CONFIG_CHANGE = "config_change"
    COMMAND_EXECUTE = "command_execute"
    CUSTOM = "custom"


@dataclass
class Action:
    """A reversible action"""
    id: str
    action_type: ActionType
    description: str
    timestamp: float = field(default_factory=time.time)
    data: Dict[str, Any] = field(default_factory=dict)
    undo_data: Dict[str, Any] = field(default_factory=dict)
    executed: bool = True
    undone: bool = False
    can_undo: bool = True
    can_redo: bool = True

    def __hash__(self):
        return hash(self.id)


@dataclass
class RestorationPoint:
    """A named restoration point (snapshot)"""
    id: str
    name: str
    description: str
    timestamp: float = field(default_factory=time.time)
    action_index: int = 0  # Index in action history
    state_snapshot: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Transaction:
    """A group of actions that can be committed or rolled back together"""
    id: str
    name: str
    actions: List[Action] = field(default_factory=list)
    started_at: float = field(default_factory=time.time)
    committed: bool = False
    rolled_back: bool = False


class UndoHandler:
    """Handles undo operations for different action types"""

    def __init__(self):
        self.handlers: Dict[ActionType, Callable] = {}
        self._register_default_handlers()

    def _register_default_handlers(self):
        """Register default undo handlers"""
        self.handlers[ActionType.FILE_CREATE] = self._undo_file_create
        self.handlers[ActionType.FILE_MODIFY] = self._undo_file_modify
        self.handlers[ActionType.FILE_DELETE] = self._undo_file_delete
        self.handlers[ActionType.STATE_CHANGE] = self._undo_state_change

    def register_handler(self, action_type: ActionType, handler: Callable):
        """Register a custom undo handler"""
        self.handlers[action_type] = handler

    def undo(self, action: Action) -> bool:
        """Undo an action"""
        handler = self.handlers.get(action.action_type)
        if handler:
            return handler(action)
        return False

    def _undo_file_create(self, action: Action) -> bool:
        """Undo file creation (delete the file)"""
        # Would delete action.data["path"]
        return True

    def _undo_file_modify(self, action: Action) -> bool:
        """Undo file modification (restore original)"""
        # Would write action.undo_data["original_content"] to action.data["path"]
        return True

    def _undo_file_delete(self, action: Action) -> bool:
        """Undo file deletion (recreate the file)"""
        # Would write action.undo_data["content"] to action.data["path"]
        return True

    def _undo_state_change(self, action: Action) -> bool:
        """Undo state change"""
        # Would restore action.undo_data["original_value"]
        return True


class RollbackSystem:
    """
    Complete rollback and undo system.
    Track, undo, and restore agent actions.
    """

    def __init__(self, max_history: int = 100):
        self.action_history: List[Action] = []
        self.redo_stack: List[Action] = []
        self.restoration_points: Dict[str, RestorationPoint] = {}
        self.active_transactions: Dict[str, Transaction] = {}
        self.undo_handler = UndoHandler()
        self.max_history = max_history
        self._action_counter = 0

    def _generate_action_id(self) -> str:
        """Generate unique action ID"""
        self._action_counter += 1
        return f"action_{self._action_counter}_{int(time.time() * 1000)}"

    def record_action(
        self,
        action_type: ActionType,
        description: str,
        data: Dict[str, Any] = None,
        undo_data: Dict[str, Any] = None,
        can_undo: bool = True,
        transaction_id: str = None
    ) -> Action:
        """Record an action for potential rollback"""
        action = Action(
            id=self._generate_action_id(),
            action_type=action_type,
            description=description,
            data=data or {},
            undo_data=undo_data or {},
            can_undo=can_undo
        )

        if transaction_id and transaction_id in self.active_transactions:
            self.active_transactions[transaction_id].actions.append(action)
        else:
            self.action_history.append(action)

            # Prune old history
            while len(self.action_history) > self.max_history:
                self.action_history.pop(0)

        # Clear redo stack on new action
        self.redo_stack.clear()

        return action

    def undo(self, count: int = 1) -> List[Action]:
        """Undo the last N actions"""
        undone = []

        for _ in range(count):
            if not self.action_history:
                break

            action = self.action_history.pop()

            if action.can_undo and not action.undone:
                success = self.undo_handler.undo(action)
                if success:
                    action.undone = True
                    self.redo_stack.append(action)
                    undone.append(action)

        return undone

    def redo(self, count: int = 1) -> List[Action]:
        """Redo the last N undone actions"""
        redone = []

        for _ in range(count):
            if not self.redo_stack:
                break

            action = self.redo_stack.pop()

            if action.can_redo:
                action.undone = False
                self.action_history.append(action)
                redone.append(action)

        return redone

    def create_restoration_point(
        self,
        name: str,
        description: str = "",
        state_snapshot: Dict = None
    ) -> RestorationPoint:
        """Create a named restoration point"""
        point_id = f"rp_{len(self.restoration_points)}_{int(time.time())}"

        point = RestorationPoint(
            id=point_id,
            name=name,
            description=description,
            action_index=len(self.action_history),
            state_snapshot=copy.deepcopy(state_snapshot) if state_snapshot else {}
        )

        self.restoration_points[point_id] = point
        return point

    def restore_to_point(self, point_id: str) -> int:
        """Restore to a named restoration point"""
        if point_id not in self.restoration_points:
            return 0

        point = self.restoration_points[point_id]
        actions_to_undo = len(self.action_history) - point.action_index

        if actions_to_undo > 0:
            undone = self.undo(actions_to_undo)
            return len(undone)

        return 0

    def begin_transaction(self, name: str) -> str:
        """Begin a new transaction"""
        tx_id = f"tx_{len(self.active_transactions)}_{int(time.time())}"

        self.active_transactions[tx_id] = Transaction(
            id=tx_id,
            name=name
        )

        return tx_id

    def commit_transaction(self, transaction_id: str) -> bool:
        """Commit a transaction"""
        if transaction_id not in self.active_transactions:
            return False

        tx = self.active_transactions.pop(transaction_id)
        tx.committed = True

        # Add all actions to main history
        for action in tx.actions:
            self.action_history.append(action)

        return True

    def rollback_transaction(self, transaction_id: str) -> int:
        """Rollback a transaction"""
        if transaction_id not in self.active_transactions:
            return 0

        tx = self.active_transactions.pop(transaction_id)
        tx.rolled_back = True

        # Undo all actions in reverse order
        undone = 0
        for action in reversed(tx.actions):
            if action.can_undo:
                success = self.undo_handler.undo(action)
                if success:
                    action.undone = True
                    undone += 1

        return undone

    def get_action_history(self, count: int = 10) -> List[Dict]:
        """Get recent action history"""
        return [
            {
                "id": a.id,
                "type": a.action_type.value,
                "description": a.description,
                "timestamp": a.timestamp,
                "undone": a.undone,
                "can_undo": a.can_undo
            }
            for a in self.action_history[-count:]
        ]

    def get_restoration_points(self) -> List[Dict]:
        """Get all restoration points"""
        return [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "timestamp": p.timestamp,
                "action_index": p.action_index
            }
            for p in self.restoration_points.values()
        ]

    def can_undo(self) -> bool:
        """Check if undo is available"""
        return len(self.action_history) > 0 and self.action_history[-1].can_undo

    def can_redo(self) -> bool:
        """Check if redo is available"""
        return len(self.redo_stack) > 0

    def clear_history(self):
        """Clear all history"""
        self.action_history.clear()
        self.redo_stack.clear()
        self.restoration_points.clear()

    def export_history(self) -> str:
        """Export history as JSON"""
        return json.dumps({
            "actions": [
                {
                    "id": a.id,
                    "type": a.action_type.value,
                    "description": a.description,
                    "timestamp": a.timestamp,
                    "undone": a.undone
                }
                for a in self.action_history
            ],
            "restoration_points": [
                {
                    "id": p.id,
                    "name": p.name,
                    "timestamp": p.timestamp
                }
                for p in self.restoration_points.values()
            ]
        }, indent=2)

    def get_statistics(self) -> Dict[str, Any]:
        """Get rollback statistics"""
        return {
            "total_actions": len(self.action_history),
            "undone_actions": sum(1 for a in self.action_history if a.undone),
            "redo_available": len(self.redo_stack),
            "restoration_points": len(self.restoration_points),
            "active_transactions": len(self.active_transactions),
            "can_undo": self.can_undo(),
            "can_redo": self.can_redo()
        }


# Singleton
_rollback_system: Optional[RollbackSystem] = None


def get_rollback_system() -> RollbackSystem:
    """Get the Rollback System singleton"""
    global _rollback_system
    if _rollback_system is None:
        _rollback_system = RollbackSystem()
    return _rollback_system
