# Changelog

## [1.2.0](https://github.com/cds-snc/forms-api/compare/v1.1.0...v1.2.0) (2024-10-03)


### Features

* add API client example in Python ([#74](https://github.com/cds-snc/forms-api/issues/74)) ([37be258](https://github.com/cds-snc/forms-api/commit/37be258901322be67289755c3ef8db427179f71c))
* add Bash script API examples ([#73](https://github.com/cds-snc/forms-api/issues/73)) ([67e0fc2](https://github.com/cds-snc/forms-api/commit/67e0fc24f60983993f6abe1279b2133297afcb85))
* add report problem integration example ([#76](https://github.com/cds-snc/forms-api/issues/76)) ([7843642](https://github.com/cds-snc/forms-api/commit/78436427dcc5459aaf8b9e6a7ba250de712392ff))
* added integrity verification step in .NET example ([#69](https://github.com/cds-snc/forms-api/issues/69)) ([a6ba8bd](https://github.com/cds-snc/forms-api/commit/a6ba8bdcb486413ab9d02673ad57909c23421565))


### Bug Fixes

* add Python to the devcontainer ([#77](https://github.com/cds-snc/forms-api/issues/77)) ([3095fe8](https://github.com/cds-snc/forms-api/commit/3095fe8fbc57db1cba3a315f2578b2516a9f01ce))
* allow SBOM to be written to repo security events ([#67](https://github.com/cds-snc/forms-api/issues/67)) ([dda65d1](https://github.com/cds-snc/forms-api/commit/dda65d16f0fc8a05a3892da94299937afa70c15e))
* submission name validation test + new confirmation code test ([#78](https://github.com/cds-snc/forms-api/issues/78)) ([e24fa31](https://github.com/cds-snc/forms-api/commit/e24fa31b39d0f062828ab3ead2dc0188362c2754))


### Miscellaneous Chores

* bump most packages to latest version ([#82](https://github.com/cds-snc/forms-api/issues/82)) ([6ccb7a0](https://github.com/cds-snc/forms-api/commit/6ccb7a09c804b2c86363406f6dd119b0176956fb))
* bump packages for modules outside of API code to latest version ([#83](https://github.com/cds-snc/forms-api/issues/83)) ([b144360](https://github.com/cds-snc/forms-api/commit/b1443600c0a4feabcd516109bbff11c568b0b4d2))
* **deps:** lock file maintenance ([#27](https://github.com/cds-snc/forms-api/issues/27)) ([5d5517d](https://github.com/cds-snc/forms-api/commit/5d5517d4ce30e9e036cf09dabd1009704682f8f5))
* **deps:** update all non-major github action dependencies ([#71](https://github.com/cds-snc/forms-api/issues/71)) ([d5bd683](https://github.com/cds-snc/forms-api/commit/d5bd683ee216d4091278e6c73356b565ce4c903a))
* **deps:** update all non-major github action dependencies ([#80](https://github.com/cds-snc/forms-api/issues/80)) ([42cf4c8](https://github.com/cds-snc/forms-api/commit/42cf4c833e50495078893b5522710cb2454fc34a))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to 37eec4b ([#70](https://github.com/cds-snc/forms-api/issues/70)) ([405fb63](https://github.com/cds-snc/forms-api/commit/405fb634af7c5aa7ad01eb8591f7c89f36b211cb))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to 3d780df ([#79](https://github.com/cds-snc/forms-api/issues/79)) ([c945765](https://github.com/cds-snc/forms-api/commit/c945765b5eb304be8290ddc37851f2824a0d9a37))
* synced file(s) with cds-snc/site-reliability-engineering ([#75](https://github.com/cds-snc/forms-api/issues/75)) ([271b5c2](https://github.com/cds-snc/forms-api/commit/271b5c229ae3f11ce7a65f315b34e8d38f99735f))
* synced local '.github/workflows/ossf-scorecard.yml' with remote 'tools/sre_file_sync/ossf-scorecard.yml' ([271b5c2](https://github.com/cds-snc/forms-api/commit/271b5c229ae3f11ce7a65f315b34e8d38f99735f))


### Code Refactoring

* leverage express global error handler for everything that returns a HTTP code 500 ([#81](https://github.com/cds-snc/forms-api/issues/81)) ([a98b0c8](https://github.com/cds-snc/forms-api/commit/a98b0c80c142feb3bc0dfd7d3cf6e7de239ca7c2))
* rework project structure and routing logic ([#65](https://github.com/cds-snc/forms-api/issues/65)) ([180a22c](https://github.com/cds-snc/forms-api/commit/180a22c4fb2b5eed8c895379c38a0a92e7d9f396))
* various code improvements + add missing tests ([#72](https://github.com/cds-snc/forms-api/issues/72)) ([695aa0e](https://github.com/cds-snc/forms-api/commit/695aa0ec7aefaded2a2fdec6b89aa392a52b2052))

## [1.1.0](https://github.com/cds-snc/forms-api/compare/v1.0.0...v1.1.0) (2024-09-18)


### Features

* add API client example in Node.js ([#62](https://github.com/cds-snc/forms-api/issues/62)) ([f6dd573](https://github.com/cds-snc/forms-api/commit/f6dd573fbe8189ebd0e349a43438a116e3121b53))
* Add integrity check and update Node example ([#64](https://github.com/cds-snc/forms-api/issues/64)) ([d6c99a2](https://github.com/cds-snc/forms-api/commit/d6c99a23fab5d8f037b78bf3cf25635fa6c4aa41))
* setup Release Please and prod deploy workflows ([#61](https://github.com/cds-snc/forms-api/issues/61)) ([00efe66](https://github.com/cds-snc/forms-api/commit/00efe66e039349ce288c3f65dcd4e35b92aec785))


### Miscellaneous Chores

* synced file(s) with cds-snc/site-reliability-engineering ([#66](https://github.com/cds-snc/forms-api/issues/66)) ([3aaf6a4](https://github.com/cds-snc/forms-api/commit/3aaf6a42d6ae58159d0c898527ee1144f09007d2))
* synced local '.github/workflows/backstage-catalog-helper.yml' with remote 'tools/sre_file_sync/backstage-catalog-helper.yml' ([3aaf6a4](https://github.com/cds-snc/forms-api/commit/3aaf6a42d6ae58159d0c898527ee1144f09007d2))

## [1.0.0](https://github.com/cds-snc/forms-api/compare/21dc13edfdf08bed2e745880721a2ccaabc0edce...v1.0.0) (2024-09-16)
