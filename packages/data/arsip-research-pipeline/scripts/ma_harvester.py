#!/usr/bin/env python3
"""MA (Mahkamah Agung) Putusan Harvester"""

import requests, json, logging, time
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime
import uuid
from typing import List, Dict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - MA_HARVESTER - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MAHarvester:
    def __init__(self):
        self.base_url = "https://putusan3.mahkamahagung.go.id"
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Mozilla/5.0'})

    def harvest(self, max_pages: int = 5) -> List[Dict]:
        """Harvest MA decisions with pagination."""
        documents = []
        logger.info(f"Starting MA Putusan harvest (max {max_pages} pages)")

        try:
            for page in range(1, max_pages + 1):
                try:
                    # Try common pagination patterns
                    url = f"{self.base_url}/?page={page}"
                    logger.info(f"Fetching MA page {page}: {url}")
                    response = self.session.get(url, timeout=10)

                    if response.status_code != 200:
                        logger.info(f"Page {page} returned {response.status_code}, stopping")
                        break

                    soup = BeautifulSoup(response.text, 'html.parser')

                    # Find decision links
                    links = soup.find_all('a', href=lambda x: x and ('/putusan' in str(x) or '/detail' in str(x)))

                    if not links:
                        logger.info(f"No links on page {page}, stopping")
                        break

                    logger.info(f"Found {len(links)} links on page {page}")

                    for link in links[:100]:
                        try:
                            title = link.get_text(strip=True)
                            href = link.get('href')
                            if title and href and len(title) > 3:
                                doc_url = urljoin(self.base_url, href)
                                doc = {
                                    "id": str(uuid.uuid4()),
                                    "dokumen": title,
                                    "tahun": None,
                                    "tanggal": datetime.now().strftime("%Y-%m-%d"),
                                    "sumber": "MA",
                                    "portal": self.base_url,
                                    "tipe_dokumen": "decision",
                                    "kategori": "Supreme Court Decision",
                                    "download": {"url": doc_url, "accessible": True, "last_checked": datetime.now().strftime("%Y-%m-%d")}
                                }
                                documents.append(doc)
                        except:
                            pass

                    time.sleep(0.5)  # Rate limiting

                except Exception as e:
                    logger.warning(f"Error on page {page}: {e}")
                    continue

        except Exception as e:
            logger.error(f"MA harvest error: {e}")

        logger.info(f"MA harvest complete: {len(documents)} documents")
        return documents

    def save_to_json(self, documents: List[Dict], output_file: str = "ma_putusan.json"):
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(documents, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved {len(documents)} documents")

if __name__ == "__main__":
    harvester = MAHarvester()
    documents = harvester.harvest(max_pages=3)
    harvester.save_to_json(documents, "/private/tmp/arsip-research/phase4-ma/ma_putusan.json")
    print(f"Complete: {len(documents)} documents")
