import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import fetch from 'node-fetch';
import httpStatus from 'http-status';
import bodyParser from 'body-parser';

export default function (urlWhiteList) {
  const logger = createLogger();

  return new Router()
    .post('/', bodyParser.json(), handleHook);

  function handleHook(req, res) {
    const {triggerUrl} = req.query;

    if (!urlWhiteList.some(urlRegexp => new RegExp(urlRegexp, 'u').test(url))) {
      res.status(httpStatus.FORBIDDEN).json({status: 403});
    }

    const data = req.body;
    logger.debug('data: ', data);

    fetch(
      triggerUrl,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    res.status(httpStatus.OK).json({status: 200});
  }
}