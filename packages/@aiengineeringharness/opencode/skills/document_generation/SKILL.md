---
name: document_generation
description: Generates various types of documents, including offers, invoices, reports, and templates, often based on structured data.
tools: - name: generate_offer_document
    description: Generates an offer document from provided data.
  - name: generate_invoice_document
    description: Generates an invoice document from provided data.
  - name: generate_report
    description: Generates a report based on specific criteria or data.
dependencies: []
---

# Document Generation Skill

This skill provides agents with the capability to create a variety of structured documents, such as offers, invoices, and reports. It automates the process of compiling information into professional, formatted outputs, which is crucial for business operations and client communication.

## Usage Guidelines

- Use `generate_offer_document` to create formal offers for clients, ensuring all pricing and service details are accurate.
- Employ `generate_invoice_document` to produce invoices based on completed work or accepted offers.
- Utilize `generate_report` for compiling data into summary reports, such as project status updates or financial summaries.
- Always confirm the data accuracy and user's intent before generating and finalizing documents, especially those with legal or financial implications.
- Ensure that generated documents comply with established templates, branding, and legal requirements.
- For documents that modify or represent financial transactions (offers, invoices), confirm user approval before finalization.
