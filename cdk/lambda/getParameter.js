const AWS = require('aws-sdk');
const ssm = new AWS.SSM({ region: 'ap-northeast-1' });

async function main(event, context) {
  console.log('event:', JSON.stringify(event, undefined, 2));
  console.log('context:', JSON.stringify(context, undefined, 2));

  const get = async key => {
    const res = await ssm.getParameter({ Name: key, WithDecryption: true }).promise();
    return res.Parameter.Value;
  }
  const BUCKET = await get('/task/aws-doc-search/BUCKET');
  const PREFIX = await get('/task/aws-doc-search/PREFIX');
  const TIMESTAMP = await get('/task/aws-doc-search/TIMESTAMP');
  const status = await get('/task/aws-doc-search/status');

  const response = { BUCKET, PREFIX, TIMESTAMP, status };
  console.log(response);

  return response;
}

exports.handler = async (event, context) => {
  return main(event, context);
};

// local execution
if (!process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  const event = { 'plain_text': 'this is local exec' };
  const context = { 'test': 'test' };
  this.handler(event, context);
}
