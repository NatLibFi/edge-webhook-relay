import assert from 'node:assert';
import {describe, it} from 'node:test';
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
    assert.equal(matchTriggerUrl(false, ['https:\/\/.*']), false);
  });

  it('Fails non valid url', () => {
    assert.equal(matchTriggerUrl('http://', ['https:\/\/.*']), false);
  });

  it('Fails on too long url', () => {
    assert.equal(matchTriggerUrl('https://123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890', ['https:\/\/.*']), false);
  });

  it('Fails on too short url', () => {
    assert.equal(matchTriggerUrl('', ['https:\/\/.*']), false);
  });
});
