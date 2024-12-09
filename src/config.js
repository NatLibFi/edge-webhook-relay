// import {parseBoolean} from '@natlibfi/melinda-commons';
import {readEnvironmentVariable} from '@natlibfi/melinda-backend-commons';

export const httpPort = readEnvironmentVariable('HTTP_PORT', {defaultValue: '8080'});
export const githubMetaUrl = readEnvironmentVariable('GITHUB_META_URL', {defaultValue: 'https://api.github.com/meta'});
export const openshiftWebhookUrl = readEnvironmentVariable('OPENSHIFT_WEBHOOK_URL');
export const ipWhiteList = readEnvironmentVariable('IP_WHITELIST', {defaultValue: [], format: v => JSON.parse(v)});
export const urlWhiteList = readEnvironmentVariable('URL_WHITELIST', {defaultValue: [], format: v => JSON.parse(v)});
