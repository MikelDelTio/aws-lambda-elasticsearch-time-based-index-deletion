# AWS Lambda Elasticsearch Time Based Index Deletion
NodeJS AWS Lambda function to delete any index whose name contains a time stamp indicating that the data is older than configured time.

## Environment Variables
The following environment variables are used the AWS Lambda function.


| Name                   | Description                                       | Type   | Values                                                   |
|------------------------|---------------------------------------------------|--------|----------------------------------------------------------|
| ELASTICSEARCH_ENDPOINT | The Elasticsearch endpoint to use                 | string | *                                                        |
| LOGGING_LEVEL          | Logging severity ordering specified by RFC5424    | string | emerg, alert, critm, error, warning, notice, info, debug |

## Input Variables
The following environment variables are used the AWS Lambda function.

| Name                   | Description                                       | Type   | Values                                                   |
|------------------------|---------------------------------------------------|--------|----------------------------------------------------------|
| indexPattern           | The index pattern                                 | string | *                                                        |
| timeUnit               | Time filter unit                                  | string | seconds, minutes, hours, days, weeks, months, years      |
| timeUnitCount          | Time filter unit count                            | int    | *                                                        |


## Usage
The following example shows how to program the execution of the AWS Lambda function using serverless.yaml file, to remove logstash indices, older than 4 weeks, at 00:00 each day.

```yaml	
functions:
  awslambdaelasticsearchtimebasedindexdeletion:
    handler: index.handler
    name: aws-lambda-elasticsearch-time-based-index-deletion
    environment:
      ELASTICSEARCH_ENDPOINT: http://my-elasticsearch-endpoint:9200
      LOGGING_LEVEL: info
    events:
      - schedule: 
          name: logstash-index-deletion
          description: 'Removes logstash indices older than 4 weeks at 00:00 each day.' 
          rate: cron(0 0 * * *)
          input:
            indexPattern: 'logstash-*'
            timeUnit: 'weeks'
            timeUnitCount: 4
```
### Relevant Articles

- [Elasticsearch: AWS Lambda for time based index deletion](http://mikeldeltio.com/?p=1626) 