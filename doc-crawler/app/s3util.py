from io import BytesIO
import gzip
import json
import logging
import traceback

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger("crawler").getChild(__name__)

s3 = boto3.client("s3")


def upload_file(bucket: str, key: str, data: bytes):
    """
    Upload file with gzip
    """
    try:
        bio = BytesIO()
        with gzip.GzipFile(fileobj=bio, mode="wb") as gz:
            gz.write(data)
        bio.seek(0)

        s3.upload_fileobj(bio, bucket, key, ExtraArgs={"ContentEncoding": "gzip"})
        return True
    except ClientError:
        logger.error("Error while S3 upload s3://{}/{}".format(bucket, key))
        logger.exception(traceback.format_exc())
        return False
