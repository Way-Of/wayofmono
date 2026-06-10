# AMiner Open Platform API Reference Manual

**Base URL**: `https://datacenter.aminer.cn/gateway/open_platform`
**Authentication**: All requests carry `Authorization: <TOKEN>` in the request header
**Token**: Login to the [console](https://open.aminer.cn/open/board?tab=control) to generate, replace `<TOKEN>` with your actual Token in all curl examples below.

---

## Table of Contents

- [Paper APIs (9)](#paper-apis)
- [Scholar APIs (6)](#scholar-apis)
- [Organization APIs (7)](#organization-apis)
- [Venue APIs (3)](#venue-apis)
- [Patent APIs (3)](#patent-apis)

---

## Paper APIs

### 1. Paper Search

- **URL**: `GET /api/paper/search`
- **Price**: Free
- **Description**: Search by paper title, returns paper ID, title, DOI

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| page | number | Yes | Page number (starts from 0, max 0) |
| size | number | No | Items per page |
| title | string | Yes | Paper title keywords |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Paper ID |
| title | Paper English title |
| title_zh | Paper title |
| doi | DOI |
| total | Total count |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/search?page=0&size=5&title=BERT' \
  -H 'Authorization: <TOKEN>'
```

---

### 2. Paper Search Pro

- **URL**: `GET /api/paper/search/pro`
- **Price**: ¥0.01/call
- **Description**: Multi-condition search, supports keywords, abstract, author, organization, venue filters

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| page | number | No | Page number (starts from 0) |
| size | number | No | Items per page |
| title | string | No | Title keywords |
| keyword | string | No | Keywords |
| abstract | string | No | Abstract keywords |
| author | string | No | Author name |
| org | string | No | Organization name |
| venue | string | No | Venue name |
| order | string | No | Sort field: `year` (year desc) or `n_citation` (citation desc), omit for comprehensive sort |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Paper ID |
| title | English title |
| title_zh | Title |
| doi | DOI |
| total | Total count |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/search/pro?title=transformer&author=Vaswani&order=n_citation&page=0&size=5' \
  -H 'Authorization: <TOKEN>'
```

---

### 3. Paper QA Search

- **URL**: `POST /api/paper/qa/search`
- **Price**: ¥0.05/call
- **Description**: AI intelligent Q&A search, supports natural language questions and structured keyword joint search

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| use_topic | boolean | Yes | Whether to use joint keyword search. `true` uses topic field, `false` uses title/query |
| topic_high | string | No | Required-match keywords (AND logic), nested array format: `[["termA","termB"],["termC"]]` outer AND, inner OR |
| topic_middle | string | No | High-weight keywords, same format as topic_high |
| topic_low | string | No | Low-weight keywords, same format as topic_high |
| title | []string | No | Title query when use_topic=false |
| doi | string | No | DOI exact match |
| year | []number | No | Year filter array |
| sci_flag | boolean | No | Return only SCI papers |
| n_citation_flag | boolean | No | Bonus for high-citation papers |
| size | number | No | Return count (max) |
| offset | number | No | Offset |
| force_citation_sort | boolean | No | Sort strictly by citation count |
| force_year_sort | boolean | No | Sort strictly by year |
| author_terms | []string | No | Author name query, OR within array, suggest variants |
| org_terms | []string | No | Organization name query, OR within array |
| query | string | No | Natural language question (slower), system auto-extracts keywords. Takes precedence over topic_high when both present |

**Response Fields:**

| Field | Description |
|--------|------|
| data | Paper ID list |
| id | Paper ID |
| title | Paper title |
| title_zh | Title |
| doi | DOI |
| Total / total | Total count |

**curl Example (Natural Language Q&A):**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/qa/search' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"use_topic": false, "query": "deep learning protein structure prediction", "size": 10, "sci_flag": true}'
```

**curl Example (Structured Keywords):**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/qa/search' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{
    "use_topic": true,
    "topic_high": "[[\\"transformer\\",\\"self-attention\\"],[\\"protein folding\\"]]",
    "topic_middle": "[[\"AlphaFold\"]]",
    "sci_flag": true,
    "force_citation_sort": true,
    "size": 10
  }'
```

---

### 4. Paper Info

- **URL**: `POST /api/paper/info`
- **Price**: Free
- **Description**: Batch get basic paper info by ID (title, volume, journal, authors)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| ids | []string | Yes | Paper ID array |

**Response Fields:**

| Field | Description |
|--------|------|
| _id | Paper ID |
| title | Paper title |
| authors | Author list (with name) |
| issue | Volume |
| raw | Journal name |
| venue | Journal info object |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/info' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"ids": ["53e9ab9bb7602d97023e53b2", "53e9a98eb7602d9703e42e5a"]}'
```

---

### 5. Paper Detail

- **URL**: `GET /api/paper/detail`
- **Price**: ¥0.01/call
- **Description**: Get full paper detail by ID

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Paper ID |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Paper ID |
| title | English title |
| title_zh | Title |
| abstract | Abstract |
| abstract_zh | Abstract |
| authors | Author list (name/org) |
| doi | DOI |
| issn | ISSN |
| issue | Volume |
| volume | Issue |
| year | Year |
| keywords | Keywords |
| keywords_zh | Keywords |
| raw | Journal name |
| venue | Journal info object |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/detail?id=53e9ab9bb7602d97023e53b2' \
  -H 'Authorization: <TOKEN>'
```

---

### 6. Paper Citation

- **URL**: `GET /api/paper/relation`
- **Price**: ¥0.10/call
- **Description**: Get the list of papers cited by this paper

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Paper ID |

**Response Fields:**

| Field | Description |
|--------|------|
| _id | Paper ID |
| title | Title |
| cited | Other papers cited by this paper |
| n_citation | Citation count |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/relation?id=53e9ab9bb7602d97023e53b2' \
  -H 'Authorization: <TOKEN>'
```

---

### 7. Paper Search (Comprehensive)

- **URL**: `GET /api/paper/list/by/search/venue`
- **Price**: ¥0.30/call
- **Description**: Get full paper info (with abstract, organization, venue details) by keyword, author, or venue name

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| page | number | Yes | Page number |
| size | number | Yes | Items per page |
| keyword | string | No | Keywords (mutually exclusive with venue/author) |
| venue | string | No | Venue name (mutually exclusive with keyword/author) |
| author | string | No | Author name (mutually exclusive with keyword/venue) |
| order | string | No | Sort: `year` or `n_citation`, omit for comprehensive sort |

**Response Fields (main):**

| Field | Description |
|--------|------|
| _id | Paper ID |
| title / title_zh | Paper title |
| abstract / abstract_zh | Abstract |
| authors | Author info (with org ID, alias, details) |
| venue | Venue info (name, alias) |
| venue_hhb_id | Venue ID |
| keywords / keywords_zh | Keywords |
| year | Publication year |
| n_citation | Citation count |
| doi | DOI |
| url | Paper URL |
| total | Total count |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/list/by/search/venue?keyword=graph+neural+network&page=0&size=10&order=n_citation' \
  -H 'Authorization: <TOKEN>'
```

---

### 8. Paper Batch Query (Multi-keyword)

- **URL**: `GET /api/paper/list/citation/by/keywords`
- **Price**: ¥0.10/call
- **Description**: Get paper keywords, abstract, etc. by multiple keywords

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| page | number | Yes | Page number |
| size | number | Yes | Items per page |
| keywords | string | Yes | Keyword array (JSON string format) |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Paper ID |
| title / title_zh | Title |
| abstract / abstract_zh | Abstract |
| keywords / keywords_zh | Keywords |
| doi | DOI |
| year | Year |
| total | Total count |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/list/citation/by/keywords?page=0&size=10&keywords=%5B%22deep+learning%22%2C%22object+detection%22%5D' \
  -H 'Authorization: <TOKEN>'
```

---

### 9. Paper Detail by Year and Venue

- **URL**: `GET /api/paper/platform/allpubs/more/detail/by/ts/org/venue`
- **Price**: ¥0.20/call
- **Description**: Get paper title, authors, DOI, keywords by publication year and venue

> **Note**: `venue_id` and `year` must be passed together; passing only `year` returns `null`. Use **venue search** API first to get `venue_id`.

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| year | number | Yes | Publication year |
| venue_id | string | Yes | Venue ID (from venue search API; returns null if omitted) |

**Response Fields (main):**

| Field | Description |
|--------|------|
| _id | Paper ID |
| title / title_zh | Title |
| abstract | Abstract |
| authors | Author array (name/org/email/homepage/orc_id/_id) |
| doi | DOI |
| issn | ISSN |
| keywords / keywords_zh | Keywords |
| year | Year |
| venue | Venue info |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/paper/platform/allpubs/more/detail/by/ts/org/venue?year=2023&venue_id=<VENUE_ID>' \
  -H 'Authorization: <TOKEN>'
```

---

## Scholar APIs

### 10. Scholar Search

- **URL**: `POST /api/person/search`
- **Price**: Free
- **Description**: Search scholars by name (or organization), returns ID, name, organization

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| name | string | No | Scholar name |
| org | string | No | Organization name |
| org_id | []string | No | Organization entity ID array |
| offset | number | No | Start position (max 0) |
| size | number | No | Return count (max 10) |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Scholar ID |
| name | English name |
| name_zh | Name |
| org | English organization |
| org_zh | Organization |
| org_id | Organization ID |
| interests | Research interests |
| n_citation | Citation count |
| total | Total count |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/person/search' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"name": "Andrew Ng", "size": 5}'
```

---

### 11. Scholar Detail

- **URL**: `GET /api/person/detail`
- **Price**: ¥1.00/call
- **Description**: Get full scholar profile by ID

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Scholar ID |

**Response Fields:**

| Field | Description |
|--------|------|
| id / person_id | Scholar ID |
| name / name_zh | Name |
| bio / bio_zh | Bio |
| edu / edu_zh | Education |
| orgs / org_zhs | Organization list |
| position / position_zh | Position |
| domain | Research domain |
| honor | Honors |
| award | Awards |
| year | Year |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/person/detail?id=53f3ae78dabfae4b34b0c75d' \
  -H 'Authorization: <TOKEN>'
```

---

### 12. Scholar Figure

- **URL**: `GET /api/person/figure`
- **Price**: ¥0.50/call
- **Description**: Get research interests, domains, and structured work/education history

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Scholar ID |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Scholar ID |
| ai_interests | Research interests list |
| ai_domain | Research domains list |
| edus | Structured education history |
| works | Structured work history |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/person/figure?id=53f3ae78dabfae4b34b0c75d' \
  -H 'Authorization: <TOKEN>'
```

---

### 13. Scholar Papers

- **URL**: `GET /api/person/paper/relation`
- **Price**: ¥1.50/call
- **Description**: Get scholar's published paper list (ID + title)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Scholar ID |

**Response Fields:**

| Field | Description |
|--------|------|
| author_id | Scholar ID |
| id | Paper ID |
| title | Paper title |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/person/paper/relation?id=53f3ae78dabfae4b34b0c75d' \
  -H 'Authorization: <TOKEN>'
```

---

### 14. Scholar Patents

- **URL**: `GET /api/person/patent/relation`
- **Price**: ¥1.50/call
- **Description**: Get scholar's related patent list

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Scholar ID |

**Response Fields:**

| Field | Description |
|--------|------|
| patent_id | Patent ID |
| person_id | Scholar ID |
| title | Patent title |
| en | English title |
| zh | Title |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/person/patent/relation?id=53f3ae78dabfae4b34b0c75d' \
  -H 'Authorization: <TOKEN>'
```

---

### 15. Scholar Projects

- **URL**: `GET /api/project/person/v3/open`
- **Price**: ¥3.00/call
- **Description**: Get scholar's research projects (funding amount, time, source)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | No | Scholar ID |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Project ID |
| titles | Project titles |
| country | Country |
| project_source | Project source |
| fund_amount | Funding amount |
| fund_currency | Funding currency |
| start_date | Start date |
| end_date | End date |
| total | Total count |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/project/person/v3/open?id=53f3ae78dabfae4b34b0c75d' \
  -H 'Authorization: <TOKEN>'
```

---

## Organization APIs

### 16. Organization Search

- **URL**: `POST /api/organization/search`
- **Price**: Free
- **Description**: Search organization ID and name by keyword

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| orgs | []string | No | Organization name array |

**Response Fields:**

| Field | Description |
|--------|------|
| org_id | Organization ID |
| org_name | Organization name |
| total | Total count |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/organization/search' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"orgs": ["Tsinghua University"]}'
```

---

### 17. Organization Detail

- **URL**: `POST /api/organization/detail`
- **Price**: ¥0.01/call
- **Description**: Get organization detail by ID

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| ids | []string | Yes | Organization ID array |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Organization ID |
| name / name_en / name_zh | Organization name |
| acronyms | Acronyms |
| aliases | Alias list |
| details | Organization description |
| type | Organization type (university/enterprise/etc.) |
| location | Location |
| language | Language |
| total | Total count |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/organization/detail' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"ids": ["5f71b2091c455f439fe9a7d7"]}'
```

---

### 18. Organization Scholars

- **URL**: `GET /api/organization/person/relation`
- **Price**: ¥0.50/call
- **Description**: Get scholar list under an organization (returns 10 per call)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| org_id | string | No | Organization ID |
| offset | number | No | Start position (fixed 10 per call) |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Scholar ID |
| name / name_zh | Scholar name |
| org / org_zh | Organization |
| org_id | Organization ID |
| total | Total count |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/organization/person/relation?org_id=5f71b2091c455f439fe9a7d7&offset=0' \
  -H 'Authorization: <TOKEN>'
```

---

### 19. Organization Papers

- **URL**: `GET /api/organization/paper/relation`
- **Price**: ¥0.10/call
- **Description**: Get paper list published by organization scholars (returns 10 per call)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| org_id | string | Yes | Organization ID |
| offset | number | Yes | Start position (fixed 10 per call) |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Paper ID |
| title / title_zh | Title |
| doi | DOI |
| total | Total count |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/organization/paper/relation?org_id=5f71b2091c455f439fe9a7d7&offset=0' \
  -H 'Authorization: <TOKEN>'
```

---

### 20. Organization Patents

- **URL**: `GET /api/organization/patent/relation`
- **Price**: ¥0.10/call
- **Description**: Get patent ID list owned by organization, supports pagination, max 10000 per call

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Organization ID |
| page | number | No | Page number (starts from 1) |
| page_size | number | No | Items per page, max 10000 |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Patent ID |
| total | Total count |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/organization/patent/relation?id=6233173d0a6eb145604733e2&page=1&page_size=100' \
  -H 'Authorization: <TOKEN>'
```

---

### 21. Organization Disambiguation

- **URL**: `POST /api/organization/na`
- **Price**: ¥0.01/call
- **Description**: Get standardized organization name from string (including abbreviations/aliases)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| org | string | Yes | Organization name (may include aliases/abbreviations) |

**Response Fields:**

| Field | Description |
|--------|------|
| org_name | Normalized organization name |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/organization/na' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"org": "MIT CSAIL"}'
```

---

### 22. Organization Disambiguation Pro

- **URL**: `POST /api/organization/na/pro`
- **Price**: ¥0.05/call
- **Description**: Extract primary and secondary organization IDs from string (recommended for workflows)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| org | string | Yes | Organization name |

**Response Fields:**

| Field | Description |
|--------|------|
| | Primary organization name |
| ID | Primary organization ID |
| | Secondary organization name |
| ID | Secondary organization ID |
| Total / total | Total count |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/organization/na/pro' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"org": "Department of Computer Science, Tsinghua University"}'
```

---

## Venue APIs

### 23. Venue Search

- **URL**: `POST /api/venue/search`
- **Price**: Free
- **Description**: Search venue ID and standard name by venue name

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| name | string | No | Venue name (supports fuzzy search) |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Venue ID |
| name_en | Venue English name |
| name_zh | Venue name |
| total | Total count |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/venue/search' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"name": "NeurIPS"}'
```

---

### 24. Venue Detail

- **URL**: `POST /api/venue/detail`
- **Price**: ¥0.20/call
- **Description**: Get ISSN, abbreviation, type, etc. by venue ID

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Venue ID |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Venue ID |
| name / name_en / name_zh | Name |
| issn | ISSN |
| eissn | EISSN |
| alias | Alias |
| type | Venue type |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/venue/detail' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"id": "<VENUE_ID>"}'
```

---

### 25. Venue Papers

- **URL**: `POST /api/venue/paper/relation`
- **Price**: ¥0.10/call
- **Description**: Get paper list by venue ID (supports year filter)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Venue ID |
| offset | number | No | Start position |
| limit | number | No | Return count |
| year | number | No | Filter by year |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Paper ID |
| title | Paper title |
| year | Year |
| offset | Current offset |
| total | Total count |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/venue/paper/relation' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"id": "<VENUE_ID>", "year": 2023, "offset": 0, "limit": 20}'
```

---

## Patent APIs

### 26. Patent Search

- **URL**: `POST /api/patent/search`
- **Price**: Free
- **Description**: Search patents by name/keywords

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| query | string | Yes | Query field (patent title/keywords) |
| page | number | Yes | Page number |
| size | number | Yes | Items per page |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Patent ID |
| title | Patent English title |
| title_zh | Patent title |

**curl Example:**
```bash
curl -X POST \
  'https://datacenter.aminer.cn/gateway/open_platform/api/patent/search' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -H 'Authorization: <TOKEN>' \
  -d '{"query": "quantum computing chip", "page": 0, "size": 10}'
```

---

### 27. Patent Info

- **URL**: `GET /api/patent/info`
- **Price**: Free
- **Description**: Get basic patent info by ID (title/patent number/inventor)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Patent ID |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Patent ID |
| title / en | Patent title (English) |
| app_num | Application number |
| pub_num | Publication number |
| pub_kind | Publication type |
| inventor | Inventor |
| country | Country |
| sequence | Sequence |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/patent/info?id=<PATENT_ID>' \
  -H 'Authorization: <TOKEN>'
```

---

### 28. Patent Detail

- **URL**: `GET /api/patent/detail`
- **Price**: ¥0.01/call
- **Description**: Get full patent detail by ID (abstract/application date/assignee/IPC classification, etc.)

**Request Parameters:**

| Parameter | Type | Required | Description |
|--------|------|------|------|
| id | string | Yes | Patent ID |

**Response Fields:**

| Field | Description |
|--------|------|
| id | Patent ID |
| title | Patent title |
| abstract | Abstract |
| app_date | Application date |
| app_num | Application number |
| pub_date | Publication date |
| pub_num | Publication number |
| pub_kind | Publication type |
| assignee | Assignee |
| inventor | Inventor |
| country | Country |
| ipc | IPC classification |
| ipcr | IPCR classification |
| cpc | CPC classification |
| priority | Priority info |
| description | Description |

**curl Example:**
```bash
curl -X GET \
  'https://datacenter.aminer.cn/gateway/open_platform/api/patent/detail?id=<PATENT_ID>' \
  -H 'Authorization: <TOKEN>'
```

---

## Appendix: API Price Summary

| Category | Free APIs | Paid APIs |
|------|---------|---------|
| Papers | Paper Search, Paper Info | Paper Search Pro, Paper Detail, Paper Citation, Paper QA Search, Paper Search Comprehensive, Paper Batch Query, Paper by Year/Venue |
| Scholars | Scholar Search | Scholar Detail, Scholar Figure, Scholar Papers, Scholar Patents, Scholar Projects |
| Organizations | Organization Search | Organization Detail, Organization Scholars, Organization Papers, Organization Patents, Organization Disambiguation, Organization Disambiguation Pro |
| Venues | Venue Search | Venue Detail, Venue Papers |
| Patents | Patent Search, Patent Info | Patent Detail |
