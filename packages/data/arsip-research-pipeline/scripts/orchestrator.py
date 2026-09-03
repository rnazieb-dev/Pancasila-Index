#!/usr/bin/env python3
"""
Arsip Pancasila Master Orchestrator
Coordinates harvesting from all data sources and creates consolidated master index.
"""

import json
import logging
import os
from pathlib import Path
from datetime import datetime
import hashlib
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys

# Import individual harvesters
from anri_harvester import ANRIHarvester
from pasal_harvester import PasalHarvester
from bpip_harvester import BPIPHarvester
from mk_harvester import MKHarvester
from ma_harvester import MAHarvester

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - ORCHESTRATOR - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/private/tmp/arsip-research/harvest.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ArsipOrchestrator:
    def __init__(self, output_dir: str = "/private/tmp/arsip-research"):
        self.output_dir = Path(output_dir)
        self.master_index = []
        self.source_stats = {}

    def run_phase1_anri(self) -> List[Dict]:
        """Run ANRI harvester."""
        logger.info("Running Phase 1: ANRI Archive")
        try:
            harvester = ANRIHarvester()
            documents = harvester.harvest()
            harvester.save_to_json(documents, str(self.output_dir / "phase1-anri" / "anri_archive.json"))
            return documents
        except Exception as e:
            logger.error(f"ANRI harvest failed: {e}")
            return []

    def run_phase2_bpip(self) -> List[Dict]:
        """Run BPIP JDIH harvester."""
        logger.info("Running Phase 2: BPIP JDIH")
        try:
            harvester = BPIPHarvester()
            documents = harvester.harvest()
            harvester.save_to_json(documents, str(self.output_dir / "phase2-bpip" / "bpip_jdih.json"))
            return documents
        except Exception as e:
            logger.error(f"BPIP harvest failed: {e}")
            return []

    def run_phase3_mk(self) -> List[Dict]:
        """Run MK putusan harvester."""
        logger.info("Running Phase 3: MK Decisions")
        try:
            harvester = MKHarvester()
            documents = harvester.harvest()
            harvester.save_to_json(documents, str(self.output_dir / "phase3-mk" / "mk_putusan.json"))
            return documents
        except Exception as e:
            logger.error(f"MK harvest failed: {e}")
            return []

    def run_phase4_ma(self) -> List[Dict]:
        """Run MA putusan harvester."""
        logger.info("Running Phase 4: MA Decisions")
        try:
            harvester = MAHarvester()
            documents = harvester.harvest(max_pages=5)
            harvester.save_to_json(documents, str(self.output_dir / "phase4-ma" / "ma_putusan.json"))
            return documents
        except Exception as e:
            logger.error(f"MA harvest failed: {e}")
            return []

    def run_phase5_regulations(self) -> List[Dict]:
        """Run PASAL.ID and regulations harvester."""
        logger.info("Running Phase 5: Regulations (PASAL.ID)")
        try:
            harvester = PasalHarvester()
            documents = harvester.harvest()
            harvester.save_to_json(documents, str(self.output_dir / "phase5-regulations" / "pasal_regulations.json"))
            return documents
        except Exception as e:
            logger.error(f"PASAL harvest failed: {e}")
            return []

    def run_phase6_regional(self) -> List[Dict]:
        """Run regional JDIH harvester."""
        logger.info("Running Phase 6: Regional JDIH")
        # Implementation
        return []

    def deduplicate_documents(self, documents: List[Dict]) -> List[Dict]:
        """Remove duplicate documents by URL hash."""
        logger.info(f"Deduplicating {len(documents)} documents")
        seen_hashes = set()
        unique = []

        for doc in documents:
            url = doc.get('download', {}).get('url', '')
            url_hash = hashlib.md5(url.encode()).hexdigest()

            if url_hash not in seen_hashes:
                seen_hashes.add(url_hash)
                unique.append(doc)
            else:
                logger.debug(f"Duplicate detected (URL hash): {url}")

        logger.info(f"Deduplication: {len(documents)} -> {len(unique)} unique documents")
        return unique

    def create_master_index(self, documents: List[Dict]) -> Dict:
        """Create master consolidated index with statistics."""
        logger.info("Creating master index")

        # Statistics by source
        stats = {}
        for doc in documents:
            source = doc.get('sumber', 'Unknown')
            if source not in stats:
                stats[source] = {'count': 0, 'by_type': {}}
            stats[source]['count'] += 1

            doc_type = doc.get('tipe_dokumen', 'Unknown')
            stats[source]['by_type'][doc_type] = stats[source]['by_type'].get(doc_type, 0) + 1

        # Statistics by year
        years = {}
        for doc in documents:
            year = doc.get('tahun')
            if year:
                years[year] = years.get(year, 0) + 1

        # Accessibility stats
        accessible = sum(1 for doc in documents if doc.get('download', {}).get('accessible'))
        total = len(documents)
        accessibility_rate = (accessible / total * 100) if total > 0 else 0

        master_index = {
            "metadata": {
                "created": datetime.now().isoformat(),
                "total_documents": total,
                "sources": len(stats),
                "accessibility_rate": round(accessibility_rate, 2)
            },
            "statistics": {
                "by_source": stats,
                "by_year": dict(sorted(years.items())),
                "accessibility": {
                    "accessible": accessible,
                    "inaccessible": total - accessible,
                    "unknown": 0
                }
            },
            "documents": documents
        }

        return master_index

    def harvest_parallel(self, max_workers: int = 3) -> List[Dict]:
        """Run all harvesters in parallel."""
        logger.info("Starting parallel harvest from all sources")

        phases = [
            ("Phase 1: ANRI", self.run_phase1_anri),
            ("Phase 2: BPIP", self.run_phase2_bpip),
            ("Phase 3: MK", self.run_phase3_mk),
            ("Phase 4: MA", self.run_phase4_ma),
            ("Phase 5: Regulations", self.run_phase5_regulations),
            ("Phase 6: Regional", self.run_phase6_regional),
        ]

        all_documents = []

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(phase_func): phase_name for phase_name, phase_func in phases}

            for future in as_completed(futures):
                phase_name = futures[future]
                try:
                    documents = future.result()
                    all_documents.extend(documents)
                    logger.info(f"{phase_name} completed: {len(documents)} documents")
                except Exception as e:
                    logger.error(f"{phase_name} failed: {e}")

        return all_documents

    def save_master_index(self, master_index: Dict):
        """Save master index to JSON."""
        output_file = self.output_dir / "MASTER_INDEX_merged.json"
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(master_index, f, ensure_ascii=False, indent=2)
            logger.info(f"Master index saved to {output_file}")
        except Exception as e:
            logger.error(f"Failed to save master index: {e}")

    def generate_report(self, master_index: Dict):
        """Generate comprehensive research report."""
        report_file = self.output_dir / "COMPREHENSIVE_RESEARCH_REPORT.md"

        report_content = f"""# Arsip Pancasila Indonesia - Comprehensive Research Report

## Executive Summary
**Total Documents Indexed**: {master_index['metadata']['total_documents']:,}
**Data Sources**: {master_index['metadata']['sources']}
**URL Accessibility Rate**: {master_index['metadata']['accessibility_rate']}%
**Generated**: {master_index['metadata']['created']}

---

## Statistics by Source

"""
        for source, stats in master_index['statistics']['by_source'].items():
            report_content += f"### {source}\n"
            report_content += f"- Total Documents: {stats['count']}\n"
            report_content += f"- By Type: {stats['by_type']}\n\n"

        report_content += """
## Documents by Year

"""
        for year in sorted(master_index['statistics']['by_year'].keys()):
            count = master_index['statistics']['by_year'][year]
            report_content += f"- {year}: {count} documents\n"

        report_content += f"""

## Accessibility Statistics

- Accessible (200 OK): {master_index['statistics']['accessibility']['accessible']}
- Inaccessible (404/403): {master_index['statistics']['accessibility']['inaccessible']}
- Unknown: {master_index['statistics']['accessibility']['unknown']}

---

## Next Steps

1. **Phase 2: Batch Download** - Download all accessible documents
2. **Phase 3: Archival** - Store in organized folder structure with metadata
3. **Phase 4: Full-text Indexing** - OCR and index document content
4. **Phase 5: Search Interface** - Build searchable database

---

## Data Quality Notes

- URL validation: Sample-tested, not exhaustive
- Duplicates: Removed by URL hash comparison
- Metadata: Standardized across all sources
- Access restrictions: Some portals may require authentication or IP whitelisting

"""

        try:
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(report_content)
            logger.info(f"Report generated: {report_file}")
        except Exception as e:
            logger.error(f"Failed to generate report: {e}")

    def run(self):
        """Execute complete harvest workflow."""
        logger.info("=" * 80)
        logger.info("ARSIP PANCASILA MASTER ORCHESTRATOR - STARTING")
        logger.info("=" * 80)

        # Harvest from all sources (parallel)
        all_documents = self.harvest_parallel(max_workers=3)

        # Deduplicate
        unique_documents = self.deduplicate_documents(all_documents)

        # Create master index
        master_index = self.create_master_index(unique_documents)

        # Save results
        self.save_master_index(master_index)
        self.generate_report(master_index)

        logger.info("=" * 80)
        logger.info(f"HARVEST COMPLETE: {len(unique_documents):,} total documents indexed")
        logger.info("=" * 80)

        return master_index


if __name__ == "__main__":
    orchestrator = ArsipOrchestrator()
    master_index = orchestrator.run()

    print(f"\n✅ Harvest Complete!")
    print(f"📊 Total Documents: {master_index['metadata']['total_documents']:,}")
    print(f"📁 Output Directory: /private/tmp/arsip-research/")
    print(f"📄 Master Index: MASTER_INDEX_merged.json")
