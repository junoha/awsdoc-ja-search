from io import BytesIO
import gzip
import json
import logging
import traceback
import os

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger("indexer").getChild(__name__)

s3 = boto3.client("s3")


def download_dir(bucket="your_bucket", prefix="prefix", local="/tmp"):
    """
    Download as directory
    """
    try:
        paginator = s3.get_paginator("list_objects")

        for result in paginator.paginate(Bucket=bucket, Delimiter="/", Prefix=prefix):
            if result.get("CommonPrefixes") is not None:
                for subdir in result.get("CommonPrefixes"):
                    download_dir(subdir.get("Prefix"), local, bucket)

            for file in result.get("Contents", []):
                dest_pathname = os.path.join(local, file.get("Key"))
                if not os.path.exists(os.path.dirname(dest_pathname)):
                    os.makedirs(os.path.dirname(dest_pathname))
                s3.download_file(bucket, file.get("Key"), dest_pathname)

        return True

    except ClientError:
        logger.error("Error while S3 download s3://{}/{}".format(bucket, prefix))
        logger.exception(traceback.format_exc())
        return False


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
