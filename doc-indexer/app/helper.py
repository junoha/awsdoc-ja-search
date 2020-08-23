from datetime import datetime
import logging
import time

logger = logging.getLogger("indexer").getChild(__name__)


def chunks(lst, n):
    """
    Yield successive n-sized chunks from lst.
    """
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def calc_time(fn):
    """
    Decorator that measures execution time of function
    """

    def wrapper(*args, **kwargs):
        start = time.time()
        fn(*args, **kwargs)
        end = time.time()
        logger.info(f"[{fn.__name__}] elapsed time: {end - start}")
        return

    return wrapper
