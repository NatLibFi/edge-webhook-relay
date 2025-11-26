import assert from 'node:assert';
import {describe, it} from 'node:test';
import httpStatus from 'http-status';
import {matchTriggerUrl, validateUrlWhiteList} from './urlService.js';

describe('validateUrlWhiteList', () => {
  it('Passes empty list', () => {
    assert.equal(validateUrlWhiteList([]), true);
  });

  it('Passes secure values and ignores case', () => {
    assert.equal(validateUrlWhiteList(['https://.*']), true);
    assert.equal(validateUrlWhiteList(['https://test.fi/.*', 'HTTPS://TEST.FI/.*', 'hTTpS://tEst.FI/.*']), true);
  });

  it('Fails non array list', () => {
    try {
      validateUrlWhiteList(true);
      assert.equal(true, false, "This should throw");
    } catch (error) {
      assert.match(error.message, /^Invalid URL_WHITELIST/ui);
    }
  });

  it('Fails on non string value', () => {
    try {
      validateUrlWhiteList(['https://.*', true]);
      assert.equal(true, false, "This should throw");
    } catch (error) {
      assert.match(error.message, /^Invalid values in URL_WHITELIST/ui);
    }
  });

  it('Fails on non secure value http://', () => {
    try {
      validateUrlWhiteList(['https://.*', 'http://test']);
      assert.equal(true, false, "This should throw");
    } catch (error) {
      assert.match(error.message, /^Unsecure values in URL_WHITELIST/ui);
    }
  });

  it('Fails on non secure value test', () => {
    try {
      validateUrlWhiteList(['https://.*', 'test']);
      assert.equal(true, false, "This should throw");
    } catch (error) {
      assert.match(error.message, /^Unsecure values in URL_WHITELIST/ui);
    }
  });
});

describe('matchTriggerUrl', () => {
  it('Passes on valid url', () => {
    assert.equal(matchTriggerUrl('https://.*', ['https:\/\/.*']), true);
  });

  it('Fails on non string url', () => {
    assert.deepStrictEqual(matchTriggerUrl(false, ['https:\/\/.*']), {status: httpStatus.BAD_REQUEST, message: 'Unprosessable trigger url'});
  });

  it('Fails non valid url', () => {
    assert.deepStrictEqual(matchTriggerUrl('http://', ['https:\/\/.*']), {status: httpStatus.NOT_FOUND, message: 'Url not whitelisted'});
  });

  it('Fails on too long url', () => {
    assert.deepStrictEqual(matchTriggerUrl('https://1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890', ['https:\/\/.*']), {status: httpStatus.BAD_REQUEST, message: 'Trigger url schema error'});
  });

  it('Fails on too short url', () => {
    assert.deepStrictEqual(matchTriggerUrl('', ['https:\/\/.*']), {status: httpStatus.BAD_REQUEST, message: 'Trigger url schema error'});
  });
});
