import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import httpStatus from 'http-status';
import bodyParser from 'body-parser';
import {matchTriggerUrl, validateUrlWhiteList} from '../services/urlService';

export default function (whiteListMiddleware, openshiftWebhookUrl, urlWhiteList) {
  const logger = createLogger();
  validateUrlWhiteList(urlWhiteList);

  return new Router()
    .post('/:project/:buildConfig/:id', whiteListMiddleware, bodyParser.json(), handleHook)
    .post('/namespaces/:project/buildconfigs/:buildConfig/webhooks/:id/generic', whiteListMiddleware, bodyParser.json(), handleHook)
    .post('/apis/build.openshift.io/v1/namespaces/:project/buildconfigs/:buildConfig/webhooks/:id/generic', whiteListMiddleware, bodyParser.json(), handleHook)
    .post('/url', bodyParser.json(), handleUrlHook)
    .use(handleError);

  function handleHook(req, res) {
    logger.debug('webhookRoute/handleHook');
    const {project, buildConfig, id} = req.params;
    const data = req.body;

    if ('repository' in data && 'branch' in data) {
      logger.debug('Repository: ', data.repository);
      logger.debug('Branch: ', data.branch);
    }

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

    if (!matchTriggerUrl(triggerUrl, urlWhiteList)) {
      res.status(httpStatus.FORBIDDEN).json({status: 403});
    }

    const data = req.body;

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
