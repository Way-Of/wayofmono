---
type: demo_presentation_slides
version: "1.0"
required_vars:
  - project_name
  - project_tagline
  - problem_statement
  - solution_description
  - solution_highlights
  - target_market
  - competitors
  - competitive_advantages
  - current_date
  - document_version
---

# {{project_name}} — Demo Presentation Slides

**Document**: Product Demo Presentation Outline
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Presentation Overview

- **Total Slides**: [Number]
- **Total Time**: [Minutes]
- **Audience**: [Prospect / Investor / Partner]
- **Technical Level**: [Business / Technical / Mixed]

---

## Slide-by-Slide Content

### Slide 1: Title
**Content**: {{project_name}} — {{project_tagline}}
**Visual**: Logo, hero image, tagline
**Talking Points**:
- "Today I'll show you how {{project_name}} solves [key problem]"

---

### Slide 2: The Problem
**Content**: {{problem_statement}}
**Visual**: [Statistic / pain point graphic]
**Talking Points**:
- [Key pain point 1]
- [Key pain point 2]
- "The cost of not solving this is [X]"

---

### Slide 3: Our Solution
**Content**: {{solution_description}}
**Visual**: [Product screenshot / architecture diagram]
**Talking Points**:
- "{{project_name}} addresses these challenges by..."
- [Key differentiator 1]
- [Key differentiator 2]

---

### Slide 4: Key Features
**Content**: Feature overview
**Visual**: [Feature screenshots / icons grid]
**Talking Points**:
{{#each solution_highlights}}
- **{{title}}**: {{description}}
{{/each}}

---

### Slide 5: Live Demo
**Content**: Live walkthrough
**Visual**: Live product demonstration
**Talking Points**:
- "Let me show you how this works in practice..."
- [Demo flow: scenario-based walkthrough]

---

### Slide 6: Competitive Positioning
**Content**: How we compare
**Visual**: [Competitive matrix / positioning map]
**Talking Points**:
- "Compared to [competitor], we..."
{{#each competitive_advantages}}
- {{this}}
{{/each}}

---

### Slide 7: Value & ROI
**Content**: Business impact
**Visual**: [ROI calculation / case study preview]
**Talking Points**:
- "Customers using {{project_name}} achieve..."
- [Metric 1]: [Improvement]
- [Metric 2]: [Improvement]

---

### Slide 8: Next Steps
**Content**: Call to action
**Visual**: [Contact / timeline graphic]
**Talking Points**:
- "Here's what a partnership looks like..."
- "Next: [trial / pilot / meeting]"

---

## Audience Adaptation

### For Business Audience
- Focus on ROI, time savings, competitive advantage
- Minimize technical depth
- Use case studies and metrics

### For Technical Audience
- Include architecture details
- API capabilities, integration points
- Security, compliance, deployment options

### For Investor Audience
- Market opportunity, traction, business model
- Competitive moats, team, financial projections
- Demo should show product-market fit

---

## Visual Asset Recommendations

| Slide | Asset Type | Description |
|-------|-----------|-------------|
| Title | Logo | High-res logo on brand background |
| Problem | Infographic | Statistics illustrating pain points |
| Solution | Screenshot | Main dashboard or key workflow |
| Features | Icons | Feature icons with labels |
| Demo | Screen recording | Pre-recorded backup in case of issues |
| Competition | Matrix | Feature comparison chart |
| ROI | Chart | Before/after metrics visualization |
| Next Steps | Timeline | Implementation timeline |

---

## Demo Day Checklist

- [ ] Presentation slides finalized
- [ ] Demo environment running and tested
- [ ] Backup demo recording available
- [ ] Audio/video equipment tested
- [ ] Q&A preparation complete
- [ ] Handouts / leave-behinds ready

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
