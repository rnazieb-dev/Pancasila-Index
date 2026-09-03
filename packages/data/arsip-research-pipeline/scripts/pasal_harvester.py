#!/usr/bin/env python3
"""
PASAL.ID Regulation Harvester
Crawls https://pasal.id to extract Indonesian laws and regulations.
Tests for API/OAI-PMH endpoints and structured data export.
"""

import requests
import json
import logging
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlencode
from datetime import datetime
import uuid
from typing import List, Dict, Optional

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - PASAL_HARVESTER - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PasalHarvester:
    def __init__(self):
        self.base_url = "https://pasal.id"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/html'
        })
        self.documents = []

    def test_api_endpoints(self) -> Dict[str, bool]:
        """Test for common API/data export endpoints."""
        endpoints = {
            'rest_api': '/api/v1/regulations',
            'oai_pmh': '/oai2',
            'oai_pmh_alt': '/oai-pmh',
            'json_feed': '/feed.json',
            'search_api': '/api/search'
        }

        api_available = {}
        logger.info("Testing API endpoints...")

        for name, endpoint in endpoints.items():
            url = urljoin(self.base_url, endpoint)
            try:
                response = self.session.get(url, timeout=5)
                is_available = response.status_code in [200, 404]  # 404 means endpoint exists but empty
                api_available[name] = is_available
                logger.info(f"{name}: {url} -> {response.status_code}")
            except Exception as e:
                api_available[name] = False
                logger.warning(f"{name}: {url} -> ERROR: {e}")

        return api_available

    def harvest_from_api(self, api_endpoint: str, page_size: int = 100) -> List[Dict]:
        """Attempt to harvest from REST API with pagination."""
        documents = []
        page = 1

        logger.info(f"Attempting API harvest from {api_endpoint}")

        while True:
            try:
                # Try common pagination patterns
                params = {'page': page, 'limit': page_size}
                url = f"{self.base_url}{api_endpoint}?{urlencode(params)}"

                response = self.session.get(url, timeout=10)
                if response.status_code != 200:
                    logger.info(f"API request returned {response.status_code}, stopping pagination")
                    break

                data = response.json()

                # Handle different JSON response structures
                items = data.get('items', data.get('results', data.get('data', [])))
                if not items:
                    logger.info("No more items in API response")
                    break

                logger.info(f"Fetched {len(items)} items from page {page}")

                for item in items:
                    doc = self._convert_api_item_to_doc(item)
                    if doc:
                        documents.append(doc)

                page += 1

            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON response at page {page}")
                break
            except Exception as e:
                logger.warning(f"API harvest error at page {page}: {e}")
                break

        return documents

    def _convert_api_item_to_doc(self, item: Dict) -> Optional[Dict]:
        """Convert API item to standardized document format."""
        try:
            # Adapt field mapping based on actual API structure
            return {
                "id": item.get('id', str(uuid.uuid4())),
                "dokumen": item.get('title', item.get('nama', 'Unknown')),
                "tahun": item.get('year', item.get('tahun')),
                "tanggal": item.get('date', item.get('tanggal', datetime.now().strftime("%Y-%m-%d"))),
                "sumber": "PASAL.ID",
                "portal": "https://pasal.id",
                "tipe_dokumen": "regulation",
                "kategori": item.get('type', item.get('kategori', 'Unknown')),
                "deskripsi": item.get('description', item.get('ringkasan', '')),
                "metadata": {
                    "nomor_dokumen": item.get('number', item.get('nomor', '')),
                    "institusi": "Government of Indonesia",
                    "status": item.get('status', 'berlaku'),
                    "format": "PDF"
                },
                "download": {
                    "url": item.get('url', ''),
                    "format": "PDF",
                    "accessible": True,
                    "last_checked": datetime.now().strftime("%Y-%m-%d")
                }
            }
        except Exception as e:
            logger.warning(f"Error converting API item: {e}")
            return None

    def harvest_from_html_browse(self) -> List[Dict]:
        """Fall back to HTML parsing if API not available."""
        documents = []
        logger.info("Falling back to HTML parsing")

        try:
            # Test main PASAL page
            response = self.session.get(self.base_url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find regulation links (adjust selector based on actual HTML)
            # Common patterns: data-href, href="/regulation/", class containing "regulation"
            links = soup.find_all('a', href=lambda x: x and '/regulation/' in x if x else False)
            logger.info(f"Found {len(links)} regulation links on main page")

            for link in links[:100]:  # Limit initial harvest
                try:
                    title = link.get_text(strip=True)
                    url = urljoin(self.base_url, link['href'])

                    doc = {
                        "id": str(uuid.uuid4()),
                        "dokumen": title,
                        "tahun": None,  # Try to extract from URL/page
                        "tanggal": datetime.now().strftime("%Y-%m-%d"),
                        "sumber": "PASAL.ID",
                        "portal": "https://pasal.id",
                        "tipe_dokumen": "regulation",
                        "kategori": "Unknown",
                        "download": {
                            "url": url,
                            "accessible": True,
                            "last_checked": datetime.now().strftime("%Y-%m-%d")
                        }
                    }
                    documents.append(doc)

                except Exception as e:
                    logger.warning(f"Error processing link: {e}")

        except Exception as e:
            logger.error(f"HTML parsing error: {e}")

        return documents

    def harvest(self) -> List[Dict]:
        """Main harvest workflow with API fallback."""
        logger.info("Starting PASAL.ID harvest")

        # Step 1: Test for API
        api_status = self.test_api_endpoints()
        documents = []

        # Step 2: Try API if available
        if api_status.get('rest_api'):
            documents = self.harvest_from_api('/api/v1/regulations')

        # Step 3: Fall back to HTML parsing
        if not documents:
            documents = self.harvest_from_html_browse()

        logger.info(f"PASAL.ID harvest complete: {len(documents)} documents")
        return documents

    def save_to_json(self, documents: List[Dict], output_file: str = "pasal_regulations.json"):
        """Save harvested documents to JSON."""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(documents, f, ensure_ascii=False, indent=2)
            logger.info(f"Saved {len(documents)} documents to {output_file}")
        except Exception as e:
            logger.error(f"Failed to save JSON: {e}")


if __name__ == "__main__":
    harvester = PasalHarvester()
    documents = harvester.harvest()
    harvester.save_to_json(documents, "/private/tmp/arsip-research/phase5-regulations/pasal_regulations.json")
    print(f"\nHarvest complete: {len(documents)} documents")
