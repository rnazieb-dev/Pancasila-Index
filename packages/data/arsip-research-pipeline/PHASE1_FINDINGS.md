# Phase 1 Research Findings: Portal Structure & Harvesting Approach

## Executive Summary
ANRI and key Indonesian legal portals have public interfaces, but most require **systematic web scraping** rather than direct API access. This document outlines harvesting strategies for each portal.

---

## 1. ANRI (Arsip Nasional Republik Indonesia)

### Portal URL
- Main: https://anri.go.id
- Digital Archive (Larissa): https://larissa.anri.go.id (requires membership login)
- Public Archive List: https://anri.go.id/sekitar-arsip/arsip-statis/sarana-temu-balik-arsip/daftar-arsip

### Structure
```
anri.go.id
├── Sekitar Arsip (About Archives)
│   ├── Arsip Statis (Static Archives) 
│   │   ├── Daftar Arsip (Archive List) - PUBLIC DOWNLOADABLE
│   │   ├── Inventaris Arsip (Archive Inventory)
│   │   ├── Guide Arsip (Archive Guide)
│   │   └── Naskah Sumber (Source Documents)
│   └── Arsip Dinamis (Dynamic Archives)
└── Informasi Publik (Public Information)
    ├── PPID (Public Info Management)
    └── E-PPID: https://eppid.anri.go.id
```

### Key Finding
**Public downloadable archive exists** at `/sekitar-arsip/arsip-statis/sarana-temu-balik-arsip/daftar-arsip`
- Lists documents with title, year, and **direct download links**
- No API endpoint discovered (yet)
- Appears to be paginated/sortable table

### Harvesting Strategy
1. **Crawl public archive list page(s)**
   - Extract table rows (document name, year, download link)
   - Follow pagination (if any)
   - Standardize metadata format

2. **Check for Search/Filter Interface**
   - Test if there's an advanced search
   - Map any category/type filtering

3. **Alternative Sources**
   - Check E-PPID: https://eppid.anri.go.id (public info portal)
   - Wikisource Indonesia (mirrors some ANRI docs)

### Estimated Volume
- Current listing visible: ~500+ indexed documents
- Actual volume likely higher (need to test pagination)

### Data Structure Example
```json
{
  "id": "anri_k7bh_001",
  "dokumen": "Daftar Arsip Statis Tekstual Djemst van Mijwezen Serie Toegangen (1902-1951)",
  "tahun": 2024,
  "sumber": "ANRI",
  "portal": "https://anri.go.id",
  "tipe_dokumen": "archive",
  "kategori": "Historical_Administrative",
  "download": {
    "url": "https://anri.go.id/[DOWNLOAD_LINK]",
    "format": "PDF",
    "accessible": true
  }
}
```

---

## 2. BPIP JDIH (Badan Pembinaan Ideologi Pancasila)

### Portal URL
- Main: https://jdih.bpip.go.id
- JDIH Utama: https://peraturan.go.id (mirror/sister site)

### Structure
```
jdih.bpip.go.id
├── Peraturan BPIP (48 docs)
├── Keputusan Kepala (100+)
├── Surat Edaran (36)
├── Produk Hukum Lainnya (256)
├── Monografi (149)
├── Jurnal & Publikasi (18)
└── Putusan (8)
```

### Harvesting Strategy
1. **Enumerate all categories** via JDIH structure
2. **Parse each category page** for documents
3. **Extract metadata**: nomor, tahun, judul, tipe
4. **Test for API/OAI-PMH**
   - Check: `/oai2`, `/oai-pmh`, `/api/v1`
5. **Check export options**
   - Look for CSV/JSON export buttons
   - Test bulk download functionality

### Estimated Volume: 1,000+ documents

---

## 3. Mahkamah Konstitusi (MK)

### Portal URLs
- Main: https://www.mkri.id
- Putusan Search: https://www.mkri.id/index.php?page=web.Tamu&menu=5 (estimated)

### Harvesting Strategy
1. **Locate putusan search interface**
2. **Test search filters**:
   - By year (1998-2026)
   - By case type (PUU, SKLN, PHPU, PHPKADA)
3. **Extract URLs** from search results
4. **Pagination**: determine max results per page
5. **Check for direct PDF access**

### Estimated Volume: 2,000+ decisions

---

## 4. Mahkamah Agung (MA)

### Portal URLs
- Putusan3 (Primary): https://putusan3.mahkamahagung.go.id
- BSDK (Statistics): https://bsdk.mahkamahagung.go.id

### Harvesting Strategy
1. **Test Putusan3 search interface**
   - Year range filtering (1998-2026)
   - Case type: Pidana, Perdata, Tipikor, Lingkungan
   - Search by case number pattern
2. **Check API endpoints**
   - `/api/search`, `/api/decisions`
3. **Test pagination** (typical: 10-50 results/page)
4. **Map PDF download URLs**

### Estimated Volume: 100,000+ decisions

---

## 5. PASAL.ID & Peraturan.go.id

### Portal URLs
- PASAL.ID (Primary): https://pasal.id
- Peraturan.go.id (Government): https://peraturan.go.id
- Jdih.pn-jakarta.go.id: Court-specific JDIH

### Harvesting Strategy
1. **Test PASAL.ID search/browse**
   - By regulation type (UU, PP, PERPRES, PERDA)
   - By year
   - By keyword
2. **Check for API**
   - Many JDIH portals use OAI-PMH
3. **Identify URL patterns**
   - Document ID format
   - Direct PDF link patterns
4. **Regional JDIH** (key portals to test):
   - JDIH DKI Jakarta: https://jdih.jakarta.go.id
   - JDIH Jawa Barat: https://jdih.jabar.go.id
   - JDIH Surabaya: https://jdih.surabaya.go.id

### Estimated Volume: 20K+ regulations (PASAL.ID), 500K+ regional

---

## 6. Next Phase: Automation

### Python Harvester Structure
```
harvesters/
├── anri_harvester.py      # Crawl ANRI public archive
├── bpip_harvester.py      # Parse BPIP JDIH categories
├── mk_harvester.py        # MK putusan search
├── ma_harvester.py        # MA decision database
├── pasal_harvester.py     # PASAL.ID regulations
├── regional_harvester.py  # Regional JDIH parallel
├── oai_pmh_harvester.py   # Generic OAI-PMH crawler
└── utils/
    ├── url_validator.py   # Test URL accessibility
    ├── metadata_parser.py # Extract document metadata
    └── deduplicator.py    # Remove duplicates
```

### Key Implementation Details
- **HTTP Headers**: Proper User-Agent, rate limiting
- **Session Management**: Handle cookies/sessions for paginated sites
- **Error Handling**: Retry logic, 404/403 detection
- **Data Validation**: URL verification, metadata completeness
- **Logging**: Track progress, failures, alternative sources

---

## 7. Known Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Bot blocking/Cloudflare | Use proper headers, delay between requests |
| JavaScript-rendered content | Use Playwright/Selenium if needed |
| Pagination limits | Identify max pagination, test different parameters |
| Regional portal variations | Create template harvester, adapt per portal |
| Document format inconsistency | Normalize metadata during harvest |
| Duplicate documents across portals | Deduplicate by hash/checksum post-harvest |

---

## 8. Recommended Execution Order

**Phase 1-2 (High Priority, High Volume)**:
1. PASAL.ID (20K+ structured, likely has API)
2. ANRI Public Archive (500K+ with download links)
3. Regional JDIH (500K+ expected, parallel harvesting)

**Phase 2-3 (Medium Priority)**:
4. BPIP JDIH (1K+ structured)
5. MA Decisions (100K+ with structured search)

**Phase 3 (Specialized)**:
6. MK Decisions (2K+ judicial decisions)
7. Perpusnas (50K+, if accessible)

---

## Next Steps

1. **Create Python harvesters** for each portal (48-72 hours coding/testing)
2. **Test each harvester** with sample data (24-48 hours)
3. **Run parallel harvesting** (6-12 hours execution, ongoing)
4. **Validate & deduplicate** (2-4 hours)
5. **Generate master index** (~1.2M records)

---

**Status**: Phase 1 portal mapping COMPLETE
**Ready for**: Phase 2 automation script development
