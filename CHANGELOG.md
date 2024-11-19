# Changelog

## [1.3.0](https://github.com/cds-snc/forms-api/compare/v1.2.0...v1.3.0) (2024-11-18)


### Features

* token bucket rate limiting ([#91](https://github.com/cds-snc/forms-api/issues/91)) ([201b6c4](https://github.com/cds-snc/forms-api/commit/201b6c4bc6291f688cc4d300b3c346337cef98d1))


### Bug Fixes

* Add rate limiting audit log ([#109](https://github.com/cds-snc/forms-api/issues/109)) ([39469ec](https://github.com/cds-snc/forms-api/commit/39469ec580d917cc0bb431f4eb732db610bb0320))
* authentication middleware tries to send JSON message as part of the response after the HTTP response has completed ([#111](https://github.com/cds-snc/forms-api/issues/111)) ([3dc6056](https://github.com/cds-snc/forms-api/commit/3dc605655145f04f572e0009f69fc82ad75d279e))
* **deps:** update all minor dependencies ([#107](https://github.com/cds-snc/forms-api/issues/107)) ([5129297](https://github.com/cds-snc/forms-api/commit/512929773e0b81092fd4192901fb100e93b91c50))


### Miscellaneous Chores

* **deps:** lock file maintenance ([#100](https://github.com/cds-snc/forms-api/issues/100)) ([2a76214](https://github.com/cds-snc/forms-api/commit/2a76214eb68852c619e8cd329aaf3b4c99e91afc))
* **deps:** lock file maintenance ([#108](https://github.com/cds-snc/forms-api/issues/108)) ([397cb65](https://github.com/cds-snc/forms-api/commit/397cb65d36fca94b79d8effccbcd6ba0baa022fc))
* **deps:** lock file maintenance ([#110](https://github.com/cds-snc/forms-api/issues/110)) ([f2f8750](https://github.com/cds-snc/forms-api/commit/f2f8750b90787921d148968d6d8ffb57beb55be8))
* **deps:** update all non-major github action dependencies ([#106](https://github.com/cds-snc/forms-api/issues/106)) ([e314724](https://github.com/cds-snc/forms-api/commit/e3147244ca65967bef624736089a2646638db271))
* **deps:** update all non-major github action dependencies ([#97](https://github.com/cds-snc/forms-api/issues/97)) ([30c3c6c](https://github.com/cds-snc/forms-api/commit/30c3c6c2d677ca113ba66522d1fd52719479db56))
* **deps:** update node.js to v22.10.0 ([#98](https://github.com/cds-snc/forms-api/issues/98)) ([7d070fa](https://github.com/cds-snc/forms-api/commit/7d070fa3f7ec9c107527cbe0eec3aa1a8b6438a2))
* **deps:** update pnpm to v9.12.3 ([#99](https://github.com/cds-snc/forms-api/issues/99)) ([84fda56](https://github.com/cds-snc/forms-api/commit/84fda56cf47f61249fecfe847d368a2bbf4fd581))


### Code Refactoring

* Authentication code and audit logs refactor ([#103](https://github.com/cds-snc/forms-api/issues/103)) ([d2ec486](https://github.com/cds-snc/forms-api/commit/d2ec48684fee00d46134370496df9f1518fb130c))

## [1.2.0](https://github.com/cds-snc/forms-api/compare/v1.1.0...v1.2.0) (2024-11-01)


### Features

* add API client example in Python ([#74](https://github.com/cds-snc/forms-api/issues/74)) ([37be258](https://github.com/cds-snc/forms-api/commit/37be258901322be67289755c3ef8db427179f71c))
* add Bash script API examples ([#73](https://github.com/cds-snc/forms-api/issues/73)) ([67e0fc2](https://github.com/cds-snc/forms-api/commit/67e0fc24f60983993f6abe1279b2133297afcb85))
* add report problem integration example ([#76](https://github.com/cds-snc/forms-api/issues/76)) ([7843642](https://github.com/cds-snc/forms-api/commit/78436427dcc5459aaf8b9e6a7ba250de712392ff))
* added integrity verification step in .NET example ([#69](https://github.com/cds-snc/forms-api/issues/69)) ([a6ba8bd](https://github.com/cds-snc/forms-api/commit/a6ba8bdcb486413ab9d02673ad57909c23421565))
* API integration examples use formId from API private key file ([#96](https://github.com/cds-snc/forms-api/issues/96)) ([f5e3b70](https://github.com/cds-snc/forms-api/commit/f5e3b7078b8bc53ed9d757a254e78e66dad99f6b))


### Bug Fixes

* add Python to the devcontainer ([#77](https://github.com/cds-snc/forms-api/issues/77)) ([3095fe8](https://github.com/cds-snc/forms-api/commit/3095fe8fbc57db1cba3a315f2578b2516a9f01ce))
* allow SBOM to be written to repo security events ([#67](https://github.com/cds-snc/forms-api/issues/67)) ([dda65d1](https://github.com/cds-snc/forms-api/commit/dda65d16f0fc8a05a3892da94299937afa70c15e))
* **deps:** update all minor dependencies ([#30](https://github.com/cds-snc/forms-api/issues/30)) ([bfbade3](https://github.com/cds-snc/forms-api/commit/bfbade31e96e1e3fba07254f87409836c7665999))
* **deps:** update all patch dependencies ([#94](https://github.com/cds-snc/forms-api/issues/94)) ([d5d26fc](https://github.com/cds-snc/forms-api/commit/d5d26fc6cd8df3f80cd48cf4666f56d522167a94))
* submission name validation test + new confirmation code test ([#78](https://github.com/cds-snc/forms-api/issues/78)) ([e24fa31](https://github.com/cds-snc/forms-api/commit/e24fa31b39d0f062828ab3ead2dc0188362c2754))
* use CDS Trivy vulnerability database ([#87](https://github.com/cds-snc/forms-api/issues/87)) ([6ee7634](https://github.com/cds-snc/forms-api/commit/6ee76342e44b7a91dbdd5892e48de787685afd68))


### Miscellaneous Chores

* bump most packages to latest version ([#82](https://github.com/cds-snc/forms-api/issues/82)) ([6ccb7a0](https://github.com/cds-snc/forms-api/commit/6ccb7a09c804b2c86363406f6dd119b0176956fb))
* bump packages for modules outside of API code to latest version ([#83](https://github.com/cds-snc/forms-api/issues/83)) ([b144360](https://github.com/cds-snc/forms-api/commit/b1443600c0a4feabcd516109bbff11c568b0b4d2))
* **deps:** lock file maintenance ([#27](https://github.com/cds-snc/forms-api/issues/27)) ([5d5517d](https://github.com/cds-snc/forms-api/commit/5d5517d4ce30e9e036cf09dabd1009704682f8f5))
* **deps:** lock file maintenance ([#85](https://github.com/cds-snc/forms-api/issues/85)) ([c10d9ad](https://github.com/cds-snc/forms-api/commit/c10d9adc4d8c9d051247a9d84d881e5b7170a948))
* **deps:** lock file maintenance ([#95](https://github.com/cds-snc/forms-api/issues/95)) ([618f99f](https://github.com/cds-snc/forms-api/commit/618f99fe88e010cbfecad9def28c50b7aec54482))
* **deps:** update all non-major github action dependencies ([#71](https://github.com/cds-snc/forms-api/issues/71)) ([d5bd683](https://github.com/cds-snc/forms-api/commit/d5bd683ee216d4091278e6c73356b565ce4c903a))
* **deps:** update all non-major github action dependencies ([#80](https://github.com/cds-snc/forms-api/issues/80)) ([42cf4c8](https://github.com/cds-snc/forms-api/commit/42cf4c833e50495078893b5522710cb2454fc34a))
* **deps:** update all non-major github action dependencies ([#84](https://github.com/cds-snc/forms-api/issues/84)) ([31e1416](https://github.com/cds-snc/forms-api/commit/31e1416015e0fd1813f2363463d3ee52b9a42247))
* **deps:** update aws-actions/amazon-ecr-login digest to 02faf1a ([#93](https://github.com/cds-snc/forms-api/issues/93)) ([4b18059](https://github.com/cds-snc/forms-api/commit/4b18059e7cf77a4fb3e03e55898ba12c0b64ebab))
* **deps:** update aws-actions/amazon-ecr-login digest to 6f9c6fa ([#88](https://github.com/cds-snc/forms-api/issues/88)) ([b4f856d](https://github.com/cds-snc/forms-api/commit/b4f856dcea7c0148487a6d24920d1052afa797ed))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to 37eec4b ([#70](https://github.com/cds-snc/forms-api/issues/70)) ([405fb63](https://github.com/cds-snc/forms-api/commit/405fb634af7c5aa7ad01eb8591f7c89f36b211cb))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to 3d780df ([#79](https://github.com/cds-snc/forms-api/issues/79)) ([c945765](https://github.com/cds-snc/forms-api/commit/c945765b5eb304be8290ddc37851f2824a0d9a37))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to b3fd61a ([#89](https://github.com/cds-snc/forms-api/issues/89)) ([fd739f8](https://github.com/cds-snc/forms-api/commit/fd739f80fe817f0a07c7675c82b8a4d11cc12fce))
* **deps:** update pnpm to v9.12.1 ([#59](https://github.com/cds-snc/forms-api/issues/59)) ([a1942ca](https://github.com/cds-snc/forms-api/commit/a1942ca54dc472e5e6829454ecee05ec61854946))
* synced file(s) with cds-snc/site-reliability-engineering ([#75](https://github.com/cds-snc/forms-api/issues/75)) ([271b5c2](https://github.com/cds-snc/forms-api/commit/271b5c229ae3f11ce7a65f315b34e8d38f99735f))
* synced file(s) with cds-snc/site-reliability-engineering ([#86](https://github.com/cds-snc/forms-api/issues/86)) ([244f0bc](https://github.com/cds-snc/forms-api/commit/244f0bcf79e85f8f561a6865f0a391a28ab3acc2))
* synced local '.github/workflows/ossf-scorecard.yml' with remote 'tools/sre_file_sync/ossf-scorecard.yml' ([271b5c2](https://github.com/cds-snc/forms-api/commit/271b5c229ae3f11ce7a65f315b34e8d38f99735f))
* update Biome to version 1.9.4 ([#90](https://github.com/cds-snc/forms-api/issues/90)) ([3206e0b](https://github.com/cds-snc/forms-api/commit/3206e0b0d0922f7779bd3239b5e6e9511049e925))
* update example code variables to production environment ([#92](https://github.com/cds-snc/forms-api/issues/92)) ([2df2550](https://github.com/cds-snc/forms-api/commit/2df2550beee883c87339165895bdbe7796213924))


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
