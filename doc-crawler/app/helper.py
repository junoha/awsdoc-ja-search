from datetime import datetime
import logging
import time

logger = logging.getLogger('crawler').getChild(__name__)

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


def to_isoformat(date_str: str) -> str:
    """
    Last-modified to isoformat
    Sat, 27 Jun 2020 02:00:18 GMT => 2020-06-27T02:00:18
    """
    return datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %Z').isoformat()
