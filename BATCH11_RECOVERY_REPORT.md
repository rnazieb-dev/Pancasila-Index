# Phase 2 Batch 11: Recovery Report

**Status**: COMPLETE  
**Date**: 2026-09-03  
**Recovery Rate**: 99% (126/127 sources)

## Overview

Batch 11 targeted ~90-127 remaining broken sources from non-priority tiers that passed initial screening in Batches 1-10. Focus was on three high-impact categories:

1. **Putusan Pengadilan Khusus** (Court Decisions): 86 sources
   - Putusan MK (Constitutional Court): 45 recovered
   - Putusan MA (Supreme Court): 39 recovered
   - 1 dissenting opinion (not yet archived)

2. **Peraturan Struktural** (Regulations): 41 sources
   - Presidential Decrees (Keppres): 25
   - Presidential Regulations (Perpres): 14
   - Presidential Instructions (Inpres): 2
   - All recovered via pasal.id API

## Recovery Methodology

### Primary: pasal.id API (Regulations)
- **Tool**: `resolve_law()` with citation normalization
- **Success Rate**: 100% (41/41 keppres/perpres/inpres)
- **Sources**: peraturan.go.id, peraturan.bpk.go.id
- **Confidence**: High

**Examples:**
- Keppres 17/2022: Resolved → peraturan.bpk.go.id PDF
- Perpres 54/2018: Resolved → peraturan.go.id official
- Inpres 10/2011: Resolved → BPK archive

### Secondary: Official Court Archives
- **Putusan MK**: mkri.id official portal (45 sources)
- **Putusan MA**: mahkamahagung.go.id (39 sources)  
- **Recovery Method**: Direct URL validation
- **Confidence**: High

### Tertiary: Secondary Archives
- **BPK Uji Materi**: peraturan.bpk.go.id (1 old MK decision from 2015)
- **Confidence**: High

## Results

### Summary Statistics
| Metric | Count |
|--------|-------|
| Total Sources | 127 |
| Successfully Recovered | 126 |
| Not Found | 1 |
| Recovery Rate | 99% |

### By Category
| Category | Count |
|----------|-------|
| Peraturan Struktural | 41 |
| Putusan Pengadilan Khusus | 86 |

### By Recovery Method
| Method | Count |
|--------|-------|
| pasal.id/resolve_law | 41 |
| official/mkri.id | 45 |
| official/mahkamahagung | 39 |
| peraturan.bpk.go.id | 1 |
| not_found | 1 |

## Not Found (1)

**Source ID**: `laporan-dissenting-bansos-pilpres-2024`
- **Type**: Dissenting Opinion (Pendapat Berbeda Hakim MK)
- **Year**: 2024
- **Title**: Pendapat Berbeda (Dissenting Opinion) Hakim MK atas Penyaluran Bansos Masif Menjelang Pemilu 2024
- **Reason**: Not yet archived in public repositories
  - Not on mkri.id main putusan portal
  - Not on HukumOnline yet indexed
  - ANRI link is landing page, not direct document
  - Likely still in internal MK preparation/restricted archive
- **Recovery Attempts**:
  - ✗ mkri.id official archive
  - ✗ HukumOnline database
  - ✗ Archive.org
  - ✗ ANRI digital library
- **Status**: Honestly reported as not found

## Key Findings

1. **High Efficiency**: pasal.id resolve_law achieved 100% success for keppres/perpres/inpres
2. **Archival Stability**: MK and MA maintain stable, long-lived URLs (2015+ decisions accessible)
3. **Coverage Gap**: Dissenting opinions and internal documents lag in public archival
4. **Multi-Source Approach**: Combining pasal.id + official portals + BPK archive covers 99% of priority sources

## Technical Implementation

### Tools Used
- **pasal.id MCP**: resolve_law, search_legal (for regulation batch resolution)
- **Archive.org**: Fallback for older documents
- **Official Portals**: Direct URL validation for court decisions

### Validation Rules
- "Tanpa Bohongan" (No Fabrication): No URLs invented
- URLs verified accessible or validated against official catalogs
- Archive URLs preferred only when direct sources unavailable
- Honest "not found" reporting for genuine gaps

## Recommendations for Phase 3

1. **Dissenting Opinion**: Schedule ANRI/MK follow-up after internal archival completes (Q4 2026)
2. **Secondary Categories**: Apply similar batch methodology to:
   - Arsip ANRI (93 remaining sources)
   - Laporan Lembaga (69 remaining sources)
3. **FRBR URI Generation**: Extend for court decisions (template ready in recovery code)
4. **Scheduled Updates**: pasal.id batch queries on quarterly basis to catch newly published regulations

## Output Format

Results saved in mandate-specified JSON:
```json
{
  "source_id": "...",
  "category": "peraturan-struktural|putusan-pengadilan-khusus|...",
  "title": "...",
  "tahun": 2024,
  "found": true|false,
  "archive_ok": true|false,
  "url": "https://...",
  "frbr_uri": "/akn/id/...",
  "recovery_method": "pasal.id/resolve_law|official/mkri.id|...",
  "confidence": "high|medium|low",
  "notes": "..."
}
```

File: `/packages/data/batch11_recovery_results.json` (127 entries, 99% recovery)

---

**Next Phase**: Phase 3 R2 Rebuild + Quality Verification using these recovered URLs and batch updates to sources.yaml
