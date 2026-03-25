#!/usr/bin/env python3
"""
Deployment Preparation Script

This script runs pre-deployment checks and prepares the application for deployment.
It validates environment configuration, checks for required files, and generates
necessary deployment metadata.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime


class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'


def log_info(message: str) -> None:
    """Log info message with blue color."""
    print(f"{Colors.BLUE}ℹ{Colors.END} {message}")


def log_success(message: str) -> None:
    """Log success message with green color."""
    print(f"{Colors.GREEN}✓{Colors.END} {message}")


def log_warning(message: str) -> None:
    """Log warning message with yellow color."""
    print(f"{Colors.YELLOW}⚠{Colors.END} {message}")


def log_error(message: str) -> None:
    """Log error message with red color."""
    print(f"{Colors.RED}✗{Colors.END} {message}")


def log_header(message: str) -> None:
    """Log header with bold formatting."""
    print(f"\n{Colors.BOLD}{'=' * 50}{Colors.END}")
    print(f"{Colors.BOLD}{message}{Colors.END}")
    print(f"{Colors.BOLD}{'=' * 50}{Colors.END}\n")


def check_node_version() -> bool:
    """Check if Node.js version is compatible."""
    log_info("Checking Node.js version...")
    try:
        result = subprocess.run(
            ['node', '--version'],
            capture_output=True,
            text=True,
            check=True
        )
        version = result.stdout.strip()
        major_version = int(version.lstrip('v').split('.')[0])

        if major_version >= 18:
            log_success(f"Node.js version: {version}")
            return True
        else:
            log_error(f"Node.js version {version} is too old. Required: >= 18")
            return False
    except (subprocess.CalledProcessError, FileNotFoundError):
        log_error("Node.js is not installed")
        return False


def check_npm_installed() -> bool:
    """Check if npm is installed."""
    log_info("Checking npm...")
    try:
        result = subprocess.run(
            ['npm', '--version'],
            capture_output=True,
            text=True,
            check=True
        )
        log_success(f"npm version: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        log_error("npm is not installed")
        return False


def check_required_files() -> bool:
    """Check if all required files exist."""
    log_info("Checking required files...")
    required_files = [
        'package.json',
        'next.config.ts',
        'tsconfig.json',
        'app/layout.tsx',
        'app/page.tsx',
    ]

    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)

    if missing_files:
        log_error(f"Missing required files: {', '.join(missing_files)}")
        return False

    log_success("All required files present")
    return True


def check_dependencies() -> bool:
    """Check if node_modules exists and dependencies are installed."""
    log_info("Checking dependencies...")

    if not Path('node_modules').exists():
        log_warning("node_modules not found. Running npm install...")
        try:
            subprocess.run(['npm', 'ci'], check=True, capture_output=True)
            log_success("Dependencies installed")
        except subprocess.CalledProcessError as e:
            log_error(f"Failed to install dependencies: {e}")
            return False

    log_success("Dependencies are installed")
    return True


def validate_package_json() -> bool:
    """Validate package.json configuration."""
    log_info("Validating package.json...")

    try:
        with open('package.json', 'r') as f:
            package_data = json.load(f)

        required_keys = ['name', 'version', 'scripts', 'dependencies']
        missing_keys = [key for key in required_keys if key not in package_data]

        if missing_keys:
            log_error(f"Missing keys in package.json: {', '.join(missing_keys)}")
            return False

        log_success("package.json is valid")
        return True
    except (json.JSONDecodeError, FileNotFoundError) as e:
        log_error(f"Failed to parse package.json: {e}")
        return False


def check_env_config() -> bool:
    """Check environment configuration."""
    log_info("Checking environment configuration...")

    # Check for .env.example or .env.local
    env_files = ['.env', '.env.local', '.env.example']
    existing_env_files = [f for f in env_files if Path(f).exists()]

    if existing_env_files:
        log_success(f"Found env files: {', '.join(existing_env_files)}")
    else:
        log_warning("No environment files found (optional)")

    return True


def generate_deploy_metadata() -> dict:
    """Generate deployment metadata."""
    log_info("Generating deployment metadata...")

    metadata = {
        'timestamp': datetime.utcnow().isoformat(),
        'node_version': subprocess.run(
            ['node', '--version'],
            capture_output=True,
            text=True
        ).stdout.strip(),
        'npm_version': subprocess.run(
            ['npm', '--version'],
            capture_output=True,
            text=True
        ).stdout.strip(),
    }

    # Write metadata to file
    metadata_path = Path('.vercel/deploy-metadata.json')
    metadata_path.parent.mkdir(parents=True, exist_ok=True)

    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    log_success(f"Deployment metadata saved to {metadata_path}")
    return metadata


def run_npm_checks() -> bool:
    """Run npm checks (lint, build)."""
    log_info("Running npm checks...")

    checks = [
        ('Lint', ['npm', 'run', 'lint']),
        ('Build', ['npm', 'run', 'build']),
    ]

    all_passed = True
    for name, cmd in checks:
        log_info(f"Running {name}...")
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            log_success(f"{name} passed")
        except subprocess.CalledProcessError as e:
            log_error(f"{name} failed")
            if e.stdout:
                print(e.stdout)
            if e.stderr:
                print(e.stderr)
            all_passed = False

    return all_passed


def main() -> int:
    """Main entry point for deployment preparation."""
    log_header("🚀 Deployment Preparation")

    checks = [
        ("Node.js", check_node_version),
        ("npm", check_npm_installed),
        ("Required Files", check_required_files),
        ("Package.json", validate_package_json),
        ("Dependencies", check_dependencies),
        ("Environment", check_env_config),
    ]

    all_passed = True
    for name, check_func in checks:
        log_header(f"Checking {name}")
        if not check_func():
            all_passed = False

    if all_passed:
        log_header("Running Build Checks")
        if not run_npm_checks():
            log_error("Build checks failed")
            return 1

    log_header("Generating Metadata")
    generate_deploy_metadata()

    log_header("✅ Deployment Prep Complete")
    log_success("Application is ready for deployment!")

    return 0


if __name__ == '__main__':
    sys.exit(main())
