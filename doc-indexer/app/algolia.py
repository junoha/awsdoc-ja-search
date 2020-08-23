import logging
import os
import traceback

from algoliasearch.search_client import SearchClient

logger = logging.getLogger("indexer").getChild(__name__)

client = SearchClient.create(
    os.environ.get("APPLICATION_ID"), os.environ.get("ADMIN_API_KEY")
)
index = client.init_index(os.environ.get("INDEX_NAME"))


def save(doc_list):
    try:
        index.save_objects(doc_list)
    except Exception:
        logger.exception(traceback.format_exc())
