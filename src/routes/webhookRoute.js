import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import fetch from 'node-fetch';
import httpStatus from 'http-status';
import bodyParser from 'body-parser';

export default function (openshiftWebhookUrl, urlWhiteList) { // eslint-disable-line no-unused-vars
  const logger = createLogger();

  return new Router()
    .post('/:project/:buildConfig/:id', bodyParser.json(), handleHook)
    .post('/namespaces/:project/buildconfigs/:buildConfig/webhooks/:id/generic', bodyParser.json(), handleHook)
    .post('/apis/build.openshift.io/v1/namespaces/:project/buildconfigs/:buildConfig/webhooks/:id/generic', bodyParser.json(), handleHook)
    .post('/url', bodyParser.json(), handleUrlHook)
    .use(handleError);

  function handleHook(req, res) {
    logger.debug('webhookRoute/handleHook');
    const {project, buildConfig, id} = req.params;
    const data = req.body;
    logger.debug('data: ', data);
    const triggerUrl = `${openshiftWebhookUrl}/${project}/buildconfigs/${buildConfig}/webhooks/${id}/generic`;
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

  function handleUrlHook(req, res) {
    const {triggerUrl} = req.query;

    logger.debug(`trigger url: ${triggerUrl}`);
    logger.debug(`urlRegexp url: ${urlRegexp}`);
    if (!urlWhiteList.some(urlRegexp => new RegExp(urlRegexp, 'u').test(triggerUrl))) {
      return res.status(httpStatus.FORBIDDEN).json({status: 403});
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

  function handleError(err, req, res, next) {
    logger.debug('webhookRoute/handleError');
    logger.error('Error: ', err);
    next();
  }
}
