import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import fetch from 'node-fetch';
import httpStatus from 'http-status';
import bodyParser from 'body-parser';

export default function (openshiftWebhookUrl) { // eslint-disable-line no-unused-vars
  const logger = createLogger();

  return new Router()
    .post('/:project/:buildConfig/:id', bodyParser.json(), handleHook)
    .post('/namespaces/:project/buildconfigs/:buildConfig/webhooks/:id/generic', bodyParser.json(), handleHook)
    .post('/apis/build.openshift.io/v1/namespaces/:project/buildconfigs/:buildConfig/webhooks/:id/generic', bodyParser.json(), handleHook)
    .use(handleError);

  function handleHook(req, res) {
    logger.debug('webhookRoute/handleHook');
    const {project, buildConfig, id} = req.params;
    const data = req.body;
    logger.debug('data: ', data);
    const triggerUrl = `${openshiftWebhookUrl}/${project}/buildconfigs/${buildConfig}/webhooks/${id}/generic`;
    logger.debug(triggerUrl);
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
