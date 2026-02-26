# XML Structured Prompting - Template Registry

## Overview

This directory contains XML templates for structured prompting with AutoPM.

## Template Structure

```
xml-prompts/
├── arch/              # Stage 1: Architectural Planning
│   └── stage1-infrastructure-planning.xml
├── dev/               # Stage 2: Code/Infrastructure Implementation
│   ├── stage2-infrastructure-implementation.xml
│   ├── stage3-infrastructure-validation.xml
│   └── EXAMPLE-docker-validation.xml
├── test/              # Stage 3: Test Creation
├── refactor/          # Stage 4: Refactoring
└── doc/               # Stage 5: Documentation
```

## Usage

### Basic Usage

```bash
# List all templates
/xml:template list

# Use a template
/prompt:xml stage2-infrastructure-implementation \
  --task "Generate GitOps repository structure" \
  --context "Infrastructure foundation for Weekend Insight" \
  --allowed "cookiecutter, kubectl, kustomize" \
  --execute
```

### Template Variables

Each template supports Mustache variables:

- `{{task}}` - Task description
- `{{context}}` - Context/background
- `{{requirements}}` - Array of requirements
- `{{allowed_tools}}` - Comma-separated allowed tools
- `{{forbidden_approaches}}` - Array of forbidden approaches
- `{{assigned_agent}}` - Agent to execute the task

## Templates

### Stage 1: Architecture

**Template:** `arch/stage1-infrastructure-planning.xml`

**Purpose:** Design infrastructure architecture before implementation

**Usage:**
```bash
/prompt:xml stage1-infrastructure-planning \
  --task "Design PostgreSQL infrastructure" \
  --context "Weekend Insight data layer" \
  --requirement "Support 10k concurrent connections" \
  --requirement "99.9% availability SLA" \
  --allowed "AWS RDS, PostgreSQL 15+" \
  --scalability "Horizontal read replicas" \
  --security "Encryption at rest and in transit" \
  --output postgresql-architecture.md
```

### Stage 2: Implementation

**Template:** `dev/stage2-infrastructure-implementation.xml`

**Purpose:** Implement infrastructure with TDD

**Usage:**
```bash
/prompt:xml stage2-infrastructure-implementation \
  --task "Generate GitOps repository structure" \
  --context "Infrastructure foundation" \
  --requirement "Use cookiecutter-k8s-gitops template" \
  --requirement "Configure staging and production namespaces" \
  --allowed "cookiecutter, kubectl, kustomize" \
  --forbidden "Manual manifest editing" \
  --agent kubernetes-orchestrator \
  --execute
```

### Stage 3: Validation

**Template:** `dev/stage3-infrastructure-validation.xml`

**Purpose:** Validate infrastructure with REAL functionality tests (not file existence)

**Critical Feature:** Prevents "tests pass but code doesn't work" issues

**Usage:**
```bash
/prompt:xml stage3-infrastructure-validation \
  --task "Validate Docker containerization" \
  --context "Weekend Insight infrastructure" \
  --requirement "All Dockerfiles must build successfully" \
  --requirement "Tests must verify REAL builds, not files" \
  --forbidden "@pytest.mark.slow on integration tests" \
  --forbidden "Mocking docker commands" \
  --execute
```

**Key Requirements:**
- ✅ Test actual functionality (subprocess.run with real tools)
- ❌ NO file existence checks only
- ❌ NO @pytest.mark.slow on critical tests
- ❌ NO mocks for infrastructure tools
- ✅ Pre-commit hooks to block broken commits
- ✅ Makefile with standardized commands

**Example:** `dev/EXAMPLE-docker-validation.xml` shows complete usage

## Creating Custom Templates

### Template Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<prompt_workflow>
  <stage>2</stage>
  <workflow_type>custom_type</workflow_type>

  <task>{{task}}</task>
  <context>{{context}}</context>

  <requirements>
    {{#each requirements}}
    <requirement>{{this}}</requirement>
    {{/each}}
  </requirements>

  <tdd_requirements>
    <test_first>REQUIRED</test_first>
  </tdd_requirements>

  <deliverables>
    <deliverable>
      <name>Deliverable Name</name>
      <required>YES</required>
    </deliverable>
  </deliverables>
</prompt_workflow>
```

### Variables Reference

| Variable | Type | Description |
|----------|------|-------------|
| `{{task}}` | string | Main task description |
| `{{context}}` | string | Background/context |
| `{{requirements}}` | array | List of requirements |
| `{{allowed_tools}}` | string | Comma-separated allowed tools |
| `{{forbidden_approaches}}` | array | List of forbidden approaches |
| `{{assigned_agent}}` | string | Agent to execute |
| `{{tdd_requirements}}` | object | TDD configuration |
| `{{deliverables}}` | array | Expected deliverables |

## Best Practices

1. **Always specify requirements** - Zero ambiguity
2. **Use TDD for all implementation** - Tests first, code second
3. **Define constraints** - Allowed tools and forbidden approaches
4. **Specify deliverables** - Exactly what you'll get
5. **Include thinking section** - AI reasons before coding

## Integration with Agents

Templates automatically invoke specialized agents:

```bash
# This automatically uses @kubernetes-orchestrator
/prompt:xml stage2-infrastructure-implementation \
  --agent kubernetes-orchestrator \
  --task "Setup Kubernetes cluster"
```

## Examples

See `.opencode/epics/weekend-insight/02-infrastructure/` for examples of XML prompts integrated with tasks.

## Documentation

- AutoPM README: `.opencode/README.md`
- XML Prompting Guide: https://medium.com/p/219398f766ad
- Template Creation Guide: `.opencode/docs/xml-prompts/creating-templates.md`
