# Best Practices Guide

**Recommended patterns and conventions for using OpenCodeAutoPM effectively**

This guide covers best practices for getting the most out of OpenCodeAutoPM in your daily workflow.

---

## Table of Contents

- [General Best Practices](#general-best-practices)
- [Agent Selection Guidelines](#agent-selection-guidelines)
- [Command Usage Patterns](#command-usage-patterns)
- [Project Management Best Practices](#project-management-best-practices)
- [Context Management](#context-management)
- [Testing Strategies](#testing-strategies)
- [Git Workflow Integration](#git-workflow-integration)
- [Documentation Practices](#documentation-practices)
- [Performance Optimization](#performance-optimization)
- [Team Collaboration](#team-collaboration)

---

## General Best Practices

### 1. Start with Context

Always begin by creating or updating project context:

```bash
/context:create
```

**Why**:
- Provides agents with project understanding
- Improves agent responses
- Reduces repetitive explanations
- Establishes project baseline

### 2. Use Agents, Not Just Prompts

Instead of generic prompts, use specialized agents:

```bash
# ❌ Generic prompt
"Build a React component with TypeScript"

# ✅ Specialized agent
@react-ui-expert Create a TypeScript React component for user profile
```

**Why**:
- Agents have domain expertise
- Agents use best practices automatically
- Agents provide better code quality
- Agents include appropriate testing

### 3. Follow TDD Principles

Always write tests before implementation:

```bash
# 1. Generate test first
@frontend-testing-engineer Create tests for user profile component

# 2. Implement to pass tests
@react-ui-expert Implement user profile component to pass tests

# 3. Run tests
/testing:run

# 4. Refactor if needed
@code-analyzer Review component for improvements
```

**Why**:
- Ensures testable code
- Better code design
- Safety net for refactoring
- Documentation by example

### 4. Leverage Context7 Documentation

Query live documentation before implementation:

```bash
# Agents automatically query Context7, but you can too:
@aws-cloud-architect Design VPC for web application
# Agent will query: mcp://context7/aws/vpc, mcp://context7/aws/networking
```

**Why**:
- Always uses latest documentation
- Prevents outdated patterns
- Ensures security best practices
- Reduces errors

### 5. Validate Before Committing

Always run validation before committing:

```bash
# Run all tests
/testing:run

# Analyze changes
@code-analyzer Review my changes for issues

# Check PM status
/pm:status

# Validate paths
npm run validate:paths
```

**Why**:
- Catches issues early
- Maintains code quality
- Prevents broken builds
- Reduces review iterations

---

## Agent Selection Guidelines

### Choose Agents by Domain

#### Frontend Development

```bash
# React applications
@react-frontend-engineer Build complete React feature

# UI components
@react-ui-expert Create reusable button component with MUI

# Styling
@tailwindcss-expert Style this component with Tailwind

# UX review
@ux-design-expert Review this UI for accessibility
```

#### Backend Development

```bash
# Python/FastAPI
@python-backend-engineer Create FastAPI endpoint for user authentication

# Node.js/Express
@nodejs-backend-engineer Build Express API server

# Database design
@postgresql-expert Design database schema for e-commerce
```

#### DevOps

```bash
# Docker
@docker-containerization-expert Create Dockerfile for Node.js app

# Kubernetes
@kubernetes-orchestrator Deploy this app to Kubernetes

# CI/CD
@github-operations-specialist Create GitHub Actions workflow
```

### Choose Agents by Task Type

#### Code Review

```bash
# General review
@code-analyzer Review recent changes for bugs and security issues

# Performance review
@code-analyzer Analyze performance bottlenecks in this code

# Security review
@code-analyzer Check for OWASP Top 10 vulnerabilities
```

#### Testing

```bash
# Run tests
@test-runner Execute all tests with detailed analysis

# E2E tests
@e2e-test-engineer Create Playwright tests for checkout flow

# Frontend tests
@frontend-testing-engineer Write component tests for React app
```

#### Architecture

```bash
# AWS
@aws-cloud-architect Design serverless architecture for API

# Azure
@azure-cloud-architect Design Azure architecture for microservices

# Multi-cloud
@terraform-infrastructure-expert Create Terraform for multi-cloud deployment
```

### Combine Agents for Complex Tasks

```bash
# Example: Building a complete feature

# 1. Design database
@postgresql-expert Design schema for user management

# 2. Build backend API
@python-backend-engineer Implement user CRUD endpoints

# 3. Build frontend UI
@react-ui-expert Create user management interface

# 4. Add styling
@tailwindcss-expert Style the user interface

# 5. Test the feature
@test-runner Run all user management tests

# 6. Review everything
@code-analyzer Review complete feature for issues
```

---

## Command Usage Patterns

### Project Management Workflow

```bash
# 1. Create PRD
/pm:prd-new "User Authentication System"

# 2. Decompose into Epics
/pm:epic-new prd-{timestamp} "Phase 1: Email/Password Auth"
/pm:epic-new prd-{timestamp} "Phase 2: OAuth Integration"
/pm:epic-new prd-{timestamp} "Phase 3: 2FA Setup"

# 3. Create tasks for epic
/pm:task-new epic-{id} "Design database schema"
/pm:task-new epic-{id} "Implement login API"
/pm:task-new epic-{id} "Create login UI"

# 4. Track progress
/pm:status

# 5. Update task status
/pm:task-start {task-id}
/pm:task-complete {task-id}
```

### Feature Development Workflow

```bash
# 1. Create feature branch
/git:branch feature/user-authentication

# 2. Create context
/context:create

# 3. Implement with TDD
@python-backend-engineer Implement login endpoint with tests

# 4. Run tests
/testing:run

# 5. Code review
@code-analyzer Review authentication implementation

# 6. Commit changes
/git:commit "feat: implement user login endpoint"

# 7. Push to remote
/git:push

# 8. Create PR (if using GitHub)
/github:pr-create
```

### Bug Fix Workflow

```bash
# 1. Create bugfix branch
/git:branch bugfix/login-crash

# 2. Investigate issue
@code-analyzer Investigate login crash

# 3. Write failing test for bug
@python-backend-engineer Write test that reproduces crash

# 4. Fix the bug
@python-backend-engineer Fix login crash to make test pass

# 5. Run all tests
/testing:run

# 6. Verify fix
@test-runner Run regression tests

# 7. Commit fix
/git:commit "fix: resolve login crash on invalid credentials"

# 8. Push and create PR
/git:push
/github:pr-create
```

---

## Project Management Best Practices

### PRD Creation

```bash
# ✅ Good PRD
/pm:prd-new "User Authentication System"
# Then fill in:
# - Overview: Clear problem statement
# - Goals: Specific, measurable objectives
# - Features: Detailed feature list
# - Requirements: Functional and non-functional
# - Success Criteria: How to measure success

# ❌ Poor PRD
/pm:prd-new "Add login"
# Too vague, lacks detail
```

### Epic Decomposition

**Best Practices**:
- **Size epics for 1-2 weeks**
- **Focus on feature vertical slices**
- **Include all necessary work** (backend, frontend, tests, docs)
- **Define clear acceptance criteria**

```bash
# Good epic
/pm:epic-new prd-123 "User Login"
# Includes: backend API, frontend UI, tests, documentation

# Too large
/pm:epic-new prd-123 "Complete User Management"
# Should be split into multiple epics
```

### Task Sizing

**Best Practices**:
- **Size tasks for 1-3 days**
- **Make tasks independently testable**
- **Include testing in task estimates**
- **Define clear "definition of done"**

```bash
# Good task
/pm:task-new epic-456 "Implement login API endpoint with tests"

# Too large
/pm:task-new epic-456 "Build authentication"
# Should be split into multiple tasks
```

### Progress Tracking

```bash
# Daily check
/pm:status

# Weekly review
/pm:burndown

# Blocked items
/pm:blocked

# Completed items
/pm:completed
```

---

## Context Management

### When to Update Context

```bash
# Update context when:
# - Starting new project
/context:create

# - Adding new features
/context:update

# - Changing project structure
/context:update

# - Context becomes outdated
/context:update
```

### Context Best Practices

1. **Keep it focused** - Only essential information
2. **Update regularly** - Before major changes
3. **Be specific** - Include relevant technologies, patterns
4. **Use templates** - Consistent structure

```bash
# Example context structure
# Project Overview
# - Purpose, goals, target users

# Technology Stack
# - Languages, frameworks, databases, tools

# Architecture
# - High-level design, key components

# Development Standards
# - Coding standards, testing approach, Git workflow

# Current Work
# - Active features, known issues, upcoming changes
```

---

## Testing Strategies

### The Testing Pyramid

```
        E2E Tests (10%)
       /             \
     Integration     (30%)
    Tests
   /
Unit Tests (60%)
```

### TDD Workflow

```bash
# 1. Write failing test
@frontend-testing-engineer Write test for user login form validation

# 2. Run test (should fail)
/testing:run

# 3. Implement minimal code to pass
@react-ui-expert Implement login form with validation

# 4. Run test (should pass)
/testing:run

# 5. Refactor
@code-analyzer Review code for improvements

# 6. Run all tests (ensure nothing broke)
/testing:run
```

### Test Coverage Goals

- **Unit tests**: 80-90% coverage
- **Integration tests**: Key workflows covered
- **E2E tests**: Critical user journeys covered

```bash
# Check coverage
/testing:coverage

# Set coverage threshold
/config:set testing.coverageThreshold 80
```

---

## Git Workflow Integration

### Branch Naming

```bash
# Features
/git:branch feature/user-authentication

# Bug fixes
/git:branch bugfix/login-crash

# Hot fixes
/git:branch hotfix/security-patch

# Refactoring
/git:branch refactor/user-service
```

### Commit Messages

Use semantic commits:

```bash
# Features
/git:commit "feat: add user login functionality"

# Bug fixes
/git:commit "fix: resolve token expiration issue"

# Documentation
/git:commit "docs: update API documentation"

# Refactoring
/git:commit "refactor: simplify user service"

# Tests
/git:commit "test: add integration tests for checkout"

# Performance
/git:commit "perf: optimize database queries"
```

### Pull Request Workflow

```bash
# 1. Create PR
/github:pr-create

# 2. PR includes:
# - Description of changes
# - Related issue/PRD numbers
# - Testing performed
# - Screenshots (for UI changes)

# 3. Automated checks:
# - Tests pass
# - Code analysis passes
# - Coverage maintained

# 4. Review and address feedback

# 5. Merge after approval
/github:pr-merge
```

---

## Documentation Practices

### Code Documentation

```bash
# Generate API documentation
@code-analyzer Generate API documentation for endpoints

# Include docstrings
@python-backend-engineer Add comprehensive docstrings to all functions
```

### PRD Documentation

```bash
# Create detailed PRD
/pm:prd-new "Feature Name"
# Include:
# - Problem statement
# - Success criteria
# - User stories
# - Technical requirements
# - Dependencies
```

### README Documentation

Every project should have:

```bash
# - Project overview
# - Installation instructions
# - Usage examples
# - API documentation link
# - Contributing guidelines
# - License information
```

---

## Performance Optimization

### Choose Right Execution Strategy

```bash
# Limited resources
/config:set execution.strategy sequential

# Balanced (default)
/config:set execution.strategy adaptive

# Maximum performance
/config:set execution.strategy hybrid
/config:set execution.maxConcurrent 5
```

### Parallel Test Execution

```bash
# Enable parallel tests
/config:set testing.parallel true

# Run tests in parallel
/testing:run --parallel
```

### Context Optimization

```bash
# Limit context size
/config:set context.maxSize 100000

# Disable auto-update for large projects
/config:set context.autoUpdate false
```

---

## Team Collaboration

### Standardize Configuration

Share `.opencode/config.json` across team:

```json
{
  "version": "3.7.0",
  "scenario": "full-devops",
  "execution": {
    "strategy": "adaptive"
  },
  "providers": {
    "github": {
      "enabled": true,
      "autoSync": true
    },
    "azure": {
      "enabled": true,
      "autoSync": true
    }
  },
  "testing": {
    "framework": "jest",
    "coverageThreshold": 80
  }
}
```

### Standardize Workflows

Document team workflows in `.opencode/workflows/`:

```bash
# Feature workflow
# Bug fix workflow
# Release workflow
# Deployment workflow
```

### Code Review Standards

```bash
# Use agents for initial review
@code-analyzer Review PR changes

# Checklist:
# - Tests pass
# - Coverage maintained
# - Documentation updated
# - No security issues
# - Follows coding standards
```

---

## Common Anti-Patterns

### ❌ Don't Do This

```bash
# Generic prompts without agents
"Write code for user login"

# Skipping tests
"Implement login feature" (without tests)

# Outdated context
Using context from 3 months ago

# Wrong agent
@docker-containerization-expert Build React component

# No documentation
Implementing features without updating PRD

# Ignoring Context7
Writing AWS code without checking latest docs
```

### ✅ Do This Instead

```bash
# Use specialized agents
@python-backend-engineer Implement FastAPI login endpoint

# Follow TDD
@python-backend-engineer Write tests for login endpoint

# Keep context fresh
/context:update

# Use correct agent
@react-ui-expert Build login component

# Document everything
/pm:prd-new, update README, API docs

# Query Context7
@aws-cloud-architect Design VPC (automatically queries docs)
```

---

## Conclusion

Following these best practices will help you:

✅ Write better code
✅ Move faster with fewer bugs
✅ Maintain high code quality
✅ Improve team collaboration
✅ Reduce technical debt
✅ Ship features confidently

**Key Takeaways**:
1. Always start with context
2. Use specialized agents
3. Follow TDD principles
4. Query live documentation
5. Test before committing
6. Document as you go

---

## Next Steps

- [Agent Registry](../docs/reference/AGENTS.md) - Learn about all agents
- [Command Reference](../docs/reference/COMMANDS.md) - Explore all commands
- [Project Management System](../docs/user/PM_SYSTEM.md) - PM best practices
- [Testing Strategies](../docs/best-practices/TESTING.md) - Testing deep dive

---

**Last Updated**: 2025-02-28
**Framework Version**: 3.7.0
