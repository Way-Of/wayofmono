---
type: hardware_costs
version: "1.0"
required_vars:
  - project_name
  - current_date
  - document_version
---

# {{project_name}} - Hardware Infrastructure Costs

**Document**: Hardware Infrastructure Costs
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Development Hardware

| Item | Quantity | Unit Cost | Total Cost | Replacement Cycle |
|------|----------|-----------|------------|-------------------|
| [Laptop Model] | [Qty] | [Amt] | [Amt] | [Years] |
| [Monitor] | [Qty] | [Amt] | [Amt] | [Years] |
| [Peripherals] | [Qty] | [Amt] | [Amt] | [Years] |
| [Mobile Device] | [Qty] | [Amt] | [Amt] | [Years] |
| **Total** | | | **[Amt]** | |

---

## Server Hardware (Self-Hosted)

{{#if false}}
| Item | Specification | Quantity | Total Cost |
|------|--------------|----------|------------|
| [Server] | [Spec] | [Qty] | [Amt] |
| [Storage] | [Spec] | [Qty] | [Amt] |
| [Network] | [Spec] | [Qty] | [Amt] |
| **Total Server** | | | **[Amt]** |
{{/if}}

*[Note: Cloud-hosted — no server hardware costs]*

---

## Network Equipment

| Item | Quantity | Unit Cost | Total Cost |
|------|----------|-----------|------------|
| [Router] | [Qty] | [Amt] | [Amt] |
| [Switch] | [Qty] | [Amt] | [Amt] |
| [Firewall] | [Qty] | [Amt] | [Amt] |
| [Access Points] | [Qty] | [Amt] | [Amt] |
| **Total Network** | | | **[Amt]** |

---

## Office Equipment

| Item | Quantity | Unit Cost | Total Cost |
|------|----------|-----------|------------|
| [Furniture] | [Qty] | [Amt] | [Amt] |
| [NAS/Storage] | [Qty] | [Amt] | [Amt] |
| [Printer/Scanner] | [Qty] | [Amt] | [Amt] |
| [AV Equipment] | [Qty] | [Amt] | [Amt] |
| **Total Office** | | | **[Amt]** |

---

## Testing Devices

| Device | Purpose | Quantity | Total Cost |
|--------|---------|----------|------------|
| [Device 1] | [Purpose] | [Qty] | [Amt] |
| [Device 2] | [Purpose] | [Qty] | [Amt] |
| [Device 3] | [Purpose] | [Qty] | [Amt] |
| **Total Testing** | | | **[Amt]** |

---

## Depreciation Schedule

| Asset Category | Total Cost | Useful Life (Years) | Annual Depreciation |
|----------------|-----------|---------------------|---------------------|
| Development Hardware | [Amt] | [Years] | [Amt] |
| Network Equipment | [Amt] | [Years] | [Amt] |
| Office Equipment | [Amt] | [Years] | [Amt] |
| Testing Devices | [Amt] | [Years] | [Amt] |
| **Total** | **[Amt]** | | **[Amt]** |

---

## Summary

| Category | One-Time Cost | Annual Depreciation | Annual Maintenance |
|----------|--------------|---------------------|-------------------|
| Development Hardware | [Amt] | [Amt] | [Amt] |
| Server Hardware | [Amt] | [Amt] | [Amt] |
| Network Equipment | [Amt] | [Amt] | [Amt] |
| Office Equipment | [Amt] | [Amt] | [Amt] |
| Testing Devices | [Amt] | [Amt] | [Amt] |
| **Grand Total** | **[Amt]** | **[Amt]** | **[Amt]** |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
