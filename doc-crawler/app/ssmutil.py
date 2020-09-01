import logging
import traceback

import boto3

logger = logging.getLogger("crawler").getChild(__name__)

ssm = boto3.client("ssm", region_name="ap-northeast-1")


def get_param(key: str):
    try:
        response = ssm.get_parameter(Name=key, WithDecryption=True)
        return response["Parameter"]["Value"]
    except ssm.exceptions.ParameterNotFound:
        return None


def put_param(key: str, value: str):
    ssm.put_parameter(Name=key, Value=value, Type="String", Overwrite=True)

