#!/usr/bin/env python3
"""MK (Mahkamah Konstitusi) Putusan Harvester"""

import requests, json, logging
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime
import uuid
from typing import List, Dict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - MK_HARVESTER - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MKHarvester:
    def __init__(self):
        self.base_url = "https://www.mkri.id"
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Mozilla/5.0'})

    def harvest(self) -> List[Dict]:
        """Harvest MK decisions."""
        documents = []
        logger.info("Starting MK Putusan harvest")

        try:
            # Try MK putusan search/browse page
            urls = [
                f"{self.base_url}/index.php?page=web.Tamu&menu=5",
                f"{self.base_url}/en/decisions/",
                f"{self.base_url}/putusan/",
            ]

            for url in urls:
                try:
                    logger.info(f"Trying: {url}")
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.text, 'html.parser')

                        # Find links to putusan/decisions
                        links = soup.find_all('a', href=lambda x: x and ('putusan' in str(x).lower() or 'decision' in str(x).lower()))

                        for link in links[:50]:
                            try:
                                title = link.get_text(strip=True)
                                href = link.get('href')
                                if title and href:
                                    doc_url = urljoin(self.base_url, href)
                                    doc = {
                                        "id": str(uuid.uuid4()),
                                        "dokumen": title,
                                        "tahun": None,
                                        "tanggal": datetime.now().strftime("%Y-%m-%d"),
                                        "sumber": "MK",
                                        "portal": self.base_url,
                                        "tipe_dokumen": "decision",
                                        "kategori": "Constitutional Court",
                                        "download": {"url": doc_url, "accessible": True, "last_checked": datetime.now().strftime("%Y-%m-%d")}
                                    }
                                    documents.append(doc)
                            except:
                                pass

                        if documents:
                            break
                except:
                    pass

        except Exception as e:
            logger.error(f"MK harvest error: {e}")

        logger.info(f"MK harvest complete: {len(documents)} documents")
        return documents

    def save_to_json(self, documents: List[Dict], output_file: str = "mk_putusan.json"):
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(documents, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved {len(documents)} documents")

if __name__ == "__main__":
    harvester = MKHarvester()
    documents = harvester.harvest()
    harvester.save_to_json(documents, "/private/tmp/arsip-research/phase3-mk/mk_putusan.json")
    print(f"Complete: {len(documents)} documents")
