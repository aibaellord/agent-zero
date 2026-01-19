"""
Heisenberg Instruments API
==========================

REST API endpoint for managing power instruments.
"""

import json
import os
import subprocess
import traceback

from flask import Request, Response

from python.helpers.api import ApiHandler


class HeisenbergInstrumentsApi(ApiHandler):
    """API handler for power instruments"""

    INSTRUMENTS_DIR = "instruments/custom"

    async def process(self, input: dict, request: Request) -> dict | Response:
        action = input.get("action", "list")

        try:
            if action == "list":
                return await self._list_instruments()

            elif action == "run":
                return await self._run_instrument(input)

            elif action == "info":
                return await self._get_info(input)

            else:
                return {"ok": False, "error": f"Unknown action: {action}"}

        except Exception as e:
            traceback.print_exc()
            return {"ok": False, "error": str(e)}

    async def _list_instruments(self) -> dict:
        """List all available instruments"""
        instruments = []

        if os.path.exists(self.INSTRUMENTS_DIR):
            for name in os.listdir(self.INSTRUMENTS_DIR):
                path = os.path.join(self.INSTRUMENTS_DIR, name)
                if os.path.isdir(path):
                    # Read markdown description
                    md_file = os.path.join(path, f"{name}.md")
                    description = ""
                    if os.path.exists(md_file):
                        with open(md_file, 'r') as f:
                            description = f.read()[:500]

                    # Find executable
                    executable = None
                    for ext in ['.sh', '.py', '.js']:
                        exe_path = os.path.join(path, f"{name}{ext}")
                        if os.path.exists(exe_path):
                            executable = f"{name}{ext}"
                            break
                        # Also check for common names
                        for common in ['run', 'main', name.split('_')[0]]:
                            exe_path = os.path.join(path, f"{common}{ext}")
                            if os.path.exists(exe_path):
                                executable = f"{common}{ext}"
                                break

                    instruments.append({
                        "name": name,
                        "description": description,
                        "executable": executable,
                        "path": path
                    })

        return {
            "ok": True,
            "instruments": instruments,
            "count": len(instruments)
        }

    async def _run_instrument(self, input: dict) -> dict:
        """Run an instrument with arguments"""
        name = input.get("name", "")
        args = input.get("args", [])

        if not name:
            return {"ok": False, "error": "No instrument name provided"}

        path = os.path.join(self.INSTRUMENTS_DIR, name)
        if not os.path.exists(path):
            return {"ok": False, "error": f"Instrument not found: {name}"}

        # Find executable
        executable = None
        for ext in ['.sh', '.py', '.js']:
            for base in [name, 'run', 'main', name.split('_')[0]]:
                exe_path = os.path.join(path, f"{base}{ext}")
                if os.path.exists(exe_path):
                    executable = exe_path
                    break
            if executable:
                break

        if not executable:
            return {"ok": False, "error": f"No executable found for: {name}"}

        # Make executable
        os.chmod(executable, 0o755)

        # Build command
        if executable.endswith('.py'):
            cmd = ['python3', executable] + args
        elif executable.endswith('.js'):
            cmd = ['node', executable] + args
        else:
            cmd = ['bash', executable] + args

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=path
            )

            return {
                "ok": True,
                "output": result.stdout,
                "error_output": result.stderr,
                "exit_code": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {"ok": False, "error": "Instrument timed out"}

    async def _get_info(self, input: dict) -> dict:
        """Get detailed info about an instrument"""
        name = input.get("name", "")

        if not name:
            return {"ok": False, "error": "No instrument name provided"}

        path = os.path.join(self.INSTRUMENTS_DIR, name)
        if not os.path.exists(path):
            return {"ok": False, "error": f"Instrument not found: {name}"}

        md_file = os.path.join(path, f"{name}.md")
        description = ""
        if os.path.exists(md_file):
            with open(md_file, 'r') as f:
                description = f.read()

        files = os.listdir(path)

        return {
            "ok": True,
            "info": {
                "name": name,
                "path": path,
                "description": description,
                "files": files
            }
        }
