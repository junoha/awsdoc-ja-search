import boto3
import logging

logger = logging.getLogger('crawler').getChild(__name__)

s3 = boto3.client('s3')

def test():
  buckets = s3.list_buckets()
  logger.info(buckets['Buckets'])
