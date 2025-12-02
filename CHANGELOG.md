# Changelog

## [1.7.1](https://github.com/cds-snc/forms-api/compare/v1.7.0...v1.7.1) (2025-12-01)


### Bug Fixes

* broken submission attachment download in .NET example ([#261](https://github.com/cds-snc/forms-api/issues/261)) ([bf9b2fa](https://github.com/cds-snc/forms-api/commit/bf9b2fafcf2078ae1e3f01e20c36b00380a38da7))


### Miscellaneous Chores

* **deps:** lock file maintenance ([#256](https://github.com/cds-snc/forms-api/issues/256)) ([2459658](https://github.com/cds-snc/forms-api/commit/2459658a6fc61e5130998ceea6101c32cb8115a7))
* **deps:** update all non-major github action dependencies ([#259](https://github.com/cds-snc/forms-api/issues/259)) ([318f70f](https://github.com/cds-snc/forms-api/commit/318f70f4a26789bc98c5de049a58f801e4aa71cc))
* **deps:** update all patch dependencies ([#264](https://github.com/cds-snc/forms-api/issues/264)) ([ba04f2c](https://github.com/cds-snc/forms-api/commit/ba04f2c2d4f5c7d83e6dcd6babc7716a588992a0))
* set limit for max number of characters when reporting problem with response. Also prevent base64 encoded string from being accepted ([#258](https://github.com/cds-snc/forms-api/issues/258)) ([d71fabf](https://github.com/cds-snc/forms-api/commit/d71fabfdfdcf23152820cda279a269f2559c20ab))
* synced file(s) with cds-snc/site-reliability-engineering ([#254](https://github.com/cds-snc/forms-api/issues/254)) ([14a8ebd](https://github.com/cds-snc/forms-api/commit/14a8ebd00905d160ae8d15286b2faab0878e75b7))
* synced file(s) with cds-snc/site-reliability-engineering ([#262](https://github.com/cds-snc/forms-api/issues/262)) ([ea4f193](https://github.com/cds-snc/forms-api/commit/ea4f1939e3cc46ff0ad5d9ed866b9574cb59e157))
* synced local '.github/workflows/export_github_data.yml' with remote 'tools/sre_file_sync/export_github_data.yml' ([ea4f193](https://github.com/cds-snc/forms-api/commit/ea4f1939e3cc46ff0ad5d9ed866b9574cb59e157))
* synced local '.github/workflows/s3-backup.yml' with remote 'tools/sre_file_sync/s3-backup.yml' ([14a8ebd](https://github.com/cds-snc/forms-api/commit/14a8ebd00905d160ae8d15286b2faab0878e75b7))

## [1.7.0](https://github.com/cds-snc/forms-api/compare/v1.6.0...v1.7.0) (2025-11-10)


### Features

* Add ID to attachment object ([#212](https://github.com/cds-snc/forms-api/issues/212)) ([f0eadf1](https://github.com/cds-snc/forms-api/commit/f0eadf1e32387af74b2479895820986260845f6b))
* Include md5 digest on file attachment payload ([#249](https://github.com/cds-snc/forms-api/issues/249)) ([e878a81](https://github.com/cds-snc/forms-api/commit/e878a8184c85c4d6433ebee1395885d73e31e905))


### Bug Fixes

* **deps:** update all patch dependencies ([#210](https://github.com/cds-snc/forms-api/issues/210)) ([5d142a5](https://github.com/cds-snc/forms-api/commit/5d142a5955c5ddaa3d01b5fd93871e5aefb57a2a))
* **deps:** update dependency got to v14.4.8 ([#215](https://github.com/cds-snc/forms-api/issues/215)) ([0a72ecd](https://github.com/cds-snc/forms-api/commit/0a72ecd1b1ca644f0ce5a1769e1ac0b72f6a559f))
* Freshdesk integartion due to wrong payload format being used ([#253](https://github.com/cds-snc/forms-api/issues/253)) ([57d7869](https://github.com/cds-snc/forms-api/commit/57d78698c423f263c954b0cf0a29843caf10bb79))


### Miscellaneous Chores

* add submission attachments support to API examples ([#209](https://github.com/cds-snc/forms-api/issues/209)) ([3a44e95](https://github.com/cds-snc/forms-api/commit/3a44e95c0b148312c0a134345af6e10e1f47f599))
* **deps:** bump axios from 1.11.0 to 1.12.0 in /examples/nodejs ([#223](https://github.com/cds-snc/forms-api/issues/223)) ([a14af97](https://github.com/cds-snc/forms-api/commit/a14af97e684f2c34c945c95c9861577c58e6e3a6))
* **deps:** bump axios from 1.11.0 to 1.12.0 in /utils/responseRetriever ([#217](https://github.com/cds-snc/forms-api/issues/217)) ([bdf8024](https://github.com/cds-snc/forms-api/commit/bdf8024586b1cdaf63a85bf7189e55e647f4a4f7))
* **deps:** bump axios in /utils/responseRetriever ([bdf8024](https://github.com/cds-snc/forms-api/commit/bdf8024586b1cdaf63a85bf7189e55e647f4a4f7))
* **deps:** lock file maintenance ([#227](https://github.com/cds-snc/forms-api/issues/227)) ([7d626dc](https://github.com/cds-snc/forms-api/commit/7d626dc21c6dabb1816b9556d8a6a7133a55111e))
* **deps:** lock file maintenance ([#230](https://github.com/cds-snc/forms-api/issues/230)) ([36b8b6e](https://github.com/cds-snc/forms-api/commit/36b8b6e9ee84657c5c30dc39fff9ce5e22d92e23))
* **deps:** lock file maintenance ([#236](https://github.com/cds-snc/forms-api/issues/236)) ([9047ec5](https://github.com/cds-snc/forms-api/commit/9047ec5436bff371188d2e8fc9711552e098f36d))
* **deps:** lock file maintenance ([#244](https://github.com/cds-snc/forms-api/issues/244)) ([6e0bf46](https://github.com/cds-snc/forms-api/commit/6e0bf467efcb13e474700f105fdd109f6e0412f7))
* **deps:** lock file maintenance ([#248](https://github.com/cds-snc/forms-api/issues/248)) ([44f7373](https://github.com/cds-snc/forms-api/commit/44f7373e4480db4629a5dbaa8730960bfeb45c1a))
* **deps:** lock file maintenance ([#252](https://github.com/cds-snc/forms-api/issues/252)) ([278b763](https://github.com/cds-snc/forms-api/commit/278b76367c3a7b6bbf559032d63c232333c28315))
* **deps:** update actions/dependency-review-action action to v4.8.1 ([#234](https://github.com/cds-snc/forms-api/issues/234)) ([9e52d5e](https://github.com/cds-snc/forms-api/commit/9e52d5e21a38ab1a217aabab1324f699a92a798a))
* **deps:** update all non-major github action dependencies ([#214](https://github.com/cds-snc/forms-api/issues/214)) ([6a2e10d](https://github.com/cds-snc/forms-api/commit/6a2e10d5c63e1e3ad2889fe1997fe21b9c33cec9))
* **deps:** update all non-major github action dependencies ([#225](https://github.com/cds-snc/forms-api/issues/225)) ([d43fd0f](https://github.com/cds-snc/forms-api/commit/d43fd0f6a9c8eb214566695eda9c01af9a3e8597))
* **deps:** update all non-major github action dependencies ([#247](https://github.com/cds-snc/forms-api/issues/247)) ([84fc6aa](https://github.com/cds-snc/forms-api/commit/84fc6aa18df148fcd9b2c6bbcbd23f3a453670b2))
* **deps:** update all patch dependencies ([#224](https://github.com/cds-snc/forms-api/issues/224)) ([746a112](https://github.com/cds-snc/forms-api/commit/746a1123864930e61dce72fba1f5775fadff3414))
* **deps:** update aws-actions/amazon-ecs-deploy-task-definition action to v2.4.0 ([#220](https://github.com/cds-snc/forms-api/issues/220)) ([eb7ab45](https://github.com/cds-snc/forms-api/commit/eb7ab457e6ca84bc5914dbfbf6f977b593e96799))
* **deps:** update aws-actions/amazon-ecs-render-task-definition action to v1.8.1 ([#242](https://github.com/cds-snc/forms-api/issues/242)) ([6d9f0c8](https://github.com/cds-snc/forms-api/commit/6d9f0c84984c641aefbd4f869a5772c43264c642))
* **deps:** update dependency axios to v1.12.0 [security] ([#218](https://github.com/cds-snc/forms-api/issues/218)) ([7a4aac2](https://github.com/cds-snc/forms-api/commit/7a4aac2fa3afd7cbf749dd2ca46670bd09e71709))
* **deps:** update dependency got to v14.4.9 ([#222](https://github.com/cds-snc/forms-api/issues/222)) ([a2cb2f8](https://github.com/cds-snc/forms-api/commit/a2cb2f8cb54518536eeb14c8854e771c7371a241))
* **deps:** update dependency node to v22.21.1 ([#250](https://github.com/cds-snc/forms-api/issues/250)) ([3823d4d](https://github.com/cds-snc/forms-api/commit/3823d4de8f029bd5d78735f03bcaec0124c8f8d2))
* **deps:** update dependency python to v3.14.0 ([#235](https://github.com/cds-snc/forms-api/issues/235)) ([1e4cc74](https://github.com/cds-snc/forms-api/commit/1e4cc74ba42c726f25ea6d18355c0407016cfe0a))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to 2e826a6 ([#233](https://github.com/cds-snc/forms-api/issues/233)) ([aa751f8](https://github.com/cds-snc/forms-api/commit/aa751f8572b7aa91be7038d17a63396b270b67a6))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to 4fe00dc ([#213](https://github.com/cds-snc/forms-api/issues/213)) ([ef361a6](https://github.com/cds-snc/forms-api/commit/ef361a6fd6a72281acd2396aadec59aa4bcdeecb))
* **deps:** update node.js to v22.20.0 ([#229](https://github.com/cds-snc/forms-api/issues/229)) ([5db5ea4](https://github.com/cds-snc/forms-api/commit/5db5ea4336339009b30a101973521b7ffa636cef))
* **deps:** update node.js to v22.21.0 ([#243](https://github.com/cds-snc/forms-api/issues/243)) ([c22fce4](https://github.com/cds-snc/forms-api/commit/c22fce4a2b9b89ea299c56f9558e744401cb65eb))
* **deps:** update node.js to v22.21.1 ([#251](https://github.com/cds-snc/forms-api/issues/251)) ([cbf96f6](https://github.com/cds-snc/forms-api/commit/cbf96f6c13ae732affb6b4f8ae05d3aa8786b038))
* edit Python example requirements ([#216](https://github.com/cds-snc/forms-api/issues/216)) ([eb7ad03](https://github.com/cds-snc/forms-api/commit/eb7ad03adf50d321133ec91e481623c469c2cf94))
* synced file(s) with cds-snc/site-reliability-engineering ([#226](https://github.com/cds-snc/forms-api/issues/226)) ([51ef53a](https://github.com/cds-snc/forms-api/commit/51ef53aff1b34f3499b40be82a22339b7ceadfde))
* synced file(s) with cds-snc/site-reliability-engineering ([#228](https://github.com/cds-snc/forms-api/issues/228)) ([e8cdc90](https://github.com/cds-snc/forms-api/commit/e8cdc90532b4e24e7962b166fb2c5b84c024882d))
* synced file(s) with cds-snc/site-reliability-engineering ([#239](https://github.com/cds-snc/forms-api/issues/239)) ([6b2068d](https://github.com/cds-snc/forms-api/commit/6b2068d4d02d8169acfbebc097387f46a5f01751))
* synced local '.github/workflows/export_github_data.yml' with remote 'tools/sre_file_sync/export_github_data.yml' ([6b2068d](https://github.com/cds-snc/forms-api/commit/6b2068d4d02d8169acfbebc097387f46a5f01751))
* synced local '.github/workflows/export_github_data.yml' with remote 'tools/sre_file_sync/export_github_data.yml' ([51ef53a](https://github.com/cds-snc/forms-api/commit/51ef53aff1b34f3499b40be82a22339b7ceadfde))

## [1.6.0](https://github.com/cds-snc/forms-api/compare/v1.5.0...v1.6.0) (2025-08-28)


### Features

* Enable cors for server ([#175](https://github.com/cds-snc/forms-api/issues/175)) ([fe240be](https://github.com/cds-snc/forms-api/commit/fe240be1176a53f0406e252e49d4bd17d135f8e4))
* replace file attachment content by download link when retrieving submission ([#202](https://github.com/cds-snc/forms-api/issues/202)) ([689ac41](https://github.com/cds-snc/forms-api/commit/689ac417f53b9aeb204867cae04797908abe17f8))
* submission attachments ([#182](https://github.com/cds-snc/forms-api/issues/182)) ([4b22851](https://github.com/cds-snc/forms-api/commit/4b22851d0d3884eb97e0c308dac18918516450ee))


### Bug Fixes

* **deps:** update all patch dependencies ([#184](https://github.com/cds-snc/forms-api/issues/184)) ([eaf5a9e](https://github.com/cds-snc/forms-api/commit/eaf5a9e43b07aac11f881e49cfc77d71ff6ea015))
* **deps:** update all patch dependencies ([#195](https://github.com/cds-snc/forms-api/issues/195)) ([9b5be24](https://github.com/cds-snc/forms-api/commit/9b5be240f8f0c0d575495762901b77f42c1bdf80))
* **deps:** update all patch dependencies ([#207](https://github.com/cds-snc/forms-api/issues/207)) ([5a18d6d](https://github.com/cds-snc/forms-api/commit/5a18d6d3024259d503113db41afd38bc81c64d2e))
* **deps:** update dependency @types/node to v22.17.1 ([#206](https://github.com/cds-snc/forms-api/issues/206)) ([c98c851](https://github.com/cds-snc/forms-api/commit/c98c85197328651e19900ee8a845cb9b88af5cf2))


### Miscellaneous Chores

* **deps:** bump axios from 1.10.0 to 1.11.0 in /examples/nodejs ([#197](https://github.com/cds-snc/forms-api/issues/197)) ([804c11d](https://github.com/cds-snc/forms-api/commit/804c11d77d879decf408e2772eb0f91796ff0806))
* **deps:** lock file maintenance ([#179](https://github.com/cds-snc/forms-api/issues/179)) ([3ea200a](https://github.com/cds-snc/forms-api/commit/3ea200a3295a041d0b4f9563c9fbb0cad3cf114b))
* **deps:** lock file maintenance ([#181](https://github.com/cds-snc/forms-api/issues/181)) ([c77575c](https://github.com/cds-snc/forms-api/commit/c77575c68981f9aee912dedda14aa29194beaaec))
* **deps:** lock file maintenance ([#188](https://github.com/cds-snc/forms-api/issues/188)) ([78b561c](https://github.com/cds-snc/forms-api/commit/78b561c34d58cc0a631e80d108ab4754214d210f))
* **deps:** lock file maintenance ([#190](https://github.com/cds-snc/forms-api/issues/190)) ([ee91324](https://github.com/cds-snc/forms-api/commit/ee91324ada44cbb26ddb4d40594e39b0d736b620))
* **deps:** lock file maintenance ([#193](https://github.com/cds-snc/forms-api/issues/193)) ([8bb6e19](https://github.com/cds-snc/forms-api/commit/8bb6e198ca5daccb4a451e28eeec12457a3e91d9))
* **deps:** lock file maintenance ([#196](https://github.com/cds-snc/forms-api/issues/196)) ([d3b2428](https://github.com/cds-snc/forms-api/commit/d3b2428a8dc91349f4fa536f4071a85e9faa79ad))
* **deps:** lock file maintenance ([#201](https://github.com/cds-snc/forms-api/issues/201)) ([ad014d6](https://github.com/cds-snc/forms-api/commit/ad014d608e22d6231e006fd98b204cbbe1a129ed))
* **deps:** update all non-major github action dependencies ([#177](https://github.com/cds-snc/forms-api/issues/177)) ([d1e34ad](https://github.com/cds-snc/forms-api/commit/d1e34ad1976e2dd109a47aea69b3147b84823a26))
* **deps:** update all non-major github action dependencies ([#180](https://github.com/cds-snc/forms-api/issues/180)) ([343cc10](https://github.com/cds-snc/forms-api/commit/343cc108ee817fcd7fa4682d9523da46a2c83e34))
* **deps:** update all non-major github action dependencies ([#185](https://github.com/cds-snc/forms-api/issues/185)) ([9f91cbe](https://github.com/cds-snc/forms-api/commit/9f91cbed3a4627d95ae7d52fa5033d921843da4f))
* **deps:** update all non-major github action dependencies ([#191](https://github.com/cds-snc/forms-api/issues/191)) ([6315fa7](https://github.com/cds-snc/forms-api/commit/6315fa7b3ca2cd4898486a1eef189e0087a2bc44))
* **deps:** update all non-major github action dependencies ([#199](https://github.com/cds-snc/forms-api/issues/199)) ([eeaa739](https://github.com/cds-snc/forms-api/commit/eeaa73969daee7bc47fbd5fc9679e05ce0782b3a))
* **deps:** update all non-major github action dependencies ([#205](https://github.com/cds-snc/forms-api/issues/205)) ([19a8c9d](https://github.com/cds-snc/forms-api/commit/19a8c9dea4c714fca19ed185fc1da654f854d76e))
* **deps:** update all non-major github action dependencies ([#208](https://github.com/cds-snc/forms-api/issues/208)) ([b240fae](https://github.com/cds-snc/forms-api/commit/b240fae55168d932d15de8b8cfe0df2e520c941f))
* **deps:** update all patch dependencies ([#186](https://github.com/cds-snc/forms-api/issues/186)) ([6b45722](https://github.com/cds-snc/forms-api/commit/6b45722cb5af6390c0de5c14db76ee92afdafdc8))
* **deps:** update all patch dependencies ([#200](https://github.com/cds-snc/forms-api/issues/200)) ([527ac66](https://github.com/cds-snc/forms-api/commit/527ac6622b28c23c8d11dd7bfd19ad6553fb56f2))
* **deps:** update aws-actions/amazon-ecr-login digest to a5bbe73 ([#183](https://github.com/cds-snc/forms-api/issues/183)) ([7002366](https://github.com/cds-snc/forms-api/commit/70023660a6ba344b105af3eb9659919a0a7cb04d))
* **deps:** update dependency node to v22.18.0 ([#203](https://github.com/cds-snc/forms-api/issues/203)) ([fdfc2dc](https://github.com/cds-snc/forms-api/commit/fdfc2dc9b9a12b562692c8a25fedd347f91e8d97))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to ce2e9e6 ([#194](https://github.com/cds-snc/forms-api/issues/194)) ([f3df6ef](https://github.com/cds-snc/forms-api/commit/f3df6ef85d88820a7cf270e77afa0a84a2923b65))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to da67c59 ([#178](https://github.com/cds-snc/forms-api/issues/178)) ([7095099](https://github.com/cds-snc/forms-api/commit/7095099d8c553e709eec6945ee0f1cbd731563aa))
* **deps:** update node.js to v22.17.0 ([#192](https://github.com/cds-snc/forms-api/issues/192)) ([96a63ec](https://github.com/cds-snc/forms-api/commit/96a63ec483ebbe2ff6ffc2423eacf69db7694db2))
* synced file(s) with cds-snc/site-reliability-engineering ([#187](https://github.com/cds-snc/forms-api/issues/187)) ([daa488b](https://github.com/cds-snc/forms-api/commit/daa488b98a4829fa7d1c4840e21d30dc7c773232))

## [1.5.0](https://github.com/cds-snc/forms-api/compare/v1.4.0...v1.5.0) (2025-05-27)


### Features

* enable local communication with Zitadel ([#169](https://github.com/cds-snc/forms-api/issues/169)) ([1f5f7ea](https://github.com/cds-snc/forms-api/commit/1f5f7ea6f571735438c6159d31ebb61fdf1d6fec))


### Bug Fixes

* **deps:** update all minor dependencies ([#165](https://github.com/cds-snc/forms-api/issues/165)) ([9aa8036](https://github.com/cds-snc/forms-api/commit/9aa8036e7beab8d19b5a9c44075ac1fa89740e0d))
* **deps:** update all patch dependencies ([#164](https://github.com/cds-snc/forms-api/issues/164)) ([432910b](https://github.com/cds-snc/forms-api/commit/432910b85e081720f077be396f29c6a24965c268))


### Miscellaneous Chores

* **deps:** lock file maintenance ([#166](https://github.com/cds-snc/forms-api/issues/166)) ([07e9ae2](https://github.com/cds-snc/forms-api/commit/07e9ae227f7ad20105c4931a1c04c9a8fad3f8dd))
* **deps:** update all non-major github action dependencies ([#172](https://github.com/cds-snc/forms-api/issues/172)) ([f339eb8](https://github.com/cds-snc/forms-api/commit/f339eb8835198b5d97c0cd4a0aee40c29d006f55))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to a04e0d6 ([#163](https://github.com/cds-snc/forms-api/issues/163)) ([bd70e46](https://github.com/cds-snc/forms-api/commit/bd70e46171ffd77c74502f7b984613e2b3457567))
* revert complex status endpoint logic ([#167](https://github.com/cds-snc/forms-api/issues/167)) ([c7dd49d](https://github.com/cds-snc/forms-api/commit/c7dd49d3bfbdb8c2aeb215b7a242749ba3d4a2dc))
* update submission name pattern ([#174](https://github.com/cds-snc/forms-api/issues/174)) ([fd2c0c7](https://github.com/cds-snc/forms-api/commit/fd2c0c7bbdf999d3651154c415fe38a0c4e1b0f0))

## [1.4.0](https://github.com/cds-snc/forms-api/compare/v1.3.4...v1.4.0) (2025-05-07)


### Features

* implement service health checks for status endpoint ([#156](https://github.com/cds-snc/forms-api/issues/156)) ([97121ea](https://github.com/cds-snc/forms-api/commit/97121ea22db64811d051c1cfcda7a7bf5d61811f))


### Miscellaneous Chores

* bash example on how to interact with the API targets production instead of staging ([#154](https://github.com/cds-snc/forms-api/issues/154)) ([33c58e5](https://github.com/cds-snc/forms-api/commit/33c58e5ae4afc07ccced3398d63d9127d2dd3dda))
* catch error in check service health operation (it can help debug issues like a missing permission on DynamoDB) ([#160](https://github.com/cds-snc/forms-api/issues/160)) ([4315886](https://github.com/cds-snc/forms-api/commit/43158866d9ad347c41724d67a9074178c2d217eb))
* **deps:** lock file maintenance ([#152](https://github.com/cds-snc/forms-api/issues/152)) ([42576c9](https://github.com/cds-snc/forms-api/commit/42576c9bf195878e8736253dd7a7e41df779067f))
* **deps:** lock file maintenance ([#158](https://github.com/cds-snc/forms-api/issues/158)) ([5988c08](https://github.com/cds-snc/forms-api/commit/5988c08dee6ebe473688bf0ce838f7e9f729123f))
* **deps:** update all non-major github action dependencies ([#157](https://github.com/cds-snc/forms-api/issues/157)) ([abe00b2](https://github.com/cds-snc/forms-api/commit/abe00b2baa85b04704905fcc76d32b6853667c06))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to eb406d5 ([#151](https://github.com/cds-snc/forms-api/issues/151)) ([4f2d40c](https://github.com/cds-snc/forms-api/commit/4f2d40cbc94009f12e8de17ccd0ae755183c2c8e))
* switch to CDS Release Bot ([#162](https://github.com/cds-snc/forms-api/issues/162)) ([21f32b4](https://github.com/cds-snc/forms-api/commit/21f32b4dd2c4dcee9767f3321a0945e8be978f1f))
* synced file(s) with cds-snc/site-reliability-engineering ([#159](https://github.com/cds-snc/forms-api/issues/159)) ([ea10462](https://github.com/cds-snc/forms-api/commit/ea10462343b083ae93216e9d6fc03205d36e8028))
* synced local '.github/workflows/backstage-catalog-helper.yml' with remote 'tools/sre_file_sync/backstage-catalog-helper.yml' ([ea10462](https://github.com/cds-snc/forms-api/commit/ea10462343b083ae93216e9d6fc03205d36e8028))
* update API integration examples to use latest version of frameworks/package dependencies ([#155](https://github.com/cds-snc/forms-api/issues/155)) ([f28f945](https://github.com/cds-snc/forms-api/commit/f28f945a62199f1b473e18cc30c88c97a0be47b7))

## [1.3.4](https://github.com/cds-snc/forms-api/compare/v1.3.3...v1.3.4) (2025-04-09)


### Miscellaneous Chores

* **deps:** lock file maintenance ([#148](https://github.com/cds-snc/forms-api/issues/148)) ([be42fd9](https://github.com/cds-snc/forms-api/commit/be42fd94acfcdaa684479e6288820f4dfc26c333))
* **deps:** update all minor dependencies ([#147](https://github.com/cds-snc/forms-api/issues/147)) ([4775042](https://github.com/cds-snc/forms-api/commit/47750420914e52aa26ae6ceeea6602f9151fdbed))
* **deps:** update all non-major github action dependencies ([#146](https://github.com/cds-snc/forms-api/issues/146)) ([df11b68](https://github.com/cds-snc/forms-api/commit/df11b682bfadd4ccbe3d132be8aa0cfcc97beb5c))
* update Axios package to version 1.8.4 ([#150](https://github.com/cds-snc/forms-api/issues/150)) ([3fa176a](https://github.com/cds-snc/forms-api/commit/3fa176a38dd36360cbd5044d376fd6212ac7634c))

## [1.3.3](https://github.com/cds-snc/forms-api/compare/v1.3.2...v1.3.3) (2025-04-02)


### Bug Fixes

* **deps:** update all patch dependencies ([#130](https://github.com/cds-snc/forms-api/issues/130)) ([276b04d](https://github.com/cds-snc/forms-api/commit/276b04d18a57ade1269b41219faff9bb2e46ef6d))
* **deps:** update all patch dependencies ([#145](https://github.com/cds-snc/forms-api/issues/145)) ([09a4422](https://github.com/cds-snc/forms-api/commit/09a4422548f8471af195828b42c338986b851eee))
* **deps:** update dependency axios to v1.8.2 [security] ([#140](https://github.com/cds-snc/forms-api/issues/140)) ([627ffd8](https://github.com/cds-snc/forms-api/commit/627ffd870e54d9b232ba8c42613c1957ab6ade05))


### Miscellaneous Chores

* **deps-dev:** bump vitest from 2.1.8 to 2.1.9 ([#137](https://github.com/cds-snc/forms-api/issues/137)) ([4a6d4de](https://github.com/cds-snc/forms-api/commit/4a6d4de5b6d73ce30f5929fa3f75c9482205f9e6))
* **deps:** lock file maintenance ([#129](https://github.com/cds-snc/forms-api/issues/129)) ([9f5a49c](https://github.com/cds-snc/forms-api/commit/9f5a49cd08e22a8d4973189ee64f8e79e1b9de4f))
* **deps:** lock file maintenance ([#144](https://github.com/cds-snc/forms-api/issues/144)) ([4584e9d](https://github.com/cds-snc/forms-api/commit/4584e9d43083a6292d0bf7da7e490a722f28f314))
* **deps:** update all non-major github action dependencies ([#131](https://github.com/cds-snc/forms-api/issues/131)) ([ac24732](https://github.com/cds-snc/forms-api/commit/ac247327b58ee4a22a1d4b2d06e4dba73353604f))
* **deps:** update all non-major github action dependencies ([#143](https://github.com/cds-snc/forms-api/issues/143)) ([71ffac1](https://github.com/cds-snc/forms-api/commit/71ffac1aba46ad8d91c7fd855752a93558f2f4db))
* **deps:** update dependency cryptography to v44 [security] ([#135](https://github.com/cds-snc/forms-api/issues/135)) ([464dc75](https://github.com/cds-snc/forms-api/commit/464dc75c40fb8c8d4d64738c9d11a275e64fa021))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to 577ed42 ([#142](https://github.com/cds-snc/forms-api/issues/142)) ([e91fc48](https://github.com/cds-snc/forms-api/commit/e91fc48e15918a8611750e5c31db6b27864253b4))
* synced file(s) with cds-snc/site-reliability-engineering ([#134](https://github.com/cds-snc/forms-api/issues/134)) ([a72ca11](https://github.com/cds-snc/forms-api/commit/a72ca11976250cc0ba700fb78018ee936480fe23))


### Code Refactoring

* rework error logs to reduce noise on Slack ([#141](https://github.com/cds-snc/forms-api/issues/141)) ([8cac23c](https://github.com/cds-snc/forms-api/commit/8cac23ca46f361a270da056942ca3e907c2eb8f3))

## [1.3.2](https://github.com/cds-snc/forms-api/compare/v1.3.1...v1.3.2) (2025-02-03)


### Bug Fixes

* Corepack Error ([#132](https://github.com/cds-snc/forms-api/issues/132)) ([91d3b6a](https://github.com/cds-snc/forms-api/commit/91d3b6a3a30424f3083e9c4878b9bf39ad1ac225))
* **deps:** update all minor dependencies ([#120](https://github.com/cds-snc/forms-api/issues/120)) ([1151e13](https://github.com/cds-snc/forms-api/commit/1151e134bcfc87d0bf7a3cd76786c70b8cba97ed))


### Miscellaneous Chores

* **deps:** lock file maintenance ([#121](https://github.com/cds-snc/forms-api/issues/121)) ([e300f25](https://github.com/cds-snc/forms-api/commit/e300f25c6b68ab1d1d1cd6635d8597cb3e5132ee))
* **deps:** update all non-major github action dependencies ([#119](https://github.com/cds-snc/forms-api/issues/119)) ([b77d016](https://github.com/cds-snc/forms-api/commit/b77d016f68225756331e8953b5defe152bd1606f))
* **deps:** update dependency pyjwt to v2.10.1 [security] ([#123](https://github.com/cds-snc/forms-api/issues/123)) ([97ea8ba](https://github.com/cds-snc/forms-api/commit/97ea8ba75d73b084c6cb0e87078478ab7a547dc8))
* **deps:** update mcr.microsoft.com/vscode/devcontainers/base:debian docker digest to 6155a48 ([#125](https://github.com/cds-snc/forms-api/issues/125)) ([3b3115c](https://github.com/cds-snc/forms-api/commit/3b3115c46814dd6c422dcbe889dee66d278b3877))
* synced file(s) with cds-snc/site-reliability-engineering ([#126](https://github.com/cds-snc/forms-api/issues/126)) ([df707f0](https://github.com/cds-snc/forms-api/commit/df707f052c519077f5cf37ecdce396ae667fcba1))

## [1.3.1](https://github.com/cds-snc/forms-api/compare/v1.3.0...v1.3.1) (2024-12-18)


### Miscellaneous Chores

* **deps:** lock file maintenance ([#115](https://github.com/cds-snc/forms-api/issues/115)) ([ca13d75](https://github.com/cds-snc/forms-api/commit/ca13d7545d64bfc471ce9d3f079b4efdd32912e4))
* **deps:** update all minor dependencies ([#114](https://github.com/cds-snc/forms-api/issues/114)) ([a359b9b](https://github.com/cds-snc/forms-api/commit/a359b9be47291fb48488d761ec7a37afbd95eb19))
* **deps:** update aws-actions/amazon-ecr-login digest to b430a9a ([#113](https://github.com/cds-snc/forms-api/issues/113)) ([bb16429](https://github.com/cds-snc/forms-api/commit/bb16429171468e274f03d5c23e1d979f87b18230))


### Code Refactoring

* replace use of Status with new Status#CreatedAt attribute when requesting Vault items ([#116](https://github.com/cds-snc/forms-api/issues/116)) ([917a3da](https://github.com/cds-snc/forms-api/commit/917a3da54b3bd25f7336c62a9e22221be05aa4e9))

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
