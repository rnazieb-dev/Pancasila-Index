#!/usr/bin/env python3
"""
ANRI Public Archive Harvester
Crawls https://anri.go.id/sekitar-arsip/arsip-statis/sarana-temu-balik-arsip/daftar-arsip
Extracts document metadata and download links from public archive listing.
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
    format='%(asctime)s - ANRI_HARVESTER - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ANRIHarvester:
    def __init__(self):
        self.base_url = "https://anri.go.id"
        self.archive_list_url = f"{self.base_url}/sekitar-arsip/arsip-statis/sarana-temu-balik-arsip/daftar-arsip"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.documents = []

    def fetch_archive_list(self, page: int = 1) -> Optional[str]:
        """Fetch the archive list page with pagination."""
        try:
            # Try pagination parameters (common patterns)
            params = {'page': page}
            url = f"{self.archive_list_url}?page={page}"
            logger.info(f"Fetching ANRI archive page {page}: {url}")
            response = self.session.get(url, timeout=10, params=params if page > 1 else None)
            response.raise_for_status()
            logger.info(f"Successfully fetched page {page} (status: {response.status_code})")
            return response.text
        except Exception as e:
            logger.warning(f"Failed to fetch page {page}: {e}")
            return None

    def parse_archive_table(self, html: str) -> List[Dict]:
        """Parse the archive listing table."""
        documents = []
        try:
            soup = BeautifulSoup(html, 'html.parser')

            # Find the main table (adjust selector based on actual HTML structure)
            table = soup.find('table')
            if not table:
                logger.warning("No table found in archive list page")
                return documents

            rows = table.find_all('tr')[1:]  # Skip header row
            logger.info(f"Found {len(rows)} archive entries")

            for idx, row in enumerate(rows):
                try:
                    cells = row.find_all('td')
                    if len(cells) < 3:
                        continue

                    # Extract columns: # | Nama File | Tahun | Tautan (download)
                    doc_name = cells[1].get_text(strip=True)
                    year_text = cells[2].get_text(strip=True)

                    # Try to extract year as integer
                    try:
                        year = int(year_text)
                    except ValueError:
                        year = None

                    # Find download link
                    download_link = None
                    download_btn = cells[-1].find('a')
                    if download_btn and download_btn.get('href'):
                        download_link = urljoin(self.base_url, download_btn['href'])

                    if doc_name and download_link:
                        doc = {
                            "id": str(uuid.uuid4()),
                            "dokumen": doc_name,
                            "tahun": year,
                            "tanggal": datetime.now().strftime("%Y-%m-%d"),
                            "sumber": "ANRI",
                            "portal": self.base_url,
                            "tipe_dokumen": "archive",
                            "kategori": "Historical_Administrative",
                            "deskripsi": f"ANRI public archive document",
                            "metadata": {
                                "institusi": "ANRI",
                                "format": "PDF"  # Assume PDF unless detected otherwise
                            },
                            "download": {
                                "url": download_link,
                                "format": "PDF",
                                "accessible": None,  # Will be validated later
                                "last_checked": datetime.now().strftime("%Y-%m-%d")
                            }
                        }
                        documents.append(doc)
                        logger.debug(f"Extracted document {idx + 1}: {doc_name}")

                except Exception as e:
                    logger.warning(f"Error parsing row {idx}: {e}")
                    continue

            logger.info(f"Successfully parsed {len(documents)} documents")
            return documents

        except Exception as e:
            logger.error(f"Error parsing archive table: {e}")
            return documents

    def validate_urls(self, documents: List[Dict], sample_size: int = 10) -> List[Dict]:
        """
        Validate accessibility of download URLs (sample testing).
        Sample-test to avoid excessive requests.
        """
        import random

        test_docs = random.sample(documents, min(sample_size, len(documents)))
        logger.info(f"Testing accessibility of {len(test_docs)} sample URLs")

        for doc in test_docs:
            url = doc['download']['url']
            try:
                response = self.session.head(url, timeout=5, allow_redirects=True)
                doc['download']['accessible'] = (response.status_code == 200)
                logger.debug(f"URL test - {url}: {response.status_code}")
            except Exception as e:
                doc['download']['accessible'] = False
                logger.warning(f"URL test failed - {url}: {e}")

        # Mark untested URLs as unknown
        for doc in documents:
            if doc['download']['accessible'] is None:
                doc['download']['accessible'] = True  # Assume accessible unless tested

        return documents

    def harvest(self, max_pages: int = 100) -> List[Dict]:
        """Main harvest workflow with pagination."""
        logger.info("Starting ANRI archive harvest (with pagination)")
        all_documents = []

        # Paginate through all archive pages
        for page in range(1, max_pages + 1):
            logger.info(f"Processing page {page}/{max_pages}")

            # Step 1: Fetch archive list page
            html = self.fetch_archive_list(page=page)
            if not html:
                logger.info(f"No more pages at page {page}, stopping")
                break

            # Step 2: Parse archive table
            documents = self.parse_archive_table(html)
            if not documents:
                logger.info(f"No documents on page {page}, stopping")
                break

            all_documents.extend(documents)
            logger.info(f"Page {page}: {len(documents)} documents (total: {len(all_documents)})")

            # Small delay between requests to respect server
            import time
            time.sleep(0.5)

        if not all_documents:
            logger.warning("No documents extracted from any page")
            return []

        # Step 3: Validate URLs (sample)
        all_documents = self.validate_urls(all_documents, sample_size=min(50, len(all_documents)))

        logger.info(f"ANRI harvest complete: {len(all_documents)} total documents extracted")
        return all_documents

    def save_to_json(self, documents: List[Dict], output_file: str = "anri_archive.json"):
        """Save harvested documents to JSON file."""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(documents, f, ensure_ascii=False, indent=2)
            logger.info(f"Saved {len(documents)} documents to {output_file}")
        except Exception as e:
            logger.error(f"Failed to save JSON: {e}")


if __name__ == "__main__":
    harvester = ANRIHarvester()
    documents = harvester.harvest()
    harvester.save_to_json(documents, "/private/tmp/arsip-research/phase1-anri/anri_archive.json")
    print(f"\nHarvest complete: {len(documents)} documents")
    if documents:
        print(f"Sample: {json.dumps(documents[0], ensure_ascii=False, indent=2)}")
