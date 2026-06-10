# TCKT-MIGRATION-001: Ticket System Migration to OpTicAT & GitHub Integration

## Problem Statement
The team needs to migrate existing ticket and skill tracking infrastructure from legacy hosting (oldtickets/) to OpTicAT, while establishing a proper GitHub integration workflow for the Way of Mono project. Current ticket management is fragmented across multiple locations without standardized integration points.

## Desired Outcome
1. **Migrate all active tickets** from `/home/zerwiz/CodeP/wayofwork/thoughts/shared/tickets/oldtickets/` to the new OpTicAT-based system
2. **Integrate database infrastructure** with OpTicAT for centralized tracking
3. **Sync with GitHub repository** `https://github.com/Way-Of/wayofmono` for ticket and skill metadata
4. **Establish standardized ticket workflows** that align with development lifecycle for Way of Mono

## Context & Background

### Current State
- Tickets stored in legacy directory: `/home/zerwiz/CodeP/wayofwork/thoughts/shared/tickets/oldtickets/`
- Database/hosting infrastructure not yet defined
- GitHub repository exists for Way of Mono project
- Manual ticket management with no automated integration

### Why This Matters
- **Scalability**: Legacy file-based system doesn't support concurrent team access
- **Integration**: Need automated database and API integrations for CI/CD
- **Collaboration**: Centralized system enables better team workflows
- **Audit Trail**: Git-backed ticket system provides version history and accountability

### Migration Timeline
- **Week 1**: Assess existing tickets and categorize by priority/status
- **Week 2**: Set up OpTicAT database infrastructure
- **Week 3**: Migrate tickets and establish GitHub sync
- **Week 4**: Test workflows and optimize integration points

## Requirements

### Functional Requirements

#### Migration Components
- [ ] **Data Extraction**: Export all existing tickets from oldtickets/ directory
- [ ] **Data Transformation**: Convert legacy format to OpTicAT-compatible schema
- [ ] **Data Import**: Load migrated tickets into OpTicAT database
- [ ] **Metadata Preservation**: Retain ticket IDs, status, priority, assignees

#### Database & Infrastructure
- [ ] **OpTicAT Database Setup**: Configure database schemas for tickets, skills, and tickets metadata
- [ ] **API Integration**: Establish endpoints for ticket CRUD operations
- [ ] **Webhook Configuration**: Set up GitHub webhooks for ticket sync
- [ ] **Backup Strategy**: Implement automated backups and data retention policies

#### GitHub Integration
- [ ] **Repository Connection**: Link OpTicAT system with `https://github.com/Way-Of/wayofmono`
- [ ] **Issue Sync**: Create two-way sync between OpTicAT tickets and GitHub issues
- [ ] **Labels & Status**: Map OpTicAT statuses to GitHub issue labels
- [ ] **Automated Notifications**: Configure alerts for ticket events

#### Ticket Categories (to be created)
- [ ] **Development**: Feature requests, bug fixes, technical debt
- [ ] **Design**: UI/UX improvements, design system updates
- [ ] **Testing**: QA tasks, test case creation
- [ ] **Documentation**: Content creation, knowledge base updates
- [ ] **DevOps**: Infrastructure tasks, monitoring
- [ ] **Skills**: Training, tool evaluation, process improvements

### Out of Scope
- Complete rewrite of existing tickets (preserve historical context)
- Breaking changes to existing developer workflows
- Setting up third-party integrations beyond OpTicAT

## Acceptance Criteria

### Automated Verification
- [ ] All existing tickets migrated to OpTicAT database
- [ ] GitHub webhook integration functional
- [ ] Ticket data readable from `https://github.com/Way-Of/wayofmono`
- [ ] Automated backup tests pass successfully

### Manual Verification
- [ ] Team can create/view/edit tickets via OpTicAT
- [ ] GitHub issues sync with OpTicAT tickets bidirectionally
- [ ] All critical tickets have assigned priorities and owners
- [ ] Documentation completed and team trained on new workflow

### Testing Checklist
- [ ] Create new ticket via OpTicAT → appears in GitHub
- [ ] Update GitHub issue → OpTicAT reflects changes
- [ ] Delete ticket in OpTicAT → GitHub issue closed/archived
- [ ] Label changes sync correctly

## Technical Notes

### Affected Components

#### Directory Structure
```
/home/zerwiz/CodeP/wayofwork/
├── thoughts/
│   └── shared/
│       ├── tickets/              # Active tickets (OpTicAT-backed)
│       │   ├── development/      # Development team tickets
│       │   ├── design/           # Design-related tickets
│       │   ├── testing/          # QA/QC tickets
│       │   ├── documentation/    # Content and knowledge tickets
│       │   ├── devops/           # Infrastructure tickets
│       │   └── skills/           # Training and improvement tickets
│       └── oldtickets/           # Legacy tickets (archive, read-only)
└── oldtickets/                   # Historic archive
```

#### GitHub Repository
- **URL**: `https://github.com/Way-Of/wayofmono`
- **Purpose**: Host Way of Mono source code and ticket metadata
- **Integration Points**: Issues, Wiki, README

#### Integration Points
- OpTicAT API ↔ GitHub Webhooks ↔ Ticket Database
- Real-time sync for status changes
- Automated label and status mapping

#### Migration Strategy
```yaml
migration:
  preserve_historical: true
  archive_oldtickets: true
  new_workflow: active
  database: opticat
  hosting: opticat-infra
```

---

## Meta

**Ticket ID**: TCKT-MIGRATION-001

**Created**: 2026-06-08

**Status**: Open

**Priority**: **High** 🚨

**Estimated Effort**: L (Large)

**Owner**: DevOps/Integration Team

**Related Repositories**:
- Way of Mono: `https://github.com/Way-Of/wayofmono`
- OpTicAT Database: TBD

**Dependencies**:
- OpTicAT infrastructure setup
- GitHub webhook configuration
- Database schema design

**Risk Level**: Medium (requires careful planning to preserve ticket history)

---

## Action Items

### Immediate (Week 1)
- [ ] Audit existing tickets in `oldtickets/`
- [ ] Create migration mapping document
- [ ] Set up OpTicAT dev environment

### Short-term (Week 2)
- [ ] Configure OpTicAT database
- [ ] Build migration scripts
- [ ] Test migration on non-production data

### Mid-term (Week 3)
- [ ] Execute migration
- [ ] Configure GitHub integration
- [ ] Validate data integrity

### Long-term (Week 4+)
- [ ] Optimize sync performance
- [ ] Train team on new workflow
- [ ] Close migration ticket

---

## Notes

This ticket covers the critical path of migrating our ticket system infrastructure. The integration with OpTicAT provides enterprise-grade database capabilities while maintaining backward compatibility with GitHub's issue tracking system.

**Important**: Do not delete anything from `oldtickets/` until migration validation is complete. Maintain read-only access to the archive for historical reference.

## Attachments

[Migration Planning Doc](./MIGRATION-PREP.md)

[OpTicAT Setup Guide](OPTICAT-SETUP.md)

[GitHub Integration Config](./GITHUB-INTEGRATION.md)
