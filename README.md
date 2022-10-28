# Webhook relay

Webhook relay for **University Of Helsinki (The National Library Of Finland)**

## Envs
### Generic transformer envs
| Name                  | Description                         | default or e.g.                                          |
|-----------------------|-------------------------------------|----------------------------------------------------------|
| OPENSHIFT_WEBHOOK_URL | OpenShift webhook url               | 'https://xxx:0000/apis/build.openshift.io/v1/namespaces' |
| HTTP_PORT             | HTTP port express listens           | '8080'                                                   |
| GITHUB_META_URL       | URL where github releases IP ranges | 'https://api.github.com/meta'                            |
| IP_WHITELIST          |                                     | [], '["xxx.xxx.xxx.xxx"]'                                |

## License and copyright

Copyright (c) 2022 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **MIT** or any later version.
