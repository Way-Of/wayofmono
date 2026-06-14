---
type: demo_script
version: "1.0"
required_vars:
  - project_name
  - project_tagline
  - solution_description
  - core_components
  - project_description
  - current_date
  - document_version
---

# {{project_name}} - Demo Script

**Document**: Product Demo Script
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Setup

### Environment Requirements
- [Environment requirement 1]
- [Environment requirement 2]
- [Environment requirement 3]

### Test Data
- [Test account 1]
- [Test data set description]
- [Pre-configured scenarios]

### Pre-Demo Checklist
- [ ] Environment is running
- [ ] Test data loaded
- [ ] All services healthy
- [ ] Backup plan ready

---

## Introduction (2 minutes)

"Narrator: Today I'll show you {{project_name}} — {{project_tagline}}. {{project_description}}. Let me walk you through the key capabilities."

---

## Value Proposition

**For [Customer Type 1]**: [Key feature] → [Benefit] → [Measurable outcome]
**For [Customer Type 2]**: [Key feature] → [Benefit] → [Measurable outcome]
**For [Investor Audience]**: [Key metric] → [Market opportunity] → [ROI story]

---

## Core Workflow Demo (10 minutes)

### 1. Platform Overview
**Narrator**: "Let's start with the main dashboard..."
**Action**: Navigate to main dashboard
**Key Points**:
- [Key point 1]
- [Key point 2]

### 2. Key Feature Demonstration
**Narrator**: "Now let me show you the core functionality..."
**Action**: [Describe specific actions]
**Key Points**:
- [Key point 1]
- [Key point 2]

{{#each core_components}}
### {{@index}}. {{name}} Demo
**Narrator**: "Let me show you {{name}}..."
**Action**: [Describe demo actions for this component]
**Expected Outcome**: [What the audience should see]
**Talking Points**:
- [Point 1]
- [Point 2]
{{/each}}

---

## Technical Showcase (5 minutes)

**Narrator**: "Behind the scenes..."
**Action**: Show [technical aspect - monitoring, logs, architecture]
**Key Points**:
- [Technical highlight 1]
- [Technical highlight 2]

---

## Integration Demo (5 minutes)

**Narrator**: "{{project_name}} integrates with..."
**Action**: Show integration working
**Key Points**:
- [Integration feature 1]
- [Integration feature 2]

---

## Real-World Scenarios (5 minutes)

### Scenario 1: [Use Case Name]
**Narrator**: "A real customer would use {{project_name}} for..."
**Action**: Walk through end-to-end scenario
**Outcome**: [Desired outcome]

### Scenario 2: [Use Case Name]
**Narrator**: "Another common use case is..."
**Action**: Walk through second scenario
**Outcome**: [Desired outcome]

---

## Q&A Preparation

### Common Questions
| Question | Answer |
|----------|--------|
| [Question 1] | [Answer 1] |
| [Question 2] | [Answer 2] |
| [Question 3] | [Answer 3] |

### Tough Questions
| Question | Answer |
|----------|--------|
| [Tough question 1] | [Answer] |
| [Tough question 2] | [Answer] |

---

## Fallback Plans

| Scenario | Fallback Action |
|----------|----------------|
| Demo environment fails | [Fallback plan] |
| Feature doesn't work | [Alternative approach] |
| Network issues | [Offline demo plan] |
| Time running short | [Abbreviated demo path] |

---

## Closing (2 minutes)

**Narrator**: "To summarize, {{project_name}} delivers {{solution_description}}. We're seeking {{funding_ask}} to scale. Questions?"

---

## Script Notes

- **Total Time**: 30 minutes
- **Tone**: Professional, enthusiastic, confident
- **Technical Level**: Adjust based on audience
- **Backup Demo**: [Location of backup demo/environment]

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
