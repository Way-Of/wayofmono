# WOW-047: System-Wide Knowledge Base Integration

## Problem Statement

The Way of Work platform requires a centralized, verifiable, and continuously updated knowledge base of critical Swedish construction regulations, certifications, industry standards, and relevant market data. Currently, such crucial information is being gathered ad-hoc through agent-specific research or is siloed, leading to potential inconsistencies, inefficiencies, and non-compliance risks across various agent functions (e.g., `maskinchef`, `skyddsombud`, `projektledare`). Without a unified and accessible knowledge base, agents cannot consistently provide 100% accurate, legally compliant, and up-to-date information, which is fundamental for reliable operations.

## Desired Outcome

A robust, system-wide knowledge base is established, accessible by all relevant agents and system components. This knowledge base will serve as the single source of truth for Swedish construction-related information, ensuring:
- Consistent, accurate, and legally compliant operations across the platform.
- Agents can efficiently query and retrieve up-to-date regulations, certifications, machine data, and industry standards.
- Reduced risk of non-compliance and improved decision-making capabilities for all agents.
- Streamlined processes for knowledge maintenance and validation.

## Requirements

### Functional Requirements
- [ ] **Data Consolidation (CRITICAL: ITEM-LEVEL GRANULARITY & CUMULATIVE DATABASE):** Integrate all existing research findings (currently in `data/knowledge_base/maskinchef_knowledge_base.json`) and future research into a *cumulative, structured, and queryable system-wide knowledge base*. This integration *must achieve item-level granularity*, where each fact (e.g., a specific regulation, a certification type, a machine model, a legal clause) is stored as a distinct record. Data must be appended and integrated, not overwritten, with the ultimate goal of persistent storage in SQLite.
- [ ] **Schema Definition (CRITICAL: ITEM-LEVEL SQLITE SCHEMA, COMPREHENSIVE INDUSTRY STANDARDS COMPLIANT):** Design a flexible and extensible *SQLite database schema* (`data/wayofwork.sqlite` or new dedicated DB) to store structured knowledge. This schema *must explicitly align with the comprehensive suite of relevant market and industry standards* including:
    *   **AMA** (Allmän material- och arbetsbeskrivning) for coding requirements.
    *   **CoClass** (Classification for the built environment, ISO 12006-2, IEC 81346) for object-oriented classification and faceted data structures.
    *   **BIP** (Building Information Properties) for standardized property naming and TypeIDs.
    *   **ISO 19650** for information management processes.
    *   **IFC** (Industry Foundation Classes, ISO 16739) for BIM data exchange compatibility.
    *   **GTIN (GS1)** for unique product identification.
    *   **Fi2** (Fastighetsbranschens Informationsstandard) for Facility Management data exchange.
    *   **Real Estate Core (REC)** for smart building ontologies.
    *   **EKS** (Eurokod Sverige) for mandatory building regulations.
    *   **Trafikverket's TDOK** for infrastructure specifications.
    This schema *must support item-level granularity*, including tables such as:
    *   `sources`: Stores metadata about each source URL (URL, authority, last_fetched, summary).
    *   `regulations`: Stores individual regulations (ID, source_id, name, description, legal_ref, valid_from, valid_to, **ama_code**, **coclass_code**, **eks_ref**, **tdok_ref**).
    *   `certifications`: Stores certification types (ID, source_id, name, description, authority, validity_period, renewal_freq, **ama_code**, **coclass_code**, **standard_ref**).
    *   `machines`: Stores machine specifications (ID, source_id, type, model, capabilities, usage, licensing_reqs, **coclass_code**, **ama_classification**, **gtin**).
    *   `properties`: Stores standardized properties from BIP (ID, name, definition, unit, coclass_element_id).
    *   `activities`: Stores definitions of standardized activities (ID, ama_code, coclass_code, description).
    *   `items_to_agent_map`: (Optional) Maps knowledge items to relevant agents.
    *   Relationships between these tables to ensure data integrity and query flexibility.
- [ ] **Data Ingestion Tool/Process (CRITICAL: SYSTEMATIC & ROBUST, PRIORITIZE DOWNLOADS, EXTENSIBLE SEARCH):** Implement a standardized, systematic, and robust tool or process for ingesting and structuring data from authorized sources. While currently leveraging the `research` skill and `web_fetch`, this process *must be designed to be extensible to incorporate other search functions or data sources in the future*. It *must prioritize the identification, download, and parsing of structured downloadable documents* (e.g., PDFs, Excel, CSV, JSON feeds) over less structured HTML scraping. It *must include advanced parsing capabilities to break down each fetched source (whether HTML or document) into individual, structured items* (e.g., regulations, certifications, machine models) for direct insertion into the SQLite database, ensuring proper data validation and integration into the cumulative knowledge base.
- [ ] **Relevance Filtering (CRITICAL: ENSURE APPLICABILITY):** Implement a robust mechanism to filter ingested data for relevance to the Way of Work platform's core domains (e.g., construction, machinery, safety, compliance, project management). Irrelevant information (e.g., bicycle theft prevention for a construction context) *must be automatically discarded or flagged* during ingestion to maintain knowledge base integrity and efficiency.
- [ ] **Knowledge Base Query API/Tool:** Provide a standardized API or tool that agents and system components can use to query the knowledge base for specific information (e.g., "get certification requirements for excavator operator").
- [ ] **Maintenance & Validation:** Establish a clear process and potentially automated tools for regular updates, validation, and versioning of the knowledge base content.
- [ ] **Agent Integration Example:** Demonstrate how at least one agent (e.g., `maskinchef`) successfully queries and utilizes information from this system-wide knowledge base.

### Technical Notes

- The knowledge base must prioritize *highly structured data*, but also accommodate unstructured text where broader context is necessary.
- CRITICAL: Integration with existing `data/wayofwork.sqlite` is the ultimate goal. This will likely require new tables and and schema migrations.
- The `maskinchef_knowledge_base.json` (now located at `data/knowledge_base/maskinchef_knowledge_base.json`) serves as a proof-of-concept for initial structured data extraction and will be the initial input for populating the SQLite database, with a focus on migrating its current summary-level data to item-level granularity.
- CRITICAL: The design of the schema and the parsing of data *must explicitly consider and align with the comprehensive suite of Swedish construction industry standards* (e.g., AMA, CoClass, BIP, ISO 19650, IFC, GTIN, Fi2, REC, EKS, Trafikverket's TDOK) to ensure full compliance and interoperability.
- CRITICAL: Implement specialized parsers for various document formats (e.g., PDF, Excel, CSV) to extract item-level knowledge systematically.
- The `research` skill (`.wo/skills/research/SKILL.md`) will be absolutely central for both initial population and ongoing maintenance of this knowledge base, leveraging its authorized URLs and its currently available tool (`web_fetch`). The system *must be designed to integrate other search functions or data sources* beyond `web_fetch` in the future.

## Meta

**ID**: WOW-047
**Created**: 2026-06-02
**Priority**: Critical
**Estimated Effort**: L
**Parent Ticket**: WOW-038
