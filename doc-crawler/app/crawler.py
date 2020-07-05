import requests
import aiohttp
import xml.etree.ElementTree as ET
import jsonlines

import asyncio
from datetime import datetime, timezone
import json
import logging
import os

from s3util import test
from helper import calc_time, to_isoformat

formatter = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
logging.basicConfig(format=formatter)
logger = logging.getLogger("crawler")
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

ROOT_SITEMAP_URL = "https://docs.aws.amazon.com/sitemap_index.xml"
# yyyymmddhhmmss (UTC)
TIMESTAMP = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
BUCKET = os.environ.get("BUCKET")
PREFIX = os.environ.get("PREFIX") + "/" + TIMESTAMP
SEMAPHORE = int(os.environ.get("SEMAPHORE", 30))


async def fetch(url, session):
    """
    Get HTML
    """
    try:
        response = await session.get(url)
        logger.debug("  GET -> {}".format(url))
        doc_json = {
            "url": url,
            "last_modified": to_isoformat(response.headers["Last-Modified"]),
            "crawled_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "html": await response.text(),
        }
        return doc_json
    except aiohttp.InvalidURL as e:
        logger.warn(e)
    except aiohttp.ServerDisconnectedError as e:
        logger.warn(e)


async def bound_fetch(url, session, sem):
    """
    Get HTML with semaphore
    """
    async with sem:
        return await fetch(url, session)


async def get_doc_by_service(urls):
    """
    Get documents by service
    """
    tasks = []
    sem = asyncio.Semaphore(SEMAPHORE)
    async with ClientSession() as session:
        for url in urls:
            task = bound_fetch(url, session, sem)
            tasks.append(task)

        return await asyncio.wait(tasks)


def get_all_docs(sitemap_urls):
    """
    Get all AWS documents(ja)
    """
    sitemap_count = len(sitemap_urls)
    idx = 0
    for service_sitemap_url in sitemap_urls:
        logger.info(
            "({0}/{1}) {2}".format(
                sitemap_count, len(sitemap_urls), service_sitemap_url
            )
        )

        service_sitemap = requests.get(service_sitemap_url)
        service_root = ET.fromstring(service_sitemap.text.encode("utf-8"))
        service_urls = [child[0].text.strip() for child in service_root]

        logger.info("Documents in service: {}".format(len(service_urls)))

        # Get HTMLs in parallel`by asyncio
        done, pending = asyncio.run(get_doc_by_service(service_urls))

        # write file
        with jsonlines.open("./html/html_{}.jsonl".format(idx), mode="w") as f:
            f.write_all([d.result() for d in done])

        sitemap_count -= 1
        idx += 1


def init_log():
    logger.info("TIMESTAMP: {}".format(TIMESTAMP))
    logger.info("BUCKET: {}".format(BUCKET))
    logger.info("PREFIX: {}".format(PREFIX))
    logger.info("SEMAPHORE: {}".format(SEMAPHORE))


@calc_time
def main():
    """
    Main logic
    """
    init_log()

    root_sitemap = requests.get(ROOT_SITEMAP_URL)
    root = ET.fromstring(root_sitemap.text.encode("utf-8"))
    service_sitemap_urls = [child[0].text.strip() for child in root]
    # Change EN sitemap to ja_jp
    service_sitemap_urls_ja = [
        url.replace(".com/", ".com/ja_jp/") for url in service_sitemap_urls
    ]
    logger.info("Number of sitemap.xml: {}".format(len(service_sitemap_urls_ja)))

    get_all_docs(service_sitemap_urls_ja)


if __name__ == "__main__":
    main()
