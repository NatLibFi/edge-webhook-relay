import httpStatus from 'http-status';

export function validateUrlWhiteList(urlWhiteList) {
  if (!Array.isArray(urlWhiteList)) {
    throw new Error('Invalid URL_WHITELIST');
  }

  if (urlWhiteList.some(url => typeof url !== 'string')) {
    throw new Error('Invalid values in URL_WHITELIST');
  }

  if (!urlWhiteList.every(url => new RegExp('^https:\/\/.*', 'ui').test(url))) {
    throw new Error('Unsecure values in URL_WHITELIST');
  }

  return true;
}

export function matchTriggerUrl(triggerUrl, urlWhiteList) {
  if (typeof triggerUrl !== 'string') {
    return {status: httpStatus.BAD_REQUEST, message: 'Unprosessable trigger url'};
  }

  if (triggerUrl.length > 100) {
    return {status: httpStatus.BAD_REQUEST, message: 'Trigger url schema error'};
  }

  if (triggerUrl === '' || triggerUrl === 'https://') {
    return {status: httpStatus.BAD_REQUEST, message: 'Trigger url schema error'};
  }

  if (urlWhiteList.some(urlRegexp => new RegExp(urlRegexp, 'ui').test(triggerUrl))) {
    return true;
  }

  return {status: httpStatus.NOT_FOUND, message: 'Url not whitelisted'};
}