#!/usr/bin/env python3
"""
BPIP JDIH Harvester
Crawls https://jdih.bpip.go.id to extract Indonesian law documents.
"""

import requests
import json
import logging
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime
import uuid
from typing import List, Dict, Optional

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - BPIP_HARVESTER - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BPIPHarvester:
    def __init__(self):
        self.base_url = "https://jdih.bpip.go.id"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def harvest_from_categories(self) -> List[Dict]:
        """Harvest documents from BPIP JDIH categories."""
        documents = []

        # Known BPIP JDIH category paths
        categories = [
            ('/peraturan-bpip', 'Peraturan BPIP'),
            ('/keputusan-kepala', 'Keputusan Kepala'),
            ('/surat-edaran', 'Surat Edaran'),
        ]

        logger.info(f"Harvesting from {len(categories)} BPIP categories")

        for cat_path, cat_name in categories:
            try:
                url = urljoin(self.base_url, cat_path)
                logger.info(f"Fetching category: {cat_name} ({url})")
                response = self.session.get(url, timeout=10)

                if response.status_code != 200:
                    logger.warning(f"Category {cat_name} returned {response.status_code}")
                    continue

                soup = BeautifulSoup(response.text, 'html.parser')

                # Find document links in category page
                links = soup.find_all('a', href=lambda x: x and ('/view/' in x or '/dokumen/' in x))
                logger.info(f"Found {len(links)} documents in {cat_name}")

                for link in links[:100]:  # Limit per category
                    try:
                        title = link.get_text(strip=True)
                        if not title or len(title) < 3:
                            continue

                        href = link.get('href')
                        if not href:
                            continue

                        doc_url = urljoin(self.base_url, href)

                        doc = {
                            "id": str(uuid.uuid4()),
                            "dokumen": title,
                            "tahun": None,
                            "tanggal": datetime.now().strftime("%Y-%m-%d"),
                            "sumber": "BPIP",
                            "portal": self.base_url,
                            "tipe_dokumen": "regulation",
                            "kategori": cat_name,
                            "deskripsi": f"BPIP document from {cat_name}",
                            "metadata": {
                                "institusi": "BPIP",
                                "format": "HTML"
                            },
                            "download": {
                                "url": doc_url,
                                "format": "HTML",
                                "accessible": True,
                                "last_checked": datetime.now().strftime("%Y-%m-%d")
                            }
                        }
                        documents.append(doc)

                    except Exception as e:
                        logger.warning(f"Error processing link in {cat_name}: {e}")
                        continue

            except Exception as e:
                logger.error(f"Error harvesting category {cat_name}: {e}")
                continue

        return documents

    def harvest(self) -> List[Dict]:
        """Main harvest workflow."""
        logger.info("Starting BPIP JDIH harvest")
        documents = self.harvest_from_categories()
        logger.info(f"BPIP harvest complete: {len(documents)} documents")
        return documents

    def save_to_json(self, documents: List[Dict], output_file: str = "bpip_jdih.json"):
        """Save harvested documents to JSON."""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(documents, f, ensure_ascii=False, indent=2)
            logger.info(f"Saved {len(documents)} documents to {output_file}")
        except Exception as e:
            logger.error(f"Failed to save JSON: {e}")


if __name__ == "__main__":
    harvester = BPIPHarvester()
    documents = harvester.harvest()
    harvester.save_to_json(documents, "/private/tmp/arsip-research/phase2-bpip/bpip_jdih.json")
    print(f"\nHarvest complete: {len(documents)} documents")
