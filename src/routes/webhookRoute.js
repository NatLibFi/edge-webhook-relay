import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import fetch from 'node-fetch';
import httpStatus from 'http-status';

export default function (openshiftWebhookUrl) { // eslint-disable-line no-unused-vars
  const logger = createLogger();

  return new Router()
    .post('/:project/:buildConfig/:id', handleHook)
    .use(handleError);

  function handleHook(req, res) {
    const {project, buildConfig, id} = req.params;
    const data = JSON.parse(req.body);
    const triggerUrl = `${openshiftWebhookUrl}/${project}/buildconfigs/${buildConfig}/webhooks/${id}/generic`;
    logger.debug(triggerUrl);
    fetch(
      triggerUrl,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      }
    );
    res.status(httpStatus.OK);
  }

  function handleError(req, res, next) {
    logger.error('Error', req, res);
    next();
  }
}
