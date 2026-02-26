"""
MANDATORY Integration Test Template

ALL infrastructure changes MUST include tests that:
1. Build the actual artifact
2. Verify output is created
3. Test the artifact works as expected

NO EXCEPTIONS - NO FILE EXISTENCE TESTS ONLY
"""

import subprocess
import pytest
from pathlib import Path


class TestRealBuildFunctionality:
    """Test that build actually produces output."""

    def test_build_command_creates_output(self):
        """
        GIVEN the project with build configuration
        WHEN running the build command
        THEN it must create the expected output directory
        """
        project_dir = Path(__file__).parent.parent
        package_json = project_dir / "package.json"

        if not package_json.exists():
            pytest.skip("package.json not created yet")

        # Run build command
        result = subprocess.run(
            ["npm", "run", "build"],
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=60
        )

        # Build must succeed
        assert result.returncode == 0, f"Build failed: {result.stderr}"

        # CRITICAL: Verify output was created
        output_dirs = [
            project_dir / "dist",
            project_dir / "build",
            project_dir / "out",
        ]

        has_output = any(d.exists() for d in output_dirs)

        if not has_output:
            # List what was created
            all_files = list(project_dir.rglob("*"))
            dirs = [f for f in all_files if f.is_dir() and not f.name.startswith(".")]

            pytest.fail(
                f"Build command did not create output directory.\n"
                f"Expected: dist/, build/, or out/\n"
                f"Found directories: {dirs}"
            )

    def test_docker_build_succeeds(self):
        """
        GIVEN the Dockerfile
        WHEN building the Docker image
        THEN the build must succeed
        """
        dockerfile = Path("Dockerfile")
        project_dir = Path(__file__).parent.parent

        if not dockerfile.exists():
            pytest.skip("Dockerfile not created yet")

        # Build image
        image_name = f"test-{project_dir.name}"
        result = subprocess.run(
            [
                "docker", "build",
                "-t", f"{image_name}:latest",
                "-f", str(dockerfile),
                str(project_dir)
            ],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes
        )

        # CRITICAL: Build must succeed
        assert result.returncode == 0, (
            f"Docker build failed:\n{result.stderr}"
        )

        # Verify image exists
        result = subprocess.run(
            ["docker", "images", f"{image_name}:latest"],
            capture_output=True,
            text=True
        )

        assert image_name in result.stdout, "Image not found after build"

        # Cleanup
        subprocess.run(
            ["docker", "rmi", f"{image_name}:latest"],
            capture_output=True
        )

    def test_container_runs_and_responds(self):
        """
        GIVEN the built Docker image
        WHEN running the container
        THEN it must start and respond to health checks
        """
        dockerfile = Path("Dockerfile")
        project_dir = Path(__file__).parent.parent

        if not dockerfile.exists():
            pytest.skip("Dockerfile not created yet")

        image_name = f"test-{project_dir.name}"

        # Build image
        subprocess.run(
            [
                "docker", "build", "-q",
                "-t", f"{image_name}:latest",
                "-f", str(dockerfile),
                str(project_dir)
            ],
            capture_output=True,
            timeout=300
        )

        # Run container
        container_result = subprocess.run(
            [
                "docker", "run", "-d",
                "--rm",
                "-p", "8080:80",  # Use different port to avoid conflicts
                f"{image_name}:latest"
            ],
            capture_output=True,
            text=True
        )

        assert container_result.returncode == 0, "Container failed to start"

        container_id = container_result.stdout.strip()

        # Wait for container to be ready
        import time
        time.sleep(5)

        # Test response
        response_result = subprocess.run(
            ["curl", "-f", "http://localhost:8080/"],
            capture_output=True,
            timeout=10
        )

        # Cleanup
        subprocess.run(
            ["docker", "stop", container_id],
            capture_output=True
        )
        subprocess.run(
            ["docker", "rmi", "-f", f"{image_name}:latest"],
            capture_output=True
        )

        # Verify response
        assert response_result.returncode == 0, "Container not responding"


class TestNoFileExistenceOnlyTests:
    """Enforce that tests check real functionality, not just files."""

    def test_no_file_existence_only_tests(self):
        """
        GIVEN the test suite
        WHEN checking all tests
        THEN NO test should only check Path().exists()
        """
        test_dir = Path(__file__).parent

        # Find all test files
        test_files = list(test_dir.glob("test_*.py"))

        violations = []

        for test_file in test_files:
            content = test_file.read_text()

            # Find all test methods
            import re
            test_methods = re.findall(r'def (test_\w+)\(', content)

            for method in test_methods:
                # Extract method body
                method_match = re.search(
                    rf'def {method}\(self.*?\):(.*?)(?=\n    def|\nclass|\Z)',
                    content,
                    re.DOTALL
                )

                if method_match:
                    method_body = method_match.group(1)

                    # Check if test ONLY has assert Path().exists()
                    path_exists_checks = len(re.findall(r'assert.*Path.*\.exists\(\)', method_body))

                    # Count total asserts
                    total_asserts = len(re.findall(r'assert', method_body))

                    if path_exists_checks > 0 and total_asserts == path_exists_checks:
                        violations.append(f"  - {test_file.name}::{method}() only checks file existence")

        if violations:
            pytest.fail(
                "Found file-existence-only tests.\n"
                "Tests MUST verify real functionality with subprocess.run().\n"
                "Violations:\n" + "\n".join(violations)
            )
