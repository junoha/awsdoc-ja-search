import json
import jsonlines
import logging
import os
import pathlib
import subprocess
from subprocess import PIPE
import traceback

import lxml
from lxml.html.clean import clean_html

import algolia
from helper import chunks, calc_time
import s3util

formatter = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
logging.basicConfig(format=formatter)
logger = logging.getLogger("indexer")
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

BUCKET = os.environ.get("BUCKET")
PREFIX = os.environ.get("PREFIX")


def filter_data(target_path: str):
    """
    Filter and normalize AWS document data
    """
    jsonl_path = pathlib.Path(target_path)
    if jsonl_path.is_dir() is not True:
        logger.error("{} is not directory".format(target_path))
        return []

    index_list = []

    for jsonl in jsonl_path.glob("*.jsonl"):
        logger.info("Processing {}".format(jsonl.absolute()))
        with jsonlines.open(jsonl.absolute()) as reader:
            for data in reader:
                url = data["url"]
                logger.info("  Start {}".format(url))

                # Filter by URL
                if "/ja_jp/" not in url.lower():
                    logger.warning("No ja-jp")
                    continue
                if data["status"] != 200:
                    logger.warning("No 200")
                    continue
                if "apireference" in url.lower():
                    logger.warning("API Reference")
                    continue
                if "/cli/" in url.lower():
                    logger.warning("AWS CLI")
                    continue

                try:
                    h = lxml.html.fromstring(data["html"])
                    title = h.cssselect("title")[0].text

                    product = None
                    guide = None
                    try:
                        for meta in h.cssselect("meta"):
                            if meta.get("name") == "product":
                                product = meta.get("content")
                            if meta.get("name") == "guide":
                                guide = meta.get("content")
                    except Exception:
                        pass

                    # Normalize by clean_html
                    # https://lxml.de/lxmlhtml.html#cleaning-up-html
                    content = clean_html(h).text_content()
                    content = "".join([line.strip() for line in content.splitlines()])

                    index_list.append(
                        {
                            "objectID": url,
                            "url": url,
                            "last_modified": data["last_modified"],
                            "crawled_at": data["crawled_at"],
                            "guide": guide,
                            "product": product,
                            "title": title,
                            "content": content,
                        }
                    )

                except Exception:
                    logger.exception(traceback.format_exc())
                    logger.warning("  Skipping this URL... {}".format(url))
                    continue

    return index_list


@calc_time
def main():
    """
    Main logic
    """
    if BUCKET is None or PREFIX is None:
        logger.error("BUCKET or PREFIX is None")
        return 1

    logger.info("BUCKET: {}".format(BUCKET))
    logger.info("PREFIX: {}".format(PREFIX))

    # Download gzip files to /tmp/PREFIX/
    succeeded = s3util.download_dir(bucket=BUCKET, prefix=PREFIX, local="/tmp")
    if succeeded is False:
        logger.error("S3 Download failed")
        return 1
    logger.info("S3 download complete")

    # gunzip /tmp/PREFIX/*.gz
    try:
        subprocess.run(
            "gunzip /tmp/{}/*.gz".format(PREFIX),
            shell=True,
            stdout=PIPE,
            stderr=PIPE,
            text=True,
        )
    except Exception:
        trace = traceback.format_exc()
        logger.error("Error while gunzip /tmp/{}/*.gz".format(PREFIX))
        logger.exception(trace)
        return 1

    # Read /tmp/PREFIX jsonline and filter and append list
    filtered_data = filter_data("/tmp/{}".format(PREFIX))
    logger.info("Index size: {}".format(len(filtered_data)))

    # Create and update Algolia index every 1000 records
    # https://www.algolia.com/doc/api-reference/api-methods/save-objects/#about-this-method
    for split_data in chunks(filtered_data, 1000):
        algolia.save(split_data)
        logger.info("uploaded")

    logger.info("upload complete")


if __name__ == "__main__":
    main()

