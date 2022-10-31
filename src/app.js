import express from 'express';
import httpStatus from 'http-status';
import fetch from 'node-fetch';
import {createLogger, createExpressLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';

import createWebhookRoute from './routes/webhookRoute';


export default async function ({
  httpPort, githubMetaUrl, openshiftWebhookUrl, ipWhiteList
}) {
  const logger = createLogger();
  const server = await initExpress();

  // Soft shutdown function
  server.on('close', () => {
    logger.info('Initiating soft shutdown of Melinda REST API');
    // Things that need soft shutdown
  });

  return server;

  async function initExpress() { // eslint-disable-line max-statements
    const metaList = await getMetaList(githubMetaUrl);
    // logger.debug(metaList); // eslint-disable-line

    const app = express();
    app.set('trust proxy', true);
    app.use(createExpressLogger());
    app.use(whiteListMiddleware);
    app.use('/webhooks', createWebhookRoute(openshiftWebhookUrl));

    app.use(handleError);

    return app.listen(httpPort, () => logger.log('info', `Started Melinda REST API in port ${httpPort}`));

    function handleError(err, req, res, next) { // eslint-disable-line max-statements
      logger.info('App/handleError');
      if (err) {
        logger.error(err);
        if (err instanceof ApiError) {
          logger.debug('Responding expected:', err);
          return res.status(err.status).send(err.payload);
        }

        if (req.aborted) {
          logger.debug('Responding timeout:', err);
          return res.status(httpStatus.REQUEST_TIMEOUT).send(httpStatus['504_MESSAGE']);
        }

        logger.debug('Responding unexpected:', err);
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
      }

      next();
    }

    function getMetaList(githubMetaUrl) {
      return fetch(
        githubMetaUrl,
        {
          method: 'get',
          headers: {
            'Accept': 'application/json'
          }
        }
      ).then(result => result.json());
    }

    function whiteListMiddleware(req, res, next) {
      logger.verbose('Middleware');
      const connectionIp = req.ip;
      logger.debug(connectionIp);
      const parsedConnectionIp = connectionIp.replace(/::ffff:/u, '');
      logger.debug(parsedConnectionIp);
      if (metaList.actions.includes(parsedConnectionIp) || ipWhiteList.includes(parsedConnectionIp)) {
        logger.debug('IP ok');
        return next();
      }

      logger.debug(`Bad IP: ${req.connection.remoteAddress}`);
      const err = new Error(`Bad IP: ${req.connection.remoteAddress}`);
      return next(err);
    }
  }
}
