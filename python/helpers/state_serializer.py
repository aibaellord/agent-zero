"""
STATE SERIALIZATION SYSTEM
==========================
Save and restore complete agent state.

Features:
- Checkpoint creation
- State restoration
- Rollback capabilities
- Version control
- Differential saves
"""

from __future__ import annotations

import base64
import gzip
import hashlib
import json
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class Checkpoint:
    """A saved state checkpoint"""
    id: str
    name: str
    timestamp: float
    state: Dict[str, Any]
    metadata: Dict[str, Any] = field(default_factory=dict)
    parent_id: Optional[str] = None
    compressed: bool = False

    def get_size(self) -> int:
        """Get checkpoint size in bytes"""
        return len(json.dumps(self.state))


@dataclass
class StateChange:
    """Represents a change in state"""
    timestamp: float
    key: str
    old_value: Any
    new_value: Any
    operation: str  # set, delete, append


class StateDiff:
    """Computes differences between states"""

    @staticmethod
    def compute(old_state: Dict, new_state: Dict) -> List[StateChange]:
        """Compute changes from old to new state"""
        changes = []
        timestamp = time.time()

        all_keys = set(old_state.keys()) | set(new_state.keys())

        for key in all_keys:
            old_val = old_state.get(key)
            new_val = new_state.get(key)

            if key not in old_state:
                changes.append(StateChange(
                    timestamp=timestamp,
                    key=key,
                    old_value=None,
                    new_value=new_val,
                    operation="set"
                ))
            elif key not in new_state:
                changes.append(StateChange(
                    timestamp=timestamp,
                    key=key,
                    old_value=old_val,
                    new_value=None,
                    operation="delete"
                ))
            elif old_val != new_val:
                changes.append(StateChange(
                    timestamp=timestamp,
                    key=key,
                    old_value=old_val,
                    new_value=new_val,
                    operation="set"
                ))

        return changes

    @staticmethod
    def apply(state: Dict, changes: List[StateChange]) -> Dict:
        """Apply changes to state"""
        result = state.copy()

        for change in changes:
            if change.operation == "delete":
                result.pop(change.key, None)
            elif change.operation == "set":
                result[change.key] = change.new_value
            elif change.operation == "append":
                if change.key in result and isinstance(result[change.key], list):
                    result[change.key].append(change.new_value)

        return result


class StateSerializer:
    """
    Complete state serialization system.
    Save, restore, and manage agent state.
    """

    def __init__(self, max_checkpoints: int = 50):
        self.checkpoints: Dict[str, Checkpoint] = {}
        self.checkpoint_order: List[str] = []
        self.current_state: Dict[str, Any] = {}
        self.max_checkpoints = max_checkpoints
        self.change_log: List[StateChange] = []
        self.auto_save_interval = 300  # 5 minutes
        self.last_auto_save = time.time()

    def _generate_id(self, name: str) -> str:
        """Generate checkpoint ID"""
        content = f"{name}:{time.time()}"
        return hashlib.md5(content.encode()).hexdigest()[:12]

    def _compress(self, data: str) -> str:
        """Compress state data"""
        compressed = gzip.compress(data.encode())
        return base64.b64encode(compressed).decode()

    def _decompress(self, data: str) -> str:
        """Decompress state data"""
        compressed = base64.b64decode(data.encode())
        return gzip.decompress(compressed).decode()

    def set_state(self, key: str, value: Any):
        """Set a state value"""
        old_value = self.current_state.get(key)
        self.current_state[key] = value

        self.change_log.append(StateChange(
            timestamp=time.time(),
            key=key,
            old_value=old_value,
            new_value=value,
            operation="set"
        ))

        # Auto-save check
        if time.time() - self.last_auto_save > self.auto_save_interval:
            self.create_checkpoint("auto_save")
            self.last_auto_save = time.time()

    def get_state(self, key: str, default: Any = None) -> Any:
        """Get a state value"""
        return self.current_state.get(key, default)

    def delete_state(self, key: str):
        """Delete a state value"""
        if key in self.current_state:
            old_value = self.current_state.pop(key)
            self.change_log.append(StateChange(
                timestamp=time.time(),
                key=key,
                old_value=old_value,
                new_value=None,
                operation="delete"
            ))

    def create_checkpoint(self, name: str,
                          compress: bool = False,
                          metadata: Dict = None) -> Checkpoint:
        """Create a state checkpoint"""
        checkpoint_id = self._generate_id(name)

        # Get parent (last checkpoint)
        parent_id = self.checkpoint_order[-1] if self.checkpoint_order else None

        # Copy state
        state = json.loads(json.dumps(self.current_state))

        if compress:
            state = {"_compressed": self._compress(json.dumps(state))}

        checkpoint = Checkpoint(
            id=checkpoint_id,
            name=name,
            timestamp=time.time(),
            state=state,
            metadata=metadata or {},
            parent_id=parent_id,
            compressed=compress
        )

        self.checkpoints[checkpoint_id] = checkpoint
        self.checkpoint_order.append(checkpoint_id)

        # Prune old checkpoints
        while len(self.checkpoints) > self.max_checkpoints:
            oldest_id = self.checkpoint_order.pop(0)
            del self.checkpoints[oldest_id]

        return checkpoint

    def restore_checkpoint(self, checkpoint_id: str) -> bool:
        """Restore state from checkpoint"""
        if checkpoint_id not in self.checkpoints:
            return False

        checkpoint = self.checkpoints[checkpoint_id]
        state = checkpoint.state

        if checkpoint.compressed and "_compressed" in state:
            state = json.loads(self._decompress(state["_compressed"]))

        self.current_state = json.loads(json.dumps(state))

        self.change_log.append(StateChange(
            timestamp=time.time(),
            key="_restore",
            old_value=None,
            new_value=checkpoint_id,
            operation="restore"
        ))

        return True

    def rollback(self, steps: int = 1) -> bool:
        """Rollback to previous checkpoint"""
        if len(self.checkpoint_order) < steps:
            return False

        target_idx = len(self.checkpoint_order) - 1 - steps
        target_id = self.checkpoint_order[target_idx]

        return self.restore_checkpoint(target_id)

    def get_checkpoint(self, checkpoint_id: str) -> Optional[Checkpoint]:
        """Get checkpoint by ID"""
        return self.checkpoints.get(checkpoint_id)

    def list_checkpoints(self) -> List[Dict]:
        """List all checkpoints"""
        return [
            {
                "id": cp.id,
                "name": cp.name,
                "timestamp": cp.timestamp,
                "size": cp.get_size(),
                "compressed": cp.compressed
            }
            for cp in [self.checkpoints[cid] for cid in self.checkpoint_order]
        ]

    def get_recent_changes(self, count: int = 10) -> List[Dict]:
        """Get recent state changes"""
        return [
            {
                "timestamp": c.timestamp,
                "key": c.key,
                "operation": c.operation
            }
            for c in self.change_log[-count:]
        ]

    def export_state(self, compress: bool = True) -> str:
        """Export complete state as JSON"""
        data = {
            "current_state": self.current_state,
            "checkpoints": [
                {
                    "id": cp.id,
                    "name": cp.name,
                    "timestamp": cp.timestamp,
                    "parent_id": cp.parent_id,
                    "metadata": cp.metadata
                }
                for cp in [self.checkpoints[cid] for cid in self.checkpoint_order]
            ],
            "exported_at": time.time()
        }

        result = json.dumps(data, indent=2)

        if compress:
            return self._compress(result)
        return result

    def import_state(self, data: str, compressed: bool = True):
        """Import state from JSON"""
        if compressed:
            data = self._decompress(data)

        parsed = json.loads(data)
        self.current_state = parsed.get("current_state", {})

    def get_statistics(self) -> Dict[str, Any]:
        """Get serialization statistics"""
        total_size = sum(cp.get_size() for cp in self.checkpoints.values())

        return {
            "current_state_keys": len(self.current_state),
            "total_checkpoints": len(self.checkpoints),
            "total_changes": len(self.change_log),
            "total_checkpoint_size": total_size,
            "oldest_checkpoint": self.checkpoint_order[0] if self.checkpoint_order else None,
            "newest_checkpoint": self.checkpoint_order[-1] if self.checkpoint_order else None
        }


# Singleton
_state_serializer: Optional[StateSerializer] = None


def get_state_serializer() -> StateSerializer:
    """Get the State Serializer singleton"""
    global _state_serializer
    if _state_serializer is None:
        _state_serializer = StateSerializer()
    return _state_serializer
