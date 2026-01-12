# Feature Development Workflow

This document outlines the standard 7-phase workflow for building new features in the `nestject` monorepo.

**Command:** `/feature-dev [Feature Name]` (Conceptual)

## The 7-Phase Workflow

### Phase 1: Discovery
**Goal:** Understand what needs to be built.
*   Clarify the feature request.
*   Identify constraints and requirements.
*   **User Action:** Describe the feature and answer clarifying questions.

### Phase 2: Codebase Exploration
**Agent:** `docs/agents/code-explorer.md`
**Goal:** Understand relevant existing code.
*   Find similar features (e.g., "How is Auth implemented?").
*   Trace data flow and dependencies.
*   **Output:** List of key files and patterns to follow.

### Phase 3: Clarifying Questions
**Goal:** Fill in gaps.
*   Review findings from Phase 2.
*   Ask specific questions about edge cases, error handling, and integration.
*   **User Action:** Answer questions to finalize requirements.

### Phase 4: Architecture Design
**Agent:** `docs/agents/code-architect.md`
**Goal:** Design the implementation.
*   Create a blueprint following the "Shared -> Backend -> Frontend" flow.
*   Define DTOs, Schemas, API endpoints, and UI components.
*   **Output:** Implementation Plan and Build Sequence.

### Phase 5: Implementation
**Goal:** Build the feature.
*   Execute the plan from Phase 4.
*   **Strict Order:**
    1.  **Shared:** Define Types/Schemas.
    2.  **Backend:** Implement API & DB logic.
    3.  **Generate:** Run `pnpm generate:api`.
    4.  **Frontend:** Build UI using generated hooks.

### Phase 6: Quality Review
**Agent:** `docs/agents/code-reviewer.md`
**Goal:** Ensure quality.
*   Review code against `AGENTS.md`.
*   Check for bugs and type safety.
*   **Output:** List of required fixes.

### Phase 7: Summary
**Goal:** Document completion.
*   Verify all tests pass.
*   Summarize changes and key decisions.
*   Mark feature as complete.

---

## Usage with AI Agents

To use this workflow with an AI assistant:

1.  **Start:** "I want to build [Feature]. Let's start the Feature Dev workflow."
2.  **Phase 2:** "Please run the **Code Explorer** on [Related Files]."
3.  **Phase 4:** "Please run the **Code Architect** to design this feature."
4.  **Phase 6:** "Please run the **Code Reviewer** on my changes."
