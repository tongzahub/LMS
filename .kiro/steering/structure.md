---
inclusion: always
---

# Project Structure

This is an infrastructure-as-code project, not a custom application codebase. Moodle is an upstream open-source LMS — this repo defines the AWS infrastructure, deployment automation, and operational configuration around it.

## Repository Layout

```
/
├── .kiro/
│   ├── specs/                        # Feature specs (requirements → design → tasks)
│   │   └── moodle-aws-deployment/    # Primary deployment spec
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── steering/                     # AI steering rules and project context
│       ├── product.md                # Business context, architecture summary, conventions
│       ├── tech.md                   # Tech stack and AWS service inventory
│       └── structure.md              # This file — repo layout and conventions
├── requirement.md                    # Top-level requirements and AWS reference links
├── REQUIREMENT_SPEC.md               # Full Software Requirement Specification (SRS)
└── 20260217 ECV Learning Solutions.pdf  # Original project brief
```

## Conventions

- IaC is AWS CDK v2 (TypeScript). CDK stacks and constructs go under a dedicated infrastructure directory (to be created during implementation).
- Moodle Docker image definitions (Dockerfile, config overlays, plugin lists) are separate from CDK code.
- Moodle core is never modified directly. Customizations (plugins, themes, config) are layered on top via the container build.
- Plugin management is Git-based through CI/CD — never through the Moodle admin UI.
- No credentials or secrets in code. All secrets go in AWS Secrets Manager.
- The `REQUIREMENT_SPEC.md` is the authoritative SRS. Reference it for detailed functional/non-functional requirements, acceptance criteria, and architecture diagrams.

## File Naming

- Infrastructure code: TypeScript (`.ts`), following CDK conventions (`*-stack.ts`, `*-construct.ts`)
- Docker assets: `Dockerfile`, config files, shell scripts
- Steering and specs: Markdown (`.md`) with kebab-case naming
- No spaces in file or directory names (except pre-existing documents like the PDF)

## What This Repo Does NOT Contain

- Moodle PHP source code (pulled from upstream during container build)
- Application-level unit tests for Moodle itself
- Frontend/UI code (Moodle provides its own)

## Key Relationships Between Files

- `product.md` → business context, architecture decisions, performance targets
- `tech.md` → AWS service inventory and tooling
- `REQUIREMENT_SPEC.md` → full SRS with acceptance criteria (source of truth for requirements)
- `.kiro/specs/` → iterative feature specs that drive implementation tasks
