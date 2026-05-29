import pytest
from src.tools.code_executor import execute_code


def test_basic_execution():
    result = execute_code("print('hello')")
    assert result["success"] is True
    assert "hello" in result["data"]["stdout"]


def test_syntax_error():
    result = execute_code("def foo(: pass")
    assert result["success"] is False


def test_blocked_import():
    result = execute_code("import os; print(os.getcwd())")
    assert result["success"] is False


def test_timeout():
    result = execute_code("while True: pass")
    assert result["success"] is False
    assert "timed out" in result["error"]
