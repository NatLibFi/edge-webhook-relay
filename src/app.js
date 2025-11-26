import express from 'express';
import httpStatus from 'http-status';
import ipRangeCheck from 'ip-range-check';
import {createLogger, createExpressLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';

import createWebhookRoute from './routes/webhookRoute.js';


export default async function ({
  httpPort, githubMetaUrl, openshiftWebhookUrl, ipWhiteList, urlWhiteList
}) {
  const logger = createLogger();
  const server = await initExpress();

  // Soft shutdown function
  server.on('close', () => {
    logger.info('Initiating soft shutdown of edge-webhook-relay');
    // Things that need soft shutdown
  });

  return server;

  async function initExpress() {
    const metaList = await getMetaList(githubMetaUrl);
    logger.debug(metaList.actions);

    const app = express();
    app.set('trust proxy', true);
    app.use(createExpressLogger());
    app.use('/webhooks', createWebhookRoute(whiteListMiddleware, openshiftWebhookUrl, urlWhiteList));

    app.use(handleError);

    return app.listen(httpPort, () => logger.log('info', `Started Melinda REST API in port ${httpPort}`));

    function handleError(err, req, res, next) {
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

    async function getMetaList(githubMetaUrl) {
      const response = await fetch(
        githubMetaUrl,
        {
          method: 'get',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      return response.json();
    }

    function whiteListMiddleware(req, res, next) {
      logger.verbose('Middleware');
      const connectionIp = req.ip;
      logger.debug(connectionIp);
      const parsedConnectionIp = connectionIp.replace(/::ffff:/u, '');
      logger.debug(parsedConnectionIp);
      if (ipRangeCheck(`${parsedConnectionIp}`, [...metaList.hooks, ...metaList.actions, ...ipWhiteList])) {
        logger.debug('IP ok');
        return next();
      }

      logger.debug(`Bad IP: ${req.ip}`);
      const err = new ApiError(httpStatus.FORBIDDEN, 'Invalid IP');
      return next(err);
    }
  }
}
