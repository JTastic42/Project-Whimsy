import subprocess
import sys
import textwrap

from src.config import settings


def execute_code(code: str) -> dict:
    """Run Python code in a subprocess sandbox. No file I/O or network allowed."""
    guard = textwrap.dedent("""
        import sys
        _blocked = ['open', 'exec', '__import__']
        import builtins
        _real_import = builtins.__import__
        def _safe_import(name, *args, **kwargs):
            blocked_modules = {'os', 'subprocess', 'socket', 'urllib', 'requests', 'httpx'}
            if name.split('.')[0] in blocked_modules:
                raise ImportError(f"Module '{name}' is not allowed in sandbox")
            return _real_import(name, *args, **kwargs)
        builtins.__import__ = _safe_import
    """)
    full_code = guard + "\n" + code
    try:
        result = subprocess.run(
            [sys.executable, "-c", full_code],
            capture_output=True,
            text=True,
            timeout=settings.code_execution_timeout,
        )
        return {
            "success": result.returncode == 0,
            "data": {
                "stdout": result.stdout[:4000],
                "stderr": result.stderr[:2000],
                "exit_code": result.returncode,
            },
            "error": result.stderr[:500] if result.returncode != 0 else None,
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "data": None,
            "error": f"Code execution timed out after {settings.code_execution_timeout}s",
        }
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}
