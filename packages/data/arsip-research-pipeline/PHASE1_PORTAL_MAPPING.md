# Phase 1: Portal Mapping & API Discovery

## Objective
Map each portal's structure, identify data export methods, and document systematic harvesting approach.

## Portals to Research

### 1. ANRI (Arsip Nasional Republik Indonesia)
- **URL**: https://anri.go.id
- **Est. Volume**: 500K+ documents
- **Collections to map**:
  - [ ] Naskah Proklamasi & Pendiri Negara
  - [ ] Arsip Konstitusi & Amandemen UUD
  - [ ] Dokumen Revolusi Kemerdekaan 1945-1949
  - [ ] Arsip Orde Lama (1945-1966)
  - [ ] Arsip Orde Baru (1966-1998)
  - [ ] Arsip Reformasi (1998-present)
  - [ ] Arsip Thematic (Ekonomi, Sosial, Budaya, dll)

**Research Tasks**:
- [ ] Identify collection structure/URLs
- [ ] Test search/browse functionality
- [ ] Find API endpoint (if exists)
- [ ] Check OAI-PMH availability
- [ ] Test pagination/download methods
- [ ] Map direct PDF link patterns
- [ ] Document access restrictions
- [ ] Find export/bulk download options

---

### 2. BPIP JDIH (Badan Pembinaan Ideologi Pancasila)
- **URL**: https://jdih.bpip.go.id
- **Est. Volume**: 1,000+ documents
- **Categories to harvest**:
  - [ ] Peraturan BPIP (48)
  - [ ] Keputusan Kepala (100+)
  - [ ] Surat Edaran (36)
  - [ ] Produk Hukum Lainnya (256)
  - [ ] Monografi (149)
  - [ ] Jurnal & Publikasi (18)
  - [ ] Putusan (8)

**Research Tasks**:
- [ ] Test JDIH search interface
- [ ] Extract all category links
- [ ] Map pagination/sorting options
- [ ] Check for API/data export
- [ ] Test OAI-PMH feed
- [ ] Document URL patterns for each doc type
- [ ] Check mobile/responsive UI for automation
- [ ] Test download link formats

---

### 3. MK (Mahkamah Konstitusi)
- **URL**: https://www.mkri.id
- **Est. Volume**: 2,000+ decisions (1998-present)
- **Decision types**:
  - [ ] Pengujian Undang-Undang (PUU)
  - [ ] Sengketa Kewenangan Lembaga Negara (SKLN)
  - [ ] Perselisihan Pemilihan Umum (PHPU)
  - [ ] Perselisihan Pemilihan Kepala Daerah (PHPKADA)

**Research Tasks**:
- [ ] Find putusan database/search page
- [ ] Test search by case type
- [ ] Test search by year/date range
- [ ] Check pagination limits
- [ ] Map putusan URL patterns
- [ ] Look for API or bulk export
- [ ] Check for OAI-PMH endpoint
- [ ] Identify any bot-blocking/access restrictions

---

### 4. MA (Mahkamah Agung)
- **URLs**: https://putusan3.mahkamahagung.go.id, https://bsdk.mahkamahagung.go.id
- **Est. Volume**: 100K+ decisions
- **Decision categories**:
  - [ ] Kasasi Pidana (Criminal)
  - [ ] Kasasi Perdata (Civil)
  - [ ] Kasasi Tipikor (Anti-corruption)
  - [ ] Kasasi Lingkungan (Environmental)
  - [ ] Peninjauan Kembali

**Research Tasks**:
- [ ] Test Putusan3 search interface
- [ ] Test BSDK database access
- [ ] Map case number search patterns
- [ ] Check year-based filtering
- [ ] Test pagination/result limits
- [ ] Map direct PDF download URLs
- [ ] Check for API endpoints
- [ ] Document any access throttling/blocking

---

### 5. PASAL.ID & Regulations
- **URLs**: https://pasal.id, https://peraturan.go.id
- **Est. Volume**: 20K+ regulations
- **Regulation types**:
  - [ ] UUD & Amendments
  - [ ] UU (Undang-Undang)
  - [ ] PP (Peraturan Pemerintah)
  - [ ] PERPRES (Peraturan Presiden)
  - [ ] Ministerial Regulations
  - [ ] PERDA (Regional)

**Research Tasks**:
- [ ] Test PASAL.ID search/browse
- [ ] Check for API or data export
- [ ] Map regulation number search
- [ ] Test category filtering
- [ ] Check amendment/status tracking
- [ ] Map direct document URLs
- [ ] Test peraturan.go.id (mirror/duplicate check)
- [ ] Look for bulk export options

---

### 6. Regional JDIH Networks
- **Base URL Pattern**: `jdih.[kota/kabupaten/provinsi].go.id`
- **Est. Volume**: 500K+ PERDA (provincial + local)
- **Research Scope**:
  - [ ] Map 34 province JDIH portals
  - [ ] Identify 300+ city/regency portals
  - [ ] Document URL patterns

**Research Tasks**:
- [ ] Create directory of province/city JDIH URLs
- [ ] Test search capabilities (sampling 5+ portals)
- [ ] Document pagination patterns
- [ ] Check for standardized API (if any)
- [ ] Map alternative sources for blocked portals

---

## API/Data Feed Discovery

For each portal, test for:
- [ ] REST API (JSON endpoints)
- [ ] OAI-PMH protocol (`/oai-pmh`, `/oai2`)
- [ ] RSS/Atom feeds
- [ ] CSV/JSON export buttons
- [ ] Bulk download features
- [ ] Database dump/snapshot availability

---

## Research Output Format

For each portal, document findings in:
```
portal_[name]_research.json
{
  "portal_name": "BPIP JDIH",
  "url": "https://jdih.bpip.go.id",
  "estimated_documents": 1000,
  "last_researched": "2026-09-02",
  "structure": {
    "search_endpoint": "/search",
    "browse_collections": [...]
  },
  "api": {
    "has_rest_api": false,
    "oai_pmh_endpoint": null,
    "export_formats": ["HTML"]
  },
  "pagination": {
    "method": "GET parameters",
    "parameters": "page=N&limit=20"
  },
  "url_patterns": {
    "document": "/dokumen/{id}.pdf",
    "search": "/search?q={query}"
  },
  "access_restrictions": [],
  "harvesting_strategy": "..."
}
```

---

## Progress Tracking

- [ ] ANRI mapping complete
- [ ] BPIP mapping complete
- [ ] MK mapping complete
- [ ] MA mapping complete
- [ ] PASAL.ID & Regulations mapping complete
- [ ] Regional JDIH mapping complete
- [ ] API discovery summary
- [ ] Consolidated portal reference created
