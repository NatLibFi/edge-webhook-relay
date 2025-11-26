import {handleInterrupt, createLogger} from '@natlibfi/melinda-backend-commons';
import * as config from './config.js';
import startApp from './app.js';

run();

async function run() {
  const logger = createLogger();
  registerInterruptionHandlers();

  await startApp(config);

  function registerInterruptionHandlers() {
    process
      .on('SIGTERM', handleSignal)
      .on('SIGINT', handleInterrupt)
      .on('uncaughtException', (err, _origin) => {
        handleTermination({code: 1, message: err.message});
      })
      .on('unhandledRejection', (reason, _promise) => {
        const message = reason instanceof Error ? reason.message : 'Unknown reason'
        handleTermination({code: 1, message});
      });
  }

  function handleSignal(signal) {
    handleTermination({code: 1, message: `Received ${signal}`});
  }

  function handleTermination({code = 0, message = false}) {
    logMessage(message);

    process.exit(code);

    function logMessage(message) {
      if (message) {
        return logger.error(message);
      }
    }
  }
}
