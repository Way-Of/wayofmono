# WOW-048: Task Time Usage Knowledge Base

## Problem Statement

The Way of Work platform currently lacks a robust, integrated knowledge base for construction task time usages, leading to challenges in estimation, scheduling, and performance analysis. While **Byggandets tidsåtgånger (BEA) by Wikells Sektionsdata** is identified as the authoritative industry standard for labor time consumption in Sweden, the platform currently does not leverage this critical resource. This absence results in an unsustainable and unreliable ad-hoc approach to time estimation, hindering the precision and efficiency of agents like `kalkylator` and `schemaplanerare`, and ultimately impacting project profitability and timely completion.

## Desired Outcome

A robust, system-wide knowledge base leveraging **Byggandets tidsåtgånger (BEA) by Wikells Sektionsdata** (or equivalent authoritative sources) is established, containing standardized time usages for thousands of construction tasks. This knowledge base will:
- Serve as the authoritative source for accurate time estimates across a vast array of common and specialized construction activities.
- Enable `kalkylator` to generate highly precise and industry-standard cost and time estimations.
- Allow `schemaplanerare` to create more efficient, realistic, and compliant project schedules.
- Facilitate performance tracking and analysis against recognized industry benchmarks.
- Be continuously updated and verifiable for accuracy, mirroring updates in authoritative sources like BEA.

## Requirements

### Functional Requirements
- [ ] **Data Identification & Sourcing (CRITICAL: ALL INFO MUST BE SOURCED):** Identify and meticulously source *all critical information* from authoritative sources like **Byggandets tidsåtgånger (BEA) by Wikells Sektionsdata** (including Sektionsfakta and associated AMA classification codes), and other industry standards, historical project data, and expert input. The goal is to ensure comprehensive coverage for thousands of task moments.
- [ ] **Schema Definition (CRITICAL: ITEM-LEVEL SQLITE SCHEMA, MARKET STANDARDS COMPLIANT):** Design a flexible and extensible *SQLite database schema* (`data/wayofwork.sqlite` or new dedicated DB) to store task time usages. This schema *must explicitly align with relevant market and industry standards* (e.g., AMA for classifications, BEA's data structures for time usages, Sektionsfakta's data models) and *must support item-level granularity*. It should include tables that represent:
    *   **Tasks:** Specific construction tasks (e.g., "Gräva grop", "Montera armering")
    *   **Materials:** Material types and quantities involved.
    *   **Conditions:** Environmental and ground conditions.
    *   **Machines/Tools:** Equipment used.
    *   **Worker Qualifications:** Skill levels and required certifications.
    *   **Time Values:** The associated time usages (min, max, average, unit, source reference, BEA code, AMA chapter).
    *   Relationships between these tables to ensure data integrity and query flexibility.
- [ ] **Data Ingestion Tool/Process (CRITICAL: SYSTEMATIC & ROBUST, PRIORITIZE DOWNLOADS, EXTENSIBLE SEARCH):** Implement a standardized, systematic, and robust tool or process for ingesting and structuring data from authoritative sources. While currently leveraging the `research` skill and `web_fetch`, this process *must be designed to be extensible to incorporate other search functions or data sources in the future*. It *must prioritize the identification, download, and parsing of structured downloadable documents* (e.g., BEA's Sektionsfakta data, PDFs, Excel, CSV, JSON feeds) over less structured HTML scraping. It *must include advanced parsing capabilities to break down each fetched source (whether HTML or document) into individual, structured task time usage items* for direct insertion into the SQLite database, ensuring proper data validation and integration into the cumulative knowledge base.
- [ ] **Relevance Filtering (CRITICAL: ENSURE APPLICABILITY):** Implement a robust mechanism to filter ingested data for relevance to construction task time usages, focusing on factors like material type, ground condition, machinery used, and worker skill level. Irrelevant information *must be automatically discarded or flagged* during ingestion to maintain knowledge base integrity and efficiency.
- [ ] **Knowledge Base Query API/Tool:** Provide a standardized API or tool for agents and system components to query the knowledge base for specific task time usages (e.g., "get time to dig 10m of trench in tarmac with a mini-excavator").
- [ ] **Maintenance & Validation:** Establish a clear process and potentially automated tools for regular updates and validation of the knowledge base content to ensure its ongoing accuracy.

### Technical Notes

- The knowledge base must be *highly granular* to support precise estimations, reflecting the complexity of real-world construction tasks.
- Integration with existing `data/wayofwork.sqlite` is preferred, potentially requiring new tables or schema extensions. Alternatively, a new dedicated SQLite database file may be considered if scope necessitates.
- CRITICAL: Implement robust mechanisms for versioning time usage data to track changes over time and maintain an audit trail for data accuracy.
- CRITICAL: The data modeling (schema) and data values *must explicitly conform to Swedish construction industry standards* such as AMA (Allmän material- och arbetsbeskrivning), MER (Mät- och ersättningsregler), and the detailed data structures used by **Wikells Sektionsdata's BEA (Byggandets tidsåtgånger)**. Research on available API/data formats from Wikells Sektionsdata (e.g., Sektionsfakta) is essential to ensure this conformity.
- Consider direct integration or API access to **Wikells Sektionsdata** if feasible, or implement sophisticated data ingestion strategies (leveraging the `research` skill) for data extraction from their online platforms (e.g., Sektionsfakta) and other relevant industry sources. This must be designed to be extensible to incorporate other search functions or data sources beyond `web_fetch` in the future.

## Meta

**ID**: WOW-048
**Created**: 2026-06-02
**Priority**: High
**Estimated Effort**: L
**Parent Ticket**: None
