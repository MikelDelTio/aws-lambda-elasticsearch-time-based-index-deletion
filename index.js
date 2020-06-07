const {
    Client
} = require('@elastic/elasticsearch');
const client = new Client({
    node: process.env.ELASTICSEARCH_ENDPOINT
});

const moment = require('moment');

const winston = require('winston');
const logger = winston.createLogger({
    level: process.env.LOGGING_LEVEL ? process.env.LOGGING_LEVEL : 'info',
    transports: [
        new winston.transports.Console()
    ]
});

exports.handler = async (event) => {
    var indices = await getIndices(event.indexPattern);
    indices = await filterIndices(indices, event.indexPattern, event.timeUnit, event.timeUnitCount);
    await deleteIndices(indices);
}

async function getIndices(indexPattern) {
    try {
        logger.info(`Retrieving Elasticsearch indices for '${indexPattern}' index pattern`);
        const result = await client.cat.indices({
            index: indexPattern,
            format: 'json'
        }, {
            ignore: [404],
            maxRetries: 3
        });
        const indices = [];
        result.body.forEach(indexInformation => indices.push(indexInformation.index));
        if (indices.length > 0) {
            logger.info(`Retrieved indices are ${indices}`);
        } else {
            logger.info(`No index found for provided index pattern`);
        }
        return indices;
    } catch (error) {
        logger.error(`An error ocurred retrieving Elasticsearch indices`, error);
        throw (error);
    }
}

async function filterIndices(indices, indexPattern, unit, unitCount) {
    try {
        if (indices.length > 0) {
            logger.info(`Filtering indices older than ${unitCount} ${unit}`);
            indices = indices.filter(indice => moment().diff(new Date(indice.replace(indexPattern.replace('*', ''), '')), unit) >= unitCount);
            if (indices.length > 0) {
                logger.info(`Filtered indices are ${indices}`);
            } else {
                logger.info(`No index found for the provided time frame`);
            }
        }
        return indices;
    } catch (error) {
        logger.error(`An error ocurred filtering indices`, error);
        throw (error);
    }
}

async function deleteIndices(indices) {
    try {
        if (indices.length > 0) {
            logger.info(`Deleting ${indices} indices`);
            const result = await client.indices.delete({
                index: indices,
                format: 'json'
            }, {
                ignore: [404],
                maxRetries: 3
            });
            logger.info(`${indices} indices have been deleted`);
        } else {
            logger.info(`There is no index to delete`);
        }
    } catch (error) {
        logger.error(`An error ocurred deleting indices`, error);
        throw (error);
    }
}