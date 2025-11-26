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

    if (typeof data === 'object' && 'repository' in data && 'branch' in data) {
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
        }
      }
    );
    res.status(httpStatus.OK).json({status: 200});
  }

  function handleUrlHook(req, res) {
    const {triggerUrl} = req.query;

    const triggerUrlMatches = matchTriggerUrl(triggerUrl, urlWhiteList);
    if (triggerUrlMatches !== true) {
      res.status(triggerUrlMatches.status).json(triggerUrlMatches);
    }

    const data = req.body;

    if (typeof data === 'object' && 'source' in data) {
      logger.debug('Trigger url source: ', data.source);
    }

    if (typeof data === 'object' && 'repository' in data && 'branch' in data) {
      logger.debug('Repository: ', data.repository);
      logger.debug('Branch: ', data.branch);
    }

    fetch(
      triggerUrl,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        }
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
