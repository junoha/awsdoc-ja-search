from io import BytesIO
import gzip
import json
import logging

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger("crawler").getChild(__name__)

s3 = boto3.client("s3")


def upload_file(bucket: str, key: str, obj: dict):
    """
    Upload file with gzip
    """
    try:
        data = json.dumps(obj).encode("utf-8")

        bio = BytesIO()
        with gzip.GzipFile(fileobj=bio, mode="wb") as gz:
            gz.write(data)
        bio.seek(0)

        s3.upload_fileobj(bio, bucket, key, ExtraArgs={"ContentEncoding": "gzip"})
        return True
    except ClientError as e:
        logger.error("Error while S3 upload s3://{}/{}".format(bucket, key))
        logger.exception("", e)
        return False
