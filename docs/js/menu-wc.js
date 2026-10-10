'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">node-starter-backend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                        <li class="link">
                            <a href="contributing.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CONTRIBUTING
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AccountApiModule.html" data-type="entity-link" >AccountApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AccountApiModule-6e5c6dd0c522b24f608f00189efc2b3f609962f1d3240013f7425ebf72c29f173f527da1a2d13a8123b9d6331b20a28cf3bb099093c71e6acab29a48fa066897"' : 'data-bs-target="#xs-controllers-links-module-AccountApiModule-6e5c6dd0c522b24f608f00189efc2b3f609962f1d3240013f7425ebf72c29f173f527da1a2d13a8123b9d6331b20a28cf3bb099093c71e6acab29a48fa066897"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AccountApiModule-6e5c6dd0c522b24f608f00189efc2b3f609962f1d3240013f7425ebf72c29f173f527da1a2d13a8123b9d6331b20a28cf3bb099093c71e6acab29a48fa066897"' :
                                            'id="xs-controllers-links-module-AccountApiModule-6e5c6dd0c522b24f608f00189efc2b3f609962f1d3240013f7425ebf72c29f173f527da1a2d13a8123b9d6331b20a28cf3bb099093c71e6acab29a48fa066897"' }>
                                            <li class="link">
                                                <a href="controllers/AccountApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccountApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AccountApiModule-6e5c6dd0c522b24f608f00189efc2b3f609962f1d3240013f7425ebf72c29f173f527da1a2d13a8123b9d6331b20a28cf3bb099093c71e6acab29a48fa066897"' : 'data-bs-target="#xs-injectables-links-module-AccountApiModule-6e5c6dd0c522b24f608f00189efc2b3f609962f1d3240013f7425ebf72c29f173f527da1a2d13a8123b9d6331b20a28cf3bb099093c71e6acab29a48fa066897"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AccountApiModule-6e5c6dd0c522b24f608f00189efc2b3f609962f1d3240013f7425ebf72c29f173f527da1a2d13a8123b9d6331b20a28cf3bb099093c71e6acab29a48fa066897"' :
                                        'id="xs-injectables-links-module-AccountApiModule-6e5c6dd0c522b24f608f00189efc2b3f609962f1d3240013f7425ebf72c29f173f527da1a2d13a8123b9d6331b20a28cf3bb099093c71e6acab29a48fa066897"' }>
                                        <li class="link">
                                            <a href="injectables/AccountApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccountApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AccountDBModule.html" data-type="entity-link" >AccountDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AccountDBModule-93a89c1de20692311d9ebc78da9c2c696e1741a57731ad5efc67601cdaab65a5fb580e317f06d5846d6a00fdbf305581ff0d1800c21dfd119679b7a87e5019ec"' : 'data-bs-target="#xs-injectables-links-module-AccountDBModule-93a89c1de20692311d9ebc78da9c2c696e1741a57731ad5efc67601cdaab65a5fb580e317f06d5846d6a00fdbf305581ff0d1800c21dfd119679b7a87e5019ec"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AccountDBModule-93a89c1de20692311d9ebc78da9c2c696e1741a57731ad5efc67601cdaab65a5fb580e317f06d5846d6a00fdbf305581ff0d1800c21dfd119679b7a87e5019ec"' :
                                        'id="xs-injectables-links-module-AccountDBModule-93a89c1de20692311d9ebc78da9c2c696e1741a57731ad5efc67601cdaab65a5fb580e317f06d5846d6a00fdbf305581ff0d1800c21dfd119679b7a87e5019ec"' }>
                                        <li class="link">
                                            <a href="injectables/AccountAnonymizationJob.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccountAnonymizationJob</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AccountDeletionDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccountDeletionDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DataRetentionExecutorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataRetentionExecutorService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ActivityLogModule.html" data-type="entity-link" >ActivityLogModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ActivityLogsApiModule.html" data-type="entity-link" >ActivityLogsApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ActivityLogsApiModule-1a2539ca9c71bfdddd66ccc89309a8452e30a206264d7489bb273500574bd8aa7db0914cd4a60bb59840fe8f89f2ce7f6e552b4ef1e790f32e9c7835cad895d5"' : 'data-bs-target="#xs-controllers-links-module-ActivityLogsApiModule-1a2539ca9c71bfdddd66ccc89309a8452e30a206264d7489bb273500574bd8aa7db0914cd4a60bb59840fe8f89f2ce7f6e552b4ef1e790f32e9c7835cad895d5"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ActivityLogsApiModule-1a2539ca9c71bfdddd66ccc89309a8452e30a206264d7489bb273500574bd8aa7db0914cd4a60bb59840fe8f89f2ce7f6e552b4ef1e790f32e9c7835cad895d5"' :
                                            'id="xs-controllers-links-module-ActivityLogsApiModule-1a2539ca9c71bfdddd66ccc89309a8452e30a206264d7489bb273500574bd8aa7db0914cd4a60bb59840fe8f89f2ce7f6e552b4ef1e790f32e9c7835cad895d5"' }>
                                            <li class="link">
                                                <a href="controllers/ActivityLogsApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ActivityLogsApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AiDisclosureApiModule.html" data-type="entity-link" >AiDisclosureApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AiDisclosureApiModule-c7c5bf0c0c749de73a9f563321f449047ebee64cb39a66afb8a2e145422ecd2bb5289ea8bc30e2594751ca5b055b95d69db1c942dd552d1b84e4982a144c6ef9"' : 'data-bs-target="#xs-controllers-links-module-AiDisclosureApiModule-c7c5bf0c0c749de73a9f563321f449047ebee64cb39a66afb8a2e145422ecd2bb5289ea8bc30e2594751ca5b055b95d69db1c942dd552d1b84e4982a144c6ef9"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AiDisclosureApiModule-c7c5bf0c0c749de73a9f563321f449047ebee64cb39a66afb8a2e145422ecd2bb5289ea8bc30e2594751ca5b055b95d69db1c942dd552d1b84e4982a144c6ef9"' :
                                            'id="xs-controllers-links-module-AiDisclosureApiModule-c7c5bf0c0c749de73a9f563321f449047ebee64cb39a66afb8a2e145422ecd2bb5289ea8bc30e2594751ca5b055b95d69db1c942dd552d1b84e4982a144c6ef9"' }>
                                            <li class="link">
                                                <a href="controllers/AiDisclosureApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AiDisclosureApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AiDisclosureDBModule.html" data-type="entity-link" >AiDisclosureDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AiDisclosureDBModule-5f536c7ca48a4399dbf7271df9370c50f98fb8447f94d385ca39353b72823cc3e89d8d633c67721c2addc1b58099bad1f00dd5134865f5d53b35ffa0faa04ce8"' : 'data-bs-target="#xs-injectables-links-module-AiDisclosureDBModule-5f536c7ca48a4399dbf7271df9370c50f98fb8447f94d385ca39353b72823cc3e89d8d633c67721c2addc1b58099bad1f00dd5134865f5d53b35ffa0faa04ce8"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AiDisclosureDBModule-5f536c7ca48a4399dbf7271df9370c50f98fb8447f94d385ca39353b72823cc3e89d8d633c67721c2addc1b58099bad1f00dd5134865f5d53b35ffa0faa04ce8"' :
                                        'id="xs-injectables-links-module-AiDisclosureDBModule-5f536c7ca48a4399dbf7271df9370c50f98fb8447f94d385ca39353b72823cc3e89d8d633c67721c2addc1b58099bad1f00dd5134865f5d53b35ffa0faa04ce8"' }>
                                        <li class="link">
                                            <a href="injectables/AiDisclosureDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AiDisclosureDBService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ApiClientsApiModule.html" data-type="entity-link" >ApiClientsApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ApiClientsApiModule-3d999bf6791e48a9904d8f186a6d2b72b459cc872b23b69709cf45bf82794c061d2685b0f6fc9ad238dc443d07f13894672ebb6ec855f31768747337f8bf4cb7"' : 'data-bs-target="#xs-controllers-links-module-ApiClientsApiModule-3d999bf6791e48a9904d8f186a6d2b72b459cc872b23b69709cf45bf82794c061d2685b0f6fc9ad238dc443d07f13894672ebb6ec855f31768747337f8bf4cb7"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ApiClientsApiModule-3d999bf6791e48a9904d8f186a6d2b72b459cc872b23b69709cf45bf82794c061d2685b0f6fc9ad238dc443d07f13894672ebb6ec855f31768747337f8bf4cb7"' :
                                            'id="xs-controllers-links-module-ApiClientsApiModule-3d999bf6791e48a9904d8f186a6d2b72b459cc872b23b69709cf45bf82794c061d2685b0f6fc9ad238dc443d07f13894672ebb6ec855f31768747337f8bf4cb7"' }>
                                            <li class="link">
                                                <a href="controllers/ApiClientsApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiClientsApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ApiClientsApiModule-3d999bf6791e48a9904d8f186a6d2b72b459cc872b23b69709cf45bf82794c061d2685b0f6fc9ad238dc443d07f13894672ebb6ec855f31768747337f8bf4cb7"' : 'data-bs-target="#xs-injectables-links-module-ApiClientsApiModule-3d999bf6791e48a9904d8f186a6d2b72b459cc872b23b69709cf45bf82794c061d2685b0f6fc9ad238dc443d07f13894672ebb6ec855f31768747337f8bf4cb7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ApiClientsApiModule-3d999bf6791e48a9904d8f186a6d2b72b459cc872b23b69709cf45bf82794c061d2685b0f6fc9ad238dc443d07f13894672ebb6ec855f31768747337f8bf4cb7"' :
                                        'id="xs-injectables-links-module-ApiClientsApiModule-3d999bf6791e48a9904d8f186a6d2b72b459cc872b23b69709cf45bf82794c061d2685b0f6fc9ad238dc443d07f13894672ebb6ec855f31768747337f8bf4cb7"' }>
                                        <li class="link">
                                            <a href="injectables/ApiClientsApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiClientsApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ApiClientsDBModule.html" data-type="entity-link" >ApiClientsDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ApiClientsDBModule-27bbf11f686b8dbded70a3d914013bec2dfae86fb712f39af78bb3545c095f7dbbce8c573872828dc9b23dde2a25fe8b3a6d73ebc291f22cb29a5f4295ff6472"' : 'data-bs-target="#xs-injectables-links-module-ApiClientsDBModule-27bbf11f686b8dbded70a3d914013bec2dfae86fb712f39af78bb3545c095f7dbbce8c573872828dc9b23dde2a25fe8b3a6d73ebc291f22cb29a5f4295ff6472"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ApiClientsDBModule-27bbf11f686b8dbded70a3d914013bec2dfae86fb712f39af78bb3545c095f7dbbce8c573872828dc9b23dde2a25fe8b3a6d73ebc291f22cb29a5f4295ff6472"' :
                                        'id="xs-injectables-links-module-ApiClientsDBModule-27bbf11f686b8dbded70a3d914013bec2dfae86fb712f39af78bb3545c095f7dbbce8c573872828dc9b23dde2a25fe8b3a6d73ebc291f22cb29a5f4295ff6472"' }>
                                        <li class="link">
                                            <a href="injectables/ApiClientSigningSecretService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiClientSigningSecretService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ApiClientsDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiClientsDBService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ApiModule.html" data-type="entity-link" >ApiModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppCacheModule.html" data-type="entity-link" >AppCacheModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppCacheModule-5d4db54031dadabf6361740378ac74e77256be9abd805a88ace7cfb54ced6e29dad68bb22977306034bfb6c5cdc250ac4692f83f4f26325c10eb3808086c7920"' : 'data-bs-target="#xs-injectables-links-module-AppCacheModule-5d4db54031dadabf6361740378ac74e77256be9abd805a88ace7cfb54ced6e29dad68bb22977306034bfb6c5cdc250ac4692f83f4f26325c10eb3808086c7920"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppCacheModule-5d4db54031dadabf6361740378ac74e77256be9abd805a88ace7cfb54ced6e29dad68bb22977306034bfb6c5cdc250ac4692f83f4f26325c10eb3808086c7920"' :
                                        'id="xs-injectables-links-module-AppCacheModule-5d4db54031dadabf6361740378ac74e77256be9abd805a88ace7cfb54ced6e29dad68bb22977306034bfb6c5cdc250ac4692f83f4f26325c10eb3808086c7920"' }>
                                        <li class="link">
                                            <a href="injectables/CacheShutdown.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CacheShutdown</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PermissionsCacheService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionsCacheService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppEventsModule.html" data-type="entity-link" >AppEventsModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-1dcf5d483b41ae32b57a8174f15f786312d0bc3bf889a61de34ae4a062dc25fdf1dbe7cd2845657ab9f0cdd0d277affaec93518e7f17d88ca661f9fb37c7763a"' : 'data-bs-target="#xs-injectables-links-module-AppModule-1dcf5d483b41ae32b57a8174f15f786312d0bc3bf889a61de34ae4a062dc25fdf1dbe7cd2845657ab9f0cdd0d277affaec93518e7f17d88ca661f9fb37c7763a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-1dcf5d483b41ae32b57a8174f15f786312d0bc3bf889a61de34ae4a062dc25fdf1dbe7cd2845657ab9f0cdd0d277affaec93518e7f17d88ca661f9fb37c7763a"' :
                                        'id="xs-injectables-links-module-AppModule-1dcf5d483b41ae32b57a8174f15f786312d0bc3bf889a61de34ae4a062dc25fdf1dbe7cd2845657ab9f0cdd0d277affaec93518e7f17d88ca661f9fb37c7763a"' }>
                                        <li class="link">
                                            <a href="injectables/ObservabilityInterceptor.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ObservabilityInterceptor</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuditLogDBModule.html" data-type="entity-link" >AuditLogDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuditLogDBModule-da9ad24864a596399174c193a05315ffd7aa3aed6c242e97c87f04616fc6e03475632fbed3b7a50bc8c33ba5c210bfa8ef4d439ff6a9c085cbfacae3a8217eae"' : 'data-bs-target="#xs-injectables-links-module-AuditLogDBModule-da9ad24864a596399174c193a05315ffd7aa3aed6c242e97c87f04616fc6e03475632fbed3b7a50bc8c33ba5c210bfa8ef4d439ff6a9c085cbfacae3a8217eae"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuditLogDBModule-da9ad24864a596399174c193a05315ffd7aa3aed6c242e97c87f04616fc6e03475632fbed3b7a50bc8c33ba5c210bfa8ef4d439ff6a9c085cbfacae3a8217eae"' :
                                        'id="xs-injectables-links-module-AuditLogDBModule-da9ad24864a596399174c193a05315ffd7aa3aed6c242e97c87f04616fc6e03475632fbed3b7a50bc8c33ba5c210bfa8ef4d439ff6a9c085cbfacae3a8217eae"' }>
                                        <li class="link">
                                            <a href="injectables/AuditLogDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditLogDBService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuditLogsApiModule.html" data-type="entity-link" >AuditLogsApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuditLogsApiModule-a8fb4ada3a44be476eb27082f314961214523fd702cd9816a96f040e0042b984df81b01e45faf782ad28baaab620754949e3adff8034613c362ade7421133c83"' : 'data-bs-target="#xs-controllers-links-module-AuditLogsApiModule-a8fb4ada3a44be476eb27082f314961214523fd702cd9816a96f040e0042b984df81b01e45faf782ad28baaab620754949e3adff8034613c362ade7421133c83"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuditLogsApiModule-a8fb4ada3a44be476eb27082f314961214523fd702cd9816a96f040e0042b984df81b01e45faf782ad28baaab620754949e3adff8034613c362ade7421133c83"' :
                                            'id="xs-controllers-links-module-AuditLogsApiModule-a8fb4ada3a44be476eb27082f314961214523fd702cd9816a96f040e0042b984df81b01e45faf782ad28baaab620754949e3adff8034613c362ade7421133c83"' }>
                                            <li class="link">
                                                <a href="controllers/AuditLogsApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditLogsApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuditLogsApiModule-a8fb4ada3a44be476eb27082f314961214523fd702cd9816a96f040e0042b984df81b01e45faf782ad28baaab620754949e3adff8034613c362ade7421133c83"' : 'data-bs-target="#xs-injectables-links-module-AuditLogsApiModule-a8fb4ada3a44be476eb27082f314961214523fd702cd9816a96f040e0042b984df81b01e45faf782ad28baaab620754949e3adff8034613c362ade7421133c83"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuditLogsApiModule-a8fb4ada3a44be476eb27082f314961214523fd702cd9816a96f040e0042b984df81b01e45faf782ad28baaab620754949e3adff8034613c362ade7421133c83"' :
                                        'id="xs-injectables-links-module-AuditLogsApiModule-a8fb4ada3a44be476eb27082f314961214523fd702cd9816a96f040e0042b984df81b01e45faf782ad28baaab620754949e3adff8034613c362ade7421133c83"' }>
                                        <li class="link">
                                            <a href="injectables/AuditLogsApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditLogsApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthApiModule.html" data-type="entity-link" >AuthApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthApiModule-9ba9c74ce046a64f590c2d191e90e76d6253d6247082d64cc94be2b1d83beadcd09a8063ca1290d530ae8d21f6e84426bb9d0f7fab5a6857237ee826f55105c2"' : 'data-bs-target="#xs-controllers-links-module-AuthApiModule-9ba9c74ce046a64f590c2d191e90e76d6253d6247082d64cc94be2b1d83beadcd09a8063ca1290d530ae8d21f6e84426bb9d0f7fab5a6857237ee826f55105c2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthApiModule-9ba9c74ce046a64f590c2d191e90e76d6253d6247082d64cc94be2b1d83beadcd09a8063ca1290d530ae8d21f6e84426bb9d0f7fab5a6857237ee826f55105c2"' :
                                            'id="xs-controllers-links-module-AuthApiModule-9ba9c74ce046a64f590c2d191e90e76d6253d6247082d64cc94be2b1d83beadcd09a8063ca1290d530ae8d21f6e84426bb9d0f7fab5a6857237ee826f55105c2"' }>
                                            <li class="link">
                                                <a href="controllers/AuthApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthApiModule-9ba9c74ce046a64f590c2d191e90e76d6253d6247082d64cc94be2b1d83beadcd09a8063ca1290d530ae8d21f6e84426bb9d0f7fab5a6857237ee826f55105c2"' : 'data-bs-target="#xs-injectables-links-module-AuthApiModule-9ba9c74ce046a64f590c2d191e90e76d6253d6247082d64cc94be2b1d83beadcd09a8063ca1290d530ae8d21f6e84426bb9d0f7fab5a6857237ee826f55105c2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthApiModule-9ba9c74ce046a64f590c2d191e90e76d6253d6247082d64cc94be2b1d83beadcd09a8063ca1290d530ae8d21f6e84426bb9d0f7fab5a6857237ee826f55105c2"' :
                                        'id="xs-injectables-links-module-AuthApiModule-9ba9c74ce046a64f590c2d191e90e76d6253d6247082d64cc94be2b1d83beadcd09a8063ca1290d530ae8d21f6e84426bb9d0f7fab5a6857237ee826f55105c2"' }>
                                        <li class="link">
                                            <a href="injectables/AuthApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthApiService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthCookieService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthCookieService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthMigrationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthMigrationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtRefreshStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtRefreshStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-cc137da98450894d85f42cb49e2f9a16dd2b6d183459282e062e7d1b4fbff6d34ca6e87d70b203c45f27e12a455961c4e2a3113584aab823320b77f895063d63"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-cc137da98450894d85f42cb49e2f9a16dd2b6d183459282e062e7d1b4fbff6d34ca6e87d70b203c45f27e12a455961c4e2a3113584aab823320b77f895063d63"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-cc137da98450894d85f42cb49e2f9a16dd2b6d183459282e062e7d1b4fbff6d34ca6e87d70b203c45f27e12a455961c4e2a3113584aab823320b77f895063d63"' :
                                        'id="xs-injectables-links-module-AuthModule-cc137da98450894d85f42cb49e2f9a16dd2b6d183459282e062e7d1b4fbff6d34ca6e87d70b203c45f27e12a455961c4e2a3113584aab823320b77f895063d63"' }>
                                        <li class="link">
                                            <a href="injectables/AuthPasswordService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthPasswordService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthTokenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthTokenService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CredentialsRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CredentialsRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CatalogOrmApiModule.html" data-type="entity-link" >CatalogOrmApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CatalogOrmApiModule-f45fc80f53614ae3970e466efc5f07a24db96c3915c129c03b5c8b24105ded7a36fb92b92d98c65fa0d6b0e120fc7c06445a2b749d86f67d67377b6ea8075982"' : 'data-bs-target="#xs-controllers-links-module-CatalogOrmApiModule-f45fc80f53614ae3970e466efc5f07a24db96c3915c129c03b5c8b24105ded7a36fb92b92d98c65fa0d6b0e120fc7c06445a2b749d86f67d67377b6ea8075982"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CatalogOrmApiModule-f45fc80f53614ae3970e466efc5f07a24db96c3915c129c03b5c8b24105ded7a36fb92b92d98c65fa0d6b0e120fc7c06445a2b749d86f67d67377b6ea8075982"' :
                                            'id="xs-controllers-links-module-CatalogOrmApiModule-f45fc80f53614ae3970e466efc5f07a24db96c3915c129c03b5c8b24105ded7a36fb92b92d98c65fa0d6b0e120fc7c06445a2b749d86f67d67377b6ea8075982"' }>
                                            <li class="link">
                                                <a href="controllers/CatalogOrmApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogOrmApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CatalogOrmApiModule-f45fc80f53614ae3970e466efc5f07a24db96c3915c129c03b5c8b24105ded7a36fb92b92d98c65fa0d6b0e120fc7c06445a2b749d86f67d67377b6ea8075982"' : 'data-bs-target="#xs-injectables-links-module-CatalogOrmApiModule-f45fc80f53614ae3970e466efc5f07a24db96c3915c129c03b5c8b24105ded7a36fb92b92d98c65fa0d6b0e120fc7c06445a2b749d86f67d67377b6ea8075982"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CatalogOrmApiModule-f45fc80f53614ae3970e466efc5f07a24db96c3915c129c03b5c8b24105ded7a36fb92b92d98c65fa0d6b0e120fc7c06445a2b749d86f67d67377b6ea8075982"' :
                                        'id="xs-injectables-links-module-CatalogOrmApiModule-f45fc80f53614ae3970e466efc5f07a24db96c3915c129c03b5c8b24105ded7a36fb92b92d98c65fa0d6b0e120fc7c06445a2b749d86f67d67377b6ea8075982"' }>
                                        <li class="link">
                                            <a href="injectables/CatalogOrmApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogOrmApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CatalogOrmDbModule.html" data-type="entity-link" >CatalogOrmDbModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CatalogOrmDbModule-c925ece6995135797bccbce932926a54125379a5869d40112990156453f8ae9a81174aaf2621dca1d5fe68a6642d63b34a2d014b25034d96fa438ee95ec43514"' : 'data-bs-target="#xs-injectables-links-module-CatalogOrmDbModule-c925ece6995135797bccbce932926a54125379a5869d40112990156453f8ae9a81174aaf2621dca1d5fe68a6642d63b34a2d014b25034d96fa438ee95ec43514"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CatalogOrmDbModule-c925ece6995135797bccbce932926a54125379a5869d40112990156453f8ae9a81174aaf2621dca1d5fe68a6642d63b34a2d014b25034d96fa438ee95ec43514"' :
                                        'id="xs-injectables-links-module-CatalogOrmDbModule-c925ece6995135797bccbce932926a54125379a5869d40112990156453f8ae9a81174aaf2621dca1d5fe68a6642d63b34a2d014b25034d96fa438ee95ec43514"' }>
                                        <li class="link">
                                            <a href="injectables/CatalogCategoryRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogCategoryRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CatalogItemRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogItemRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CatalogItemStockRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogItemStockRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CatalogOrmService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogOrmService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CatalogRawApiModule.html" data-type="entity-link" >CatalogRawApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CatalogRawApiModule-d76d1fb8ba9c50a3cee073b15da935af7246a4ba359d1a88e3c55670a51568c1a0a20b598f9f0056c95b734395df3ebd229efde3dbea3002fcfd76e592930bf2"' : 'data-bs-target="#xs-controllers-links-module-CatalogRawApiModule-d76d1fb8ba9c50a3cee073b15da935af7246a4ba359d1a88e3c55670a51568c1a0a20b598f9f0056c95b734395df3ebd229efde3dbea3002fcfd76e592930bf2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CatalogRawApiModule-d76d1fb8ba9c50a3cee073b15da935af7246a4ba359d1a88e3c55670a51568c1a0a20b598f9f0056c95b734395df3ebd229efde3dbea3002fcfd76e592930bf2"' :
                                            'id="xs-controllers-links-module-CatalogRawApiModule-d76d1fb8ba9c50a3cee073b15da935af7246a4ba359d1a88e3c55670a51568c1a0a20b598f9f0056c95b734395df3ebd229efde3dbea3002fcfd76e592930bf2"' }>
                                            <li class="link">
                                                <a href="controllers/CatalogRawApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogRawApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CatalogRawApiModule-d76d1fb8ba9c50a3cee073b15da935af7246a4ba359d1a88e3c55670a51568c1a0a20b598f9f0056c95b734395df3ebd229efde3dbea3002fcfd76e592930bf2"' : 'data-bs-target="#xs-injectables-links-module-CatalogRawApiModule-d76d1fb8ba9c50a3cee073b15da935af7246a4ba359d1a88e3c55670a51568c1a0a20b598f9f0056c95b734395df3ebd229efde3dbea3002fcfd76e592930bf2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CatalogRawApiModule-d76d1fb8ba9c50a3cee073b15da935af7246a4ba359d1a88e3c55670a51568c1a0a20b598f9f0056c95b734395df3ebd229efde3dbea3002fcfd76e592930bf2"' :
                                        'id="xs-injectables-links-module-CatalogRawApiModule-d76d1fb8ba9c50a3cee073b15da935af7246a4ba359d1a88e3c55670a51568c1a0a20b598f9f0056c95b734395df3ebd229efde3dbea3002fcfd76e592930bf2"' }>
                                        <li class="link">
                                            <a href="injectables/CatalogRawApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogRawApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CatalogRawDbModule.html" data-type="entity-link" >CatalogRawDbModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CatalogRawDbModule-51dad87085cee2247b2939cbb6349c51719034c1c0e6a05c9a000483f40e06ab9dd93a50211cc16f7050f9cfcf128cc000e5294ced536248d80f28425fbcfa7a"' : 'data-bs-target="#xs-injectables-links-module-CatalogRawDbModule-51dad87085cee2247b2939cbb6349c51719034c1c0e6a05c9a000483f40e06ab9dd93a50211cc16f7050f9cfcf128cc000e5294ced536248d80f28425fbcfa7a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CatalogRawDbModule-51dad87085cee2247b2939cbb6349c51719034c1c0e6a05c9a000483f40e06ab9dd93a50211cc16f7050f9cfcf128cc000e5294ced536248d80f28425fbcfa7a"' :
                                        'id="xs-injectables-links-module-CatalogRawDbModule-51dad87085cee2247b2939cbb6349c51719034c1c0e6a05c9a000483f40e06ab9dd93a50211cc16f7050f9cfcf128cc000e5294ced536248d80f28425fbcfa7a"' }>
                                        <li class="link">
                                            <a href="injectables/CatalogRawRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogRawRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CatalogRawService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CatalogRawService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DatabaseModule-8e30d3ea5e5cb07617b93165e4c35c8fb35a849896a7059831b79c6139aae64ebe41a1b508a9d906d6c0bb1d500abcacf1c5e5b118327b283e61d0100342dbcb"' : 'data-bs-target="#xs-injectables-links-module-DatabaseModule-8e30d3ea5e5cb07617b93165e4c35c8fb35a849896a7059831b79c6139aae64ebe41a1b508a9d906d6c0bb1d500abcacf1c5e5b118327b283e61d0100342dbcb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DatabaseModule-8e30d3ea5e5cb07617b93165e4c35c8fb35a849896a7059831b79c6139aae64ebe41a1b508a9d906d6c0bb1d500abcacf1c5e5b118327b283e61d0100342dbcb"' :
                                        'id="xs-injectables-links-module-DatabaseModule-8e30d3ea5e5cb07617b93165e4c35c8fb35a849896a7059831b79c6139aae64ebe41a1b508a9d906d6c0bb1d500abcacf1c5e5b118327b283e61d0100342dbcb"' }>
                                        <li class="link">
                                            <a href="injectables/DatabaseHelper.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatabaseHelper</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PrismaDatasource.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaDatasource</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EmailModule.html" data-type="entity-link" >EmailModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EmailModule-ece1faea154c4e4aa00316471bff559526e4066f276e78cb9866c7c4718bafc727212b446614d069e77ec2662351c2f76c3b49bd60df8e4020cec3c1ccfc98e1"' : 'data-bs-target="#xs-injectables-links-module-EmailModule-ece1faea154c4e4aa00316471bff559526e4066f276e78cb9866c7c4718bafc727212b446614d069e77ec2662351c2f76c3b49bd60df8e4020cec3c1ccfc98e1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EmailModule-ece1faea154c4e4aa00316471bff559526e4066f276e78cb9866c7c4718bafc727212b446614d069e77ec2662351c2f76c3b49bd60df8e4020cec3c1ccfc98e1"' :
                                        'id="xs-injectables-links-module-EmailModule-ece1faea154c4e4aa00316471bff559526e4066f276e78cb9866c7c4718bafc727212b446614d069e77ec2662351c2f76c3b49bd60df8e4020cec3c1ccfc98e1"' }>
                                        <li class="link">
                                            <a href="injectables/EmailService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SmtpHealthIndicator.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmtpHealthIndicator</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventsApiModule.html" data-type="entity-link" >EventsApiModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EventsApiModule-5858718d986d936a79b7a4e0723ed401547bc7ca2133e7c139830560a1f7545d083320c2eaad4874bbbe4bb968fe591dd6408084c80e5008cb24e1159bf2f527"' : 'data-bs-target="#xs-injectables-links-module-EventsApiModule-5858718d986d936a79b7a4e0723ed401547bc7ca2133e7c139830560a1f7545d083320c2eaad4874bbbe4bb968fe591dd6408084c80e5008cb24e1159bf2f527"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EventsApiModule-5858718d986d936a79b7a4e0723ed401547bc7ca2133e7c139830560a1f7545d083320c2eaad4874bbbe4bb968fe591dd6408084c80e5008cb24e1159bf2f527"' :
                                        'id="xs-injectables-links-module-EventsApiModule-5858718d986d936a79b7a4e0723ed401547bc7ca2133e7c139830560a1f7545d083320c2eaad4874bbbe4bb968fe591dd6408084c80e5008cb24e1159bf2f527"' }>
                                        <li class="link">
                                            <a href="injectables/NotificationRealtimeListener.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationRealtimeListener</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ExampleApiModule.html" data-type="entity-link" >ExampleApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ExampleApiModule-4146b7164ab3a0dc8d1937247c019503c3d667b285665da77523d7eebc646a2c9caff6d82ed679815ee37678f58e8707d9f502bc79839a167950e5d4c31d67e0"' : 'data-bs-target="#xs-controllers-links-module-ExampleApiModule-4146b7164ab3a0dc8d1937247c019503c3d667b285665da77523d7eebc646a2c9caff6d82ed679815ee37678f58e8707d9f502bc79839a167950e5d4c31d67e0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ExampleApiModule-4146b7164ab3a0dc8d1937247c019503c3d667b285665da77523d7eebc646a2c9caff6d82ed679815ee37678f58e8707d9f502bc79839a167950e5d4c31d67e0"' :
                                            'id="xs-controllers-links-module-ExampleApiModule-4146b7164ab3a0dc8d1937247c019503c3d667b285665da77523d7eebc646a2c9caff6d82ed679815ee37678f58e8707d9f502bc79839a167950e5d4c31d67e0"' }>
                                            <li class="link">
                                                <a href="controllers/ExampleApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExampleApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ExampleApiModule-4146b7164ab3a0dc8d1937247c019503c3d667b285665da77523d7eebc646a2c9caff6d82ed679815ee37678f58e8707d9f502bc79839a167950e5d4c31d67e0"' : 'data-bs-target="#xs-injectables-links-module-ExampleApiModule-4146b7164ab3a0dc8d1937247c019503c3d667b285665da77523d7eebc646a2c9caff6d82ed679815ee37678f58e8707d9f502bc79839a167950e5d4c31d67e0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ExampleApiModule-4146b7164ab3a0dc8d1937247c019503c3d667b285665da77523d7eebc646a2c9caff6d82ed679815ee37678f58e8707d9f502bc79839a167950e5d4c31d67e0"' :
                                        'id="xs-injectables-links-module-ExampleApiModule-4146b7164ab3a0dc8d1937247c019503c3d667b285665da77523d7eebc646a2c9caff6d82ed679815ee37678f58e8707d9f502bc79839a167950e5d4c31d67e0"' }>
                                        <li class="link">
                                            <a href="injectables/ExampleApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExampleApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ExampleModule.html" data-type="entity-link" >ExampleModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ExampleModule-588692099a079fa00a15cec76cc1921d2a0418ad1d79825321deae0736ead93ed5f67ecd7f4f9f4eea4b06afb3efe5da9a755930250b5953486472d8343d734d"' : 'data-bs-target="#xs-injectables-links-module-ExampleModule-588692099a079fa00a15cec76cc1921d2a0418ad1d79825321deae0736ead93ed5f67ecd7f4f9f4eea4b06afb3efe5da9a755930250b5953486472d8343d734d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ExampleModule-588692099a079fa00a15cec76cc1921d2a0418ad1d79825321deae0736ead93ed5f67ecd7f4f9f4eea4b06afb3efe5da9a755930250b5953486472d8343d734d"' :
                                        'id="xs-injectables-links-module-ExampleModule-588692099a079fa00a15cec76cc1921d2a0418ad1d79825321deae0736ead93ed5f67ecd7f4f9f4eea4b06afb3efe5da9a755930250b5953486472d8343d734d"' }>
                                        <li class="link">
                                            <a href="injectables/ExampleRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExampleRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ExampleService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExampleService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HealthModule.html" data-type="entity-link" >HealthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-HealthModule-7263bfa1f260d80c3e88facf9cdf66a4c0e74a3fbec7c1b3306ca9c78cce7f36c110efa0ae2f573c63ab739ea09efec0e1911b084b651fc4a37803692d9f58a3"' : 'data-bs-target="#xs-controllers-links-module-HealthModule-7263bfa1f260d80c3e88facf9cdf66a4c0e74a3fbec7c1b3306ca9c78cce7f36c110efa0ae2f573c63ab739ea09efec0e1911b084b651fc4a37803692d9f58a3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HealthModule-7263bfa1f260d80c3e88facf9cdf66a4c0e74a3fbec7c1b3306ca9c78cce7f36c110efa0ae2f573c63ab739ea09efec0e1911b084b651fc4a37803692d9f58a3"' :
                                            'id="xs-controllers-links-module-HealthModule-7263bfa1f260d80c3e88facf9cdf66a4c0e74a3fbec7c1b3306ca9c78cce7f36c110efa0ae2f573c63ab739ea09efec0e1911b084b651fc4a37803692d9f58a3"' }>
                                            <li class="link">
                                                <a href="controllers/HealthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HealthController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HttpClientModule.html" data-type="entity-link" >HttpClientModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-HttpClientModule-dbffc761fe7dc25e2bec7b4fb1d5143ae8914f296445aa7a5ae7381d23e6eef97ea2d80bd515c8b124b60d70e02621adf4f9dbb665ba7ad066188628b224c2b3"' : 'data-bs-target="#xs-injectables-links-module-HttpClientModule-dbffc761fe7dc25e2bec7b4fb1d5143ae8914f296445aa7a5ae7381d23e6eef97ea2d80bd515c8b124b60d70e02621adf4f9dbb665ba7ad066188628b224c2b3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HttpClientModule-dbffc761fe7dc25e2bec7b4fb1d5143ae8914f296445aa7a5ae7381d23e6eef97ea2d80bd515c8b124b60d70e02621adf4f9dbb665ba7ad066188628b224c2b3"' :
                                        'id="xs-injectables-links-module-HttpClientModule-dbffc761fe7dc25e2bec7b4fb1d5143ae8914f296445aa7a5ae7381d23e6eef97ea2d80bd515c8b124b60d70e02621adf4f9dbb665ba7ad066188628b224c2b3"' }>
                                        <li class="link">
                                            <a href="injectables/ExampleUpstreamClient.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExampleUpstreamClient</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/IdempotencyModule.html" data-type="entity-link" >IdempotencyModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-IdempotencyModule-72c7029315ad4f8587b26f2d9be5556ed9f971f767b58a9c072342ad02f96b32939de52dc172aa3a28b8ad5870f8b595179ed44c524d228be89f6ae6b93bebd0"' : 'data-bs-target="#xs-injectables-links-module-IdempotencyModule-72c7029315ad4f8587b26f2d9be5556ed9f971f767b58a9c072342ad02f96b32939de52dc172aa3a28b8ad5870f8b595179ed44c524d228be89f6ae6b93bebd0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-IdempotencyModule-72c7029315ad4f8587b26f2d9be5556ed9f971f767b58a9c072342ad02f96b32939de52dc172aa3a28b8ad5870f8b595179ed44c524d228be89f6ae6b93bebd0"' :
                                        'id="xs-injectables-links-module-IdempotencyModule-72c7029315ad4f8587b26f2d9be5556ed9f971f767b58a9c072342ad02f96b32939de52dc172aa3a28b8ad5870f8b595179ed44c524d228be89f6ae6b93bebd0"' }>
                                        <li class="link">
                                            <a href="injectables/IdempotencyInterceptor.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IdempotencyInterceptor</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/IdempotencyPurgeJob.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IdempotencyPurgeJob</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/IdempotencyService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IdempotencyService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/JobsApiModule.html" data-type="entity-link" >JobsApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-JobsApiModule-56eb9caa8a64c342dac663e4c52e0a6d5f025949ad96c3a1470412398bfd1ef60a3d8cda737a4c2f78bbb2afe664a6820f8ef5031f7abc52978f806e53935e1a"' : 'data-bs-target="#xs-controllers-links-module-JobsApiModule-56eb9caa8a64c342dac663e4c52e0a6d5f025949ad96c3a1470412398bfd1ef60a3d8cda737a4c2f78bbb2afe664a6820f8ef5031f7abc52978f806e53935e1a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-JobsApiModule-56eb9caa8a64c342dac663e4c52e0a6d5f025949ad96c3a1470412398bfd1ef60a3d8cda737a4c2f78bbb2afe664a6820f8ef5031f7abc52978f806e53935e1a"' :
                                            'id="xs-controllers-links-module-JobsApiModule-56eb9caa8a64c342dac663e4c52e0a6d5f025949ad96c3a1470412398bfd1ef60a3d8cda737a4c2f78bbb2afe664a6820f8ef5031f7abc52978f806e53935e1a"' }>
                                            <li class="link">
                                                <a href="controllers/JobsApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobsApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-JobsApiModule-56eb9caa8a64c342dac663e4c52e0a6d5f025949ad96c3a1470412398bfd1ef60a3d8cda737a4c2f78bbb2afe664a6820f8ef5031f7abc52978f806e53935e1a"' : 'data-bs-target="#xs-injectables-links-module-JobsApiModule-56eb9caa8a64c342dac663e4c52e0a6d5f025949ad96c3a1470412398bfd1ef60a3d8cda737a4c2f78bbb2afe664a6820f8ef5031f7abc52978f806e53935e1a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-JobsApiModule-56eb9caa8a64c342dac663e4c52e0a6d5f025949ad96c3a1470412398bfd1ef60a3d8cda737a4c2f78bbb2afe664a6820f8ef5031f7abc52978f806e53935e1a"' :
                                        'id="xs-injectables-links-module-JobsApiModule-56eb9caa8a64c342dac663e4c52e0a6d5f025949ad96c3a1470412398bfd1ef60a3d8cda737a4c2f78bbb2afe664a6820f8ef5031f7abc52978f806e53935e1a"' }>
                                        <li class="link">
                                            <a href="injectables/JobsApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobsApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/JobsDBModule.html" data-type="entity-link" >JobsDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-JobsDBModule-79b8a9c72275fadb0a79985e204016158b38dcaa15e65d6c2d851bea690788ee7434a0dac94348a5d57f5724b34520612dfe719a13ada23ea8fc04642bfb8693"' : 'data-bs-target="#xs-injectables-links-module-JobsDBModule-79b8a9c72275fadb0a79985e204016158b38dcaa15e65d6c2d851bea690788ee7434a0dac94348a5d57f5724b34520612dfe719a13ada23ea8fc04642bfb8693"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-JobsDBModule-79b8a9c72275fadb0a79985e204016158b38dcaa15e65d6c2d851bea690788ee7434a0dac94348a5d57f5724b34520612dfe719a13ada23ea8fc04642bfb8693"' :
                                        'id="xs-injectables-links-module-JobsDBModule-79b8a9c72275fadb0a79985e204016158b38dcaa15e65d6c2d851bea690788ee7434a0dac94348a5d57f5724b34520612dfe719a13ada23ea8fc04642bfb8693"' }>
                                        <li class="link">
                                            <a href="injectables/BackgroundJobsDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BackgroundJobsDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/BackgroundJobsRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BackgroundJobsRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/JobsModule.html" data-type="entity-link" >JobsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-JobsModule-2f7f1a326e62750a5832345bb36c1e0ade76b05644632b72ca6265d54ee8d8fff9b7366c08530f9da341cc96339df3dd9a8e366ace649105b57e78454a2012e8"' : 'data-bs-target="#xs-injectables-links-module-JobsModule-2f7f1a326e62750a5832345bb36c1e0ade76b05644632b72ca6265d54ee8d8fff9b7366c08530f9da341cc96339df3dd9a8e366ace649105b57e78454a2012e8"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-JobsModule-2f7f1a326e62750a5832345bb36c1e0ade76b05644632b72ca6265d54ee8d8fff9b7366c08530f9da341cc96339df3dd9a8e366ace649105b57e78454a2012e8"' :
                                        'id="xs-injectables-links-module-JobsModule-2f7f1a326e62750a5832345bb36c1e0ade76b05644632b72ca6265d54ee8d8fff9b7366c08530f9da341cc96339df3dd9a8e366ace649105b57e78454a2012e8"' }>
                                        <li class="link">
                                            <a href="injectables/BackgroundJobWorkerJob.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BackgroundJobWorkerJob</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JobHandlerRegistry.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobHandlerRegistry</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ReportExportHandler.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportExportHandler</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LegalApiModule.html" data-type="entity-link" >LegalApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-LegalApiModule-871d0532ccef90c6b5d9882de0bc1e451b836d46cf3a3f90c2600dd01e8f6bf374b5fed114499f64a8b546cd1c8b71cb4535268861555faf4d6fc61beafc125c"' : 'data-bs-target="#xs-controllers-links-module-LegalApiModule-871d0532ccef90c6b5d9882de0bc1e451b836d46cf3a3f90c2600dd01e8f6bf374b5fed114499f64a8b546cd1c8b71cb4535268861555faf4d6fc61beafc125c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-LegalApiModule-871d0532ccef90c6b5d9882de0bc1e451b836d46cf3a3f90c2600dd01e8f6bf374b5fed114499f64a8b546cd1c8b71cb4535268861555faf4d6fc61beafc125c"' :
                                            'id="xs-controllers-links-module-LegalApiModule-871d0532ccef90c6b5d9882de0bc1e451b836d46cf3a3f90c2600dd01e8f6bf374b5fed114499f64a8b546cd1c8b71cb4535268861555faf4d6fc61beafc125c"' }>
                                            <li class="link">
                                                <a href="controllers/LegalApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LegalApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-LegalApiModule-871d0532ccef90c6b5d9882de0bc1e451b836d46cf3a3f90c2600dd01e8f6bf374b5fed114499f64a8b546cd1c8b71cb4535268861555faf4d6fc61beafc125c"' : 'data-bs-target="#xs-injectables-links-module-LegalApiModule-871d0532ccef90c6b5d9882de0bc1e451b836d46cf3a3f90c2600dd01e8f6bf374b5fed114499f64a8b546cd1c8b71cb4535268861555faf4d6fc61beafc125c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-LegalApiModule-871d0532ccef90c6b5d9882de0bc1e451b836d46cf3a3f90c2600dd01e8f6bf374b5fed114499f64a8b546cd1c8b71cb4535268861555faf4d6fc61beafc125c"' :
                                        'id="xs-injectables-links-module-LegalApiModule-871d0532ccef90c6b5d9882de0bc1e451b836d46cf3a3f90c2600dd01e8f6bf374b5fed114499f64a8b546cd1c8b71cb4535268861555faf4d6fc61beafc125c"' }>
                                        <li class="link">
                                            <a href="injectables/LegalApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LegalApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LegalDBModule.html" data-type="entity-link" >LegalDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-LegalDBModule-961aa2ad16318b0176ba0f163c4d66b410486b114524260118e5009b08290c8d8fbc687e1c23201b1248a5c97274e36c748e231633e1fb4828fb09ecc54789ce"' : 'data-bs-target="#xs-injectables-links-module-LegalDBModule-961aa2ad16318b0176ba0f163c4d66b410486b114524260118e5009b08290c8d8fbc687e1c23201b1248a5c97274e36c748e231633e1fb4828fb09ecc54789ce"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-LegalDBModule-961aa2ad16318b0176ba0f163c4d66b410486b114524260118e5009b08290c8d8fbc687e1c23201b1248a5c97274e36c748e231633e1fb4828fb09ecc54789ce"' :
                                        'id="xs-injectables-links-module-LegalDBModule-961aa2ad16318b0176ba0f163c4d66b410486b114524260118e5009b08290c8d8fbc687e1c23201b1248a5c97274e36c748e231633e1fb4828fb09ecc54789ce"' }>
                                        <li class="link">
                                            <a href="injectables/DataRetentionDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataRetentionDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LegalDocumentsDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LegalDocumentsDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserConsentsDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserConsentsDBService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/M2mApiModule.html" data-type="entity-link" >M2mApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-M2mApiModule-fe925a7a3b396918d2e0936eab6babe029af90ddb00e742b0e967c4ec07f56731482279468f394eff4a0724572daffe494a78d63da8d7ba8c3026c7f18d55657"' : 'data-bs-target="#xs-controllers-links-module-M2mApiModule-fe925a7a3b396918d2e0936eab6babe029af90ddb00e742b0e967c4ec07f56731482279468f394eff4a0724572daffe494a78d63da8d7ba8c3026c7f18d55657"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-M2mApiModule-fe925a7a3b396918d2e0936eab6babe029af90ddb00e742b0e967c4ec07f56731482279468f394eff4a0724572daffe494a78d63da8d7ba8c3026c7f18d55657"' :
                                            'id="xs-controllers-links-module-M2mApiModule-fe925a7a3b396918d2e0936eab6babe029af90ddb00e742b0e967c4ec07f56731482279468f394eff4a0724572daffe494a78d63da8d7ba8c3026c7f18d55657"' }>
                                            <li class="link">
                                                <a href="controllers/M2mDemoController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >M2mDemoController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/MessageDBModule.html" data-type="entity-link" >MessageDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MessageDBModule-a0eaee2b331003a783afd89e607757e11268e2f4d94bdd556d2db05df49c0fbbbf354616f7cd1f2fedcf9f8d4f8acf0e37a62c82cf3e1c1992e79100681d3e6a"' : 'data-bs-target="#xs-injectables-links-module-MessageDBModule-a0eaee2b331003a783afd89e607757e11268e2f4d94bdd556d2db05df49c0fbbbf354616f7cd1f2fedcf9f8d4f8acf0e37a62c82cf3e1c1992e79100681d3e6a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MessageDBModule-a0eaee2b331003a783afd89e607757e11268e2f4d94bdd556d2db05df49c0fbbbf354616f7cd1f2fedcf9f8d4f8acf0e37a62c82cf3e1c1992e79100681d3e6a"' :
                                        'id="xs-injectables-links-module-MessageDBModule-a0eaee2b331003a783afd89e607757e11268e2f4d94bdd556d2db05df49c0fbbbf354616f7cd1f2fedcf9f8d4f8acf0e37a62c82cf3e1c1992e79100681d3e6a"' }>
                                        <li class="link">
                                            <a href="injectables/MessageContentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessageContentService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MessageDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessageDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MessagePurgeJob.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessagePurgeJob</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MessagesApiModule.html" data-type="entity-link" >MessagesApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-MessagesApiModule-d926f7de96a5642c5ba3b4348fc1913d760bc9db7c9001d698f1ae8588993ac596d5d3399692f54f84152946a5bfe5b96c4d54ccca2f121df3efaf9c33208210"' : 'data-bs-target="#xs-controllers-links-module-MessagesApiModule-d926f7de96a5642c5ba3b4348fc1913d760bc9db7c9001d698f1ae8588993ac596d5d3399692f54f84152946a5bfe5b96c4d54ccca2f121df3efaf9c33208210"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-MessagesApiModule-d926f7de96a5642c5ba3b4348fc1913d760bc9db7c9001d698f1ae8588993ac596d5d3399692f54f84152946a5bfe5b96c4d54ccca2f121df3efaf9c33208210"' :
                                            'id="xs-controllers-links-module-MessagesApiModule-d926f7de96a5642c5ba3b4348fc1913d760bc9db7c9001d698f1ae8588993ac596d5d3399692f54f84152946a5bfe5b96c4d54ccca2f121df3efaf9c33208210"' }>
                                            <li class="link">
                                                <a href="controllers/MessagesApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessagesApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MessagesApiModule-d926f7de96a5642c5ba3b4348fc1913d760bc9db7c9001d698f1ae8588993ac596d5d3399692f54f84152946a5bfe5b96c4d54ccca2f121df3efaf9c33208210"' : 'data-bs-target="#xs-injectables-links-module-MessagesApiModule-d926f7de96a5642c5ba3b4348fc1913d760bc9db7c9001d698f1ae8588993ac596d5d3399692f54f84152946a5bfe5b96c4d54ccca2f121df3efaf9c33208210"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MessagesApiModule-d926f7de96a5642c5ba3b4348fc1913d760bc9db7c9001d698f1ae8588993ac596d5d3399692f54f84152946a5bfe5b96c4d54ccca2f121df3efaf9c33208210"' :
                                        'id="xs-injectables-links-module-MessagesApiModule-d926f7de96a5642c5ba3b4348fc1913d760bc9db7c9001d698f1ae8588993ac596d5d3399692f54f84152946a5bfe5b96c4d54ccca2f121df3efaf9c33208210"' }>
                                        <li class="link">
                                            <a href="injectables/MessagesApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessagesApiService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SmsDeliveryPollJob.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmsDeliveryPollJob</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MessagingModule.html" data-type="entity-link" >MessagingModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MessagingModule-f1c8ead44871c27c75c9ab0dd64fc1c646bf5e6dcffbed86bb708876c4f6242ae4922487cd7f6bbb0554a48a8b1a6879c7c95754652896665b77b173ff4b7421"' : 'data-bs-target="#xs-injectables-links-module-MessagingModule-f1c8ead44871c27c75c9ab0dd64fc1c646bf5e6dcffbed86bb708876c4f6242ae4922487cd7f6bbb0554a48a8b1a6879c7c95754652896665b77b173ff4b7421"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MessagingModule-f1c8ead44871c27c75c9ab0dd64fc1c646bf5e6dcffbed86bb708876c4f6242ae4922487cd7f6bbb0554a48a8b1a6879c7c95754652896665b77b173ff4b7421"' :
                                        'id="xs-injectables-links-module-MessagingModule-f1c8ead44871c27c75c9ab0dd64fc1c646bf5e6dcffbed86bb708876c4f6242ae4922487cd7f6bbb0554a48a8b1a6879c7c95754652896665b77b173ff4b7421"' }>
                                        <li class="link">
                                            <a href="injectables/MessageDispatcherService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessageDispatcherService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MongoModule.html" data-type="entity-link" >MongoModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/NonceModule.html" data-type="entity-link" >NonceModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NonceModule-e1072d8af6207dba9a2563c84a9a8c8600f091aaed897b1c2dc5d2ea48fef9aeebb63f1b7c1d977b9b1bed54a8e8cb61be0aa5cca3cbdad0a30c99f54597c5ff"' : 'data-bs-target="#xs-injectables-links-module-NonceModule-e1072d8af6207dba9a2563c84a9a8c8600f091aaed897b1c2dc5d2ea48fef9aeebb63f1b7c1d977b9b1bed54a8e8cb61be0aa5cca3cbdad0a30c99f54597c5ff"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NonceModule-e1072d8af6207dba9a2563c84a9a8c8600f091aaed897b1c2dc5d2ea48fef9aeebb63f1b7c1d977b9b1bed54a8e8cb61be0aa5cca3cbdad0a30c99f54597c5ff"' :
                                        'id="xs-injectables-links-module-NonceModule-e1072d8af6207dba9a2563c84a9a8c8600f091aaed897b1c2dc5d2ea48fef9aeebb63f1b7c1d977b9b1bed54a8e8cb61be0aa5cca3cbdad0a30c99f54597c5ff"' }>
                                        <li class="link">
                                            <a href="injectables/NonceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NonceService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationsApiModule.html" data-type="entity-link" >NotificationsApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-NotificationsApiModule-08bd6b94f13550945a4ae0cc160fe2354b09eab64ce8c9cebc7701b11df6172f8d4fd34463daa56b82652d692fff1ccbd7f8694d4653adbba0e48b5ea44372a1"' : 'data-bs-target="#xs-controllers-links-module-NotificationsApiModule-08bd6b94f13550945a4ae0cc160fe2354b09eab64ce8c9cebc7701b11df6172f8d4fd34463daa56b82652d692fff1ccbd7f8694d4653adbba0e48b5ea44372a1"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-NotificationsApiModule-08bd6b94f13550945a4ae0cc160fe2354b09eab64ce8c9cebc7701b11df6172f8d4fd34463daa56b82652d692fff1ccbd7f8694d4653adbba0e48b5ea44372a1"' :
                                            'id="xs-controllers-links-module-NotificationsApiModule-08bd6b94f13550945a4ae0cc160fe2354b09eab64ce8c9cebc7701b11df6172f8d4fd34463daa56b82652d692fff1ccbd7f8694d4653adbba0e48b5ea44372a1"' }>
                                            <li class="link">
                                                <a href="controllers/NotificationsApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationsApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NotificationsApiModule-08bd6b94f13550945a4ae0cc160fe2354b09eab64ce8c9cebc7701b11df6172f8d4fd34463daa56b82652d692fff1ccbd7f8694d4653adbba0e48b5ea44372a1"' : 'data-bs-target="#xs-injectables-links-module-NotificationsApiModule-08bd6b94f13550945a4ae0cc160fe2354b09eab64ce8c9cebc7701b11df6172f8d4fd34463daa56b82652d692fff1ccbd7f8694d4653adbba0e48b5ea44372a1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NotificationsApiModule-08bd6b94f13550945a4ae0cc160fe2354b09eab64ce8c9cebc7701b11df6172f8d4fd34463daa56b82652d692fff1ccbd7f8694d4653adbba0e48b5ea44372a1"' :
                                        'id="xs-injectables-links-module-NotificationsApiModule-08bd6b94f13550945a4ae0cc160fe2354b09eab64ce8c9cebc7701b11df6172f8d4fd34463daa56b82652d692fff1ccbd7f8694d4653adbba0e48b5ea44372a1"' }>
                                        <li class="link">
                                            <a href="injectables/NotificationsApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationsApiService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OrderNotificationsListener.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderNotificationsListener</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationsModule.html" data-type="entity-link" >NotificationsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NotificationsModule-bdceecabb1086e9c7616b233c186783ac454656b426292f0c28840a710fafed009c1ec8502cd2598ab4c0349729e62e217e24980af676918e8682aa9045c3f6a"' : 'data-bs-target="#xs-injectables-links-module-NotificationsModule-bdceecabb1086e9c7616b233c186783ac454656b426292f0c28840a710fafed009c1ec8502cd2598ab4c0349729e62e217e24980af676918e8682aa9045c3f6a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NotificationsModule-bdceecabb1086e9c7616b233c186783ac454656b426292f0c28840a710fafed009c1ec8502cd2598ab4c0349729e62e217e24980af676918e8682aa9045c3f6a"' :
                                        'id="xs-injectables-links-module-NotificationsModule-bdceecabb1086e9c7616b233c186783ac454656b426292f0c28840a710fafed009c1ec8502cd2598ab4c0349729e62e217e24980af676918e8682aa9045c3f6a"' }>
                                        <li class="link">
                                            <a href="injectables/FcmPushProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FcmPushProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NoopPushProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NoopPushProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NotificationInboxDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationInboxDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NotificationsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PushProviderRegistry.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PushProviderRegistry</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PushSubscriptionsDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PushSubscriptionsDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/WebPushProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WebPushProvider</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ObservabilityModule.html" data-type="entity-link" >ObservabilityModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ObservabilityModule-18f9ff7b337e0fdb781d44b820f091846c09f701be328bacd5aaf0ccc405edd173d897f7c0e582747d1cb59e1c60f03e432a66114b8f48ba6c3eaec58ac3ac44"' : 'data-bs-target="#xs-injectables-links-module-ObservabilityModule-18f9ff7b337e0fdb781d44b820f091846c09f701be328bacd5aaf0ccc405edd173d897f7c0e582747d1cb59e1c60f03e432a66114b8f48ba6c3eaec58ac3ac44"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ObservabilityModule-18f9ff7b337e0fdb781d44b820f091846c09f701be328bacd5aaf0ccc405edd173d897f7c0e582747d1cb59e1c60f03e432a66114b8f48ba6c3eaec58ac3ac44"' :
                                        'id="xs-injectables-links-module-ObservabilityModule-18f9ff7b337e0fdb781d44b820f091846c09f701be328bacd5aaf0ccc405edd173d897f7c0e582747d1cb59e1c60f03e432a66114b8f48ba6c3eaec58ac3ac44"' }>
                                        <li class="link">
                                            <a href="injectables/SentryReporterService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SentryReporterService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OnboardingApiModule.html" data-type="entity-link" >OnboardingApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OnboardingApiModule-4d6dde80797ec9644877bd3977be54a932f2eb350ab07194f637eaf908443799688e03b8e76e3807ed0c6a23630084c25f1aefccf3d137ecc8bc10a94e372d15"' : 'data-bs-target="#xs-controllers-links-module-OnboardingApiModule-4d6dde80797ec9644877bd3977be54a932f2eb350ab07194f637eaf908443799688e03b8e76e3807ed0c6a23630084c25f1aefccf3d137ecc8bc10a94e372d15"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OnboardingApiModule-4d6dde80797ec9644877bd3977be54a932f2eb350ab07194f637eaf908443799688e03b8e76e3807ed0c6a23630084c25f1aefccf3d137ecc8bc10a94e372d15"' :
                                            'id="xs-controllers-links-module-OnboardingApiModule-4d6dde80797ec9644877bd3977be54a932f2eb350ab07194f637eaf908443799688e03b8e76e3807ed0c6a23630084c25f1aefccf3d137ecc8bc10a94e372d15"' }>
                                            <li class="link">
                                                <a href="controllers/OnboardingController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OnboardingController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OnboardingApiModule-4d6dde80797ec9644877bd3977be54a932f2eb350ab07194f637eaf908443799688e03b8e76e3807ed0c6a23630084c25f1aefccf3d137ecc8bc10a94e372d15"' : 'data-bs-target="#xs-injectables-links-module-OnboardingApiModule-4d6dde80797ec9644877bd3977be54a932f2eb350ab07194f637eaf908443799688e03b8e76e3807ed0c6a23630084c25f1aefccf3d137ecc8bc10a94e372d15"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OnboardingApiModule-4d6dde80797ec9644877bd3977be54a932f2eb350ab07194f637eaf908443799688e03b8e76e3807ed0c6a23630084c25f1aefccf3d137ecc8bc10a94e372d15"' :
                                        'id="xs-injectables-links-module-OnboardingApiModule-4d6dde80797ec9644877bd3977be54a932f2eb350ab07194f637eaf908443799688e03b8e76e3807ed0c6a23630084c25f1aefccf3d137ecc8bc10a94e372d15"' }>
                                        <li class="link">
                                            <a href="injectables/OnboardingApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OnboardingApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OnboardingModule.html" data-type="entity-link" >OnboardingModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OnboardingModule-1af305bd3ff6836839f40c7fd7e506f23cfdeb054b818395d38af92de49b3290c89e1d05c3252a14b5b4527a5196c23c99a686bc09eb1c6f161b8325e180e98a"' : 'data-bs-target="#xs-injectables-links-module-OnboardingModule-1af305bd3ff6836839f40c7fd7e506f23cfdeb054b818395d38af92de49b3290c89e1d05c3252a14b5b4527a5196c23c99a686bc09eb1c6f161b8325e180e98a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OnboardingModule-1af305bd3ff6836839f40c7fd7e506f23cfdeb054b818395d38af92de49b3290c89e1d05c3252a14b5b4527a5196c23c99a686bc09eb1c6f161b8325e180e98a"' :
                                        'id="xs-injectables-links-module-OnboardingModule-1af305bd3ff6836839f40c7fd7e506f23cfdeb054b818395d38af92de49b3290c89e1d05c3252a14b5b4527a5196c23c99a686bc09eb1c6f161b8325e180e98a"' }>
                                        <li class="link">
                                            <a href="injectables/OnboardingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OnboardingService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OrdersApiModule.html" data-type="entity-link" >OrdersApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OrdersApiModule-5c126941e3a79c894853972d4f2bdfa4dbae4768d7dbd05ac3ff5804bfe69eafc9f0e641e753fbf410812dba20ad9cd1b8e158705c9f0475d007afe3d4588ddb"' : 'data-bs-target="#xs-controllers-links-module-OrdersApiModule-5c126941e3a79c894853972d4f2bdfa4dbae4768d7dbd05ac3ff5804bfe69eafc9f0e641e753fbf410812dba20ad9cd1b8e158705c9f0475d007afe3d4588ddb"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OrdersApiModule-5c126941e3a79c894853972d4f2bdfa4dbae4768d7dbd05ac3ff5804bfe69eafc9f0e641e753fbf410812dba20ad9cd1b8e158705c9f0475d007afe3d4588ddb"' :
                                            'id="xs-controllers-links-module-OrdersApiModule-5c126941e3a79c894853972d4f2bdfa4dbae4768d7dbd05ac3ff5804bfe69eafc9f0e641e753fbf410812dba20ad9cd1b8e158705c9f0475d007afe3d4588ddb"' }>
                                            <li class="link">
                                                <a href="controllers/OrdersApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OrdersApiModule-5c126941e3a79c894853972d4f2bdfa4dbae4768d7dbd05ac3ff5804bfe69eafc9f0e641e753fbf410812dba20ad9cd1b8e158705c9f0475d007afe3d4588ddb"' : 'data-bs-target="#xs-injectables-links-module-OrdersApiModule-5c126941e3a79c894853972d4f2bdfa4dbae4768d7dbd05ac3ff5804bfe69eafc9f0e641e753fbf410812dba20ad9cd1b8e158705c9f0475d007afe3d4588ddb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OrdersApiModule-5c126941e3a79c894853972d4f2bdfa4dbae4768d7dbd05ac3ff5804bfe69eafc9f0e641e753fbf410812dba20ad9cd1b8e158705c9f0475d007afe3d4588ddb"' :
                                        'id="xs-injectables-links-module-OrdersApiModule-5c126941e3a79c894853972d4f2bdfa4dbae4768d7dbd05ac3ff5804bfe69eafc9f0e641e753fbf410812dba20ad9cd1b8e158705c9f0475d007afe3d4588ddb"' }>
                                        <li class="link">
                                            <a href="injectables/OrdersApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OrdersDBModule.html" data-type="entity-link" >OrdersDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OrdersDBModule-21923d4254aa3b018e1832d23ddec239805aa59922337bb1901ff1ee28b72f92cf3a43d9e1bbf137bdccd1f3f4a0b47f843fc24772dfc68c25bd59c07f5e9a3d"' : 'data-bs-target="#xs-injectables-links-module-OrdersDBModule-21923d4254aa3b018e1832d23ddec239805aa59922337bb1901ff1ee28b72f92cf3a43d9e1bbf137bdccd1f3f4a0b47f843fc24772dfc68c25bd59c07f5e9a3d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OrdersDBModule-21923d4254aa3b018e1832d23ddec239805aa59922337bb1901ff1ee28b72f92cf3a43d9e1bbf137bdccd1f3f4a0b47f843fc24772dfc68c25bd59c07f5e9a3d"' :
                                        'id="xs-injectables-links-module-OrdersDBModule-21923d4254aa3b018e1832d23ddec239805aa59922337bb1901ff1ee28b72f92cf3a43d9e1bbf137bdccd1f3f4a0b47f843fc24772dfc68c25bd59c07f5e9a3d"' }>
                                        <li class="link">
                                            <a href="injectables/FeeCalculator.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FeeCalculator</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OrdersDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OrdersRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RateLimitModule.html" data-type="entity-link" >RateLimitModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RateLimitModule-1d20f8d5d7d12b2c75b289ab609cb1949f20fedaff928c3538621e5ba53f58a704934bf8eb1be1b98e9b0c8f3bd7ea471c0ef9564cd00e1af56e58aecfa98614"' : 'data-bs-target="#xs-injectables-links-module-RateLimitModule-1d20f8d5d7d12b2c75b289ab609cb1949f20fedaff928c3538621e5ba53f58a704934bf8eb1be1b98e9b0c8f3bd7ea471c0ef9564cd00e1af56e58aecfa98614"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RateLimitModule-1d20f8d5d7d12b2c75b289ab609cb1949f20fedaff928c3538621e5ba53f58a704934bf8eb1be1b98e9b0c8f3bd7ea471c0ef9564cd00e1af56e58aecfa98614"' :
                                        'id="xs-injectables-links-module-RateLimitModule-1d20f8d5d7d12b2c75b289ab609cb1949f20fedaff928c3538621e5ba53f58a704934bf8eb1be1b98e9b0c8f3bd7ea471c0ef9564cd00e1af56e58aecfa98614"' }>
                                        <li class="link">
                                            <a href="injectables/AppThrottlerGuard.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppThrottlerGuard</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RealtimeModule.html" data-type="entity-link" >RealtimeModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RealtimeModule-76daafa5458c26bd7fae3782c51a61e53c14745c76216748bc67f57fbaeaea433e14b63ffe0b4d279e4eb4a25346d21379d00e2122458d7319d0c8b4c226f77f"' : 'data-bs-target="#xs-injectables-links-module-RealtimeModule-76daafa5458c26bd7fae3782c51a61e53c14745c76216748bc67f57fbaeaea433e14b63ffe0b4d279e4eb4a25346d21379d00e2122458d7319d0c8b4c226f77f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RealtimeModule-76daafa5458c26bd7fae3782c51a61e53c14745c76216748bc67f57fbaeaea433e14b63ffe0b4d279e4eb4a25346d21379d00e2122458d7319d0c8b4c226f77f"' :
                                        'id="xs-injectables-links-module-RealtimeModule-76daafa5458c26bd7fae3782c51a61e53c14745c76216748bc67f57fbaeaea433e14b63ffe0b4d279e4eb4a25346d21379d00e2122458d7319d0c8b4c226f77f"' }>
                                        <li class="link">
                                            <a href="injectables/RealtimeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RealtimeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/WsAuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WsAuthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RedisModule.html" data-type="entity-link" >RedisModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RedisModule-eece110db7a25f1bba89b28f6322dacba5020799b75aa1b7ed0bf4b7013aaf6f86e6336e244425eb33c7f7dd980d5c248f557f5639621e3f52f62203e07d754b"' : 'data-bs-target="#xs-injectables-links-module-RedisModule-eece110db7a25f1bba89b28f6322dacba5020799b75aa1b7ed0bf4b7013aaf6f86e6336e244425eb33c7f7dd980d5c248f557f5639621e3f52f62203e07d754b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RedisModule-eece110db7a25f1bba89b28f6322dacba5020799b75aa1b7ed0bf4b7013aaf6f86e6336e244425eb33c7f7dd980d5c248f557f5639621e3f52f62203e07d754b"' :
                                        'id="xs-injectables-links-module-RedisModule-eece110db7a25f1bba89b28f6322dacba5020799b75aa1b7ed0bf4b7013aaf6f86e6336e244425eb33c7f7dd980d5c248f557f5639621e3f52f62203e07d754b"' }>
                                        <li class="link">
                                            <a href="injectables/RedisHealthIndicator.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RedisHealthIndicator</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RedisService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RedisService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ReportModule.html" data-type="entity-link" >ReportModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ReportModule-d9afb360222ea3fc25350ba34aec88904e4c439c1551eb3d2c153aaf3ab450a2456af1c4638a57879fdcccf96ed46b46cfbd03cbd1d29cc68cdc43e386eed606"' : 'data-bs-target="#xs-injectables-links-module-ReportModule-d9afb360222ea3fc25350ba34aec88904e4c439c1551eb3d2c153aaf3ab450a2456af1c4638a57879fdcccf96ed46b46cfbd03cbd1d29cc68cdc43e386eed606"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ReportModule-d9afb360222ea3fc25350ba34aec88904e4c439c1551eb3d2c153aaf3ab450a2456af1c4638a57879fdcccf96ed46b46cfbd03cbd1d29cc68cdc43e386eed606"' :
                                        'id="xs-injectables-links-module-ReportModule-d9afb360222ea3fc25350ba34aec88904e4c439c1551eb3d2c153aaf3ab450a2456af1c4638a57879fdcccf96ed46b46cfbd03cbd1d29cc68cdc43e386eed606"' }>
                                        <li class="link">
                                            <a href="injectables/ReportService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RolesApiModule.html" data-type="entity-link" >RolesApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-RolesApiModule-ca7bf983245177a649af4574f8175f93ab20238ecbd26caafdfdbf05b310874ce7fb7662536466a223087c45de42249ae332d4dbbcc7db448eaf5ea916d52690"' : 'data-bs-target="#xs-controllers-links-module-RolesApiModule-ca7bf983245177a649af4574f8175f93ab20238ecbd26caafdfdbf05b310874ce7fb7662536466a223087c45de42249ae332d4dbbcc7db448eaf5ea916d52690"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RolesApiModule-ca7bf983245177a649af4574f8175f93ab20238ecbd26caafdfdbf05b310874ce7fb7662536466a223087c45de42249ae332d4dbbcc7db448eaf5ea916d52690"' :
                                            'id="xs-controllers-links-module-RolesApiModule-ca7bf983245177a649af4574f8175f93ab20238ecbd26caafdfdbf05b310874ce7fb7662536466a223087c45de42249ae332d4dbbcc7db448eaf5ea916d52690"' }>
                                            <li class="link">
                                                <a href="controllers/RolesApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesApiController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/UsersRolesApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersRolesApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RolesApiModule-ca7bf983245177a649af4574f8175f93ab20238ecbd26caafdfdbf05b310874ce7fb7662536466a223087c45de42249ae332d4dbbcc7db448eaf5ea916d52690"' : 'data-bs-target="#xs-injectables-links-module-RolesApiModule-ca7bf983245177a649af4574f8175f93ab20238ecbd26caafdfdbf05b310874ce7fb7662536466a223087c45de42249ae332d4dbbcc7db448eaf5ea916d52690"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RolesApiModule-ca7bf983245177a649af4574f8175f93ab20238ecbd26caafdfdbf05b310874ce7fb7662536466a223087c45de42249ae332d4dbbcc7db448eaf5ea916d52690"' :
                                        'id="xs-injectables-links-module-RolesApiModule-ca7bf983245177a649af4574f8175f93ab20238ecbd26caafdfdbf05b310874ce7fb7662536466a223087c45de42249ae332d4dbbcc7db448eaf5ea916d52690"' }>
                                        <li class="link">
                                            <a href="injectables/RolesApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesApiService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RolesPermissionsMapper.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesPermissionsMapper</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RolesPermissionDBModule.html" data-type="entity-link" >RolesPermissionDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RolesPermissionDBModule-706bb25454bfd0eb5f278af7e194ff2b4f4f1f9c9f8509121e615acfe90ac1c9509d47b958217688ba9081ba8818c4c4f90eddcb91a8185683d02c830de6ea83"' : 'data-bs-target="#xs-injectables-links-module-RolesPermissionDBModule-706bb25454bfd0eb5f278af7e194ff2b4f4f1f9c9f8509121e615acfe90ac1c9509d47b958217688ba9081ba8818c4c4f90eddcb91a8185683d02c830de6ea83"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RolesPermissionDBModule-706bb25454bfd0eb5f278af7e194ff2b4f4f1f9c9f8509121e615acfe90ac1c9509d47b958217688ba9081ba8818c4c4f90eddcb91a8185683d02c830de6ea83"' :
                                        'id="xs-injectables-links-module-RolesPermissionDBModule-706bb25454bfd0eb5f278af7e194ff2b4f4f1f9c9f8509121e615acfe90ac1c9509d47b958217688ba9081ba8818c4c4f90eddcb91a8185683d02c830de6ea83"' }>
                                        <li class="link">
                                            <a href="injectables/PermissionsDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionsDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RolePermissionsDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolePermissionsDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RolesDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserPermissionsDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserPermissionsDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserRolesDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserRolesDBService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SchedulerModule.html" data-type="entity-link" >SchedulerModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SchedulerModule-fdd6d3e10e46df28f5b5ff1152cb67236daad92f498c5e05ee2fe5d0dbf0bd0d2a7d4adaaa203e2e4a6fd9b3c793a1d08e546c5e190ad261dd401119bb465fdb"' : 'data-bs-target="#xs-injectables-links-module-SchedulerModule-fdd6d3e10e46df28f5b5ff1152cb67236daad92f498c5e05ee2fe5d0dbf0bd0d2a7d4adaaa203e2e4a6fd9b3c793a1d08e546c5e190ad261dd401119bb465fdb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SchedulerModule-fdd6d3e10e46df28f5b5ff1152cb67236daad92f498c5e05ee2fe5d0dbf0bd0d2a7d4adaaa203e2e4a6fd9b3c793a1d08e546c5e190ad261dd401119bb465fdb"' :
                                        'id="xs-injectables-links-module-SchedulerModule-fdd6d3e10e46df28f5b5ff1152cb67236daad92f498c5e05ee2fe5d0dbf0bd0d2a7d4adaaa203e2e4a6fd9b3c793a1d08e546c5e190ad261dd401119bb465fdb"' }>
                                        <li class="link">
                                            <a href="injectables/JobSchedulerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobSchedulerService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SmsModule.html" data-type="entity-link" >SmsModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/StorageApiModule.html" data-type="entity-link" >StorageApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-StorageApiModule-0d82ab99577a5caa99a642e15af00efae6ffa060581d04b2d91adb392c36d2c50e35f4f7489a4d4fa506fbd470e1434c628d275ee01557beb1c82093ff0f5728"' : 'data-bs-target="#xs-controllers-links-module-StorageApiModule-0d82ab99577a5caa99a642e15af00efae6ffa060581d04b2d91adb392c36d2c50e35f4f7489a4d4fa506fbd470e1434c628d275ee01557beb1c82093ff0f5728"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-StorageApiModule-0d82ab99577a5caa99a642e15af00efae6ffa060581d04b2d91adb392c36d2c50e35f4f7489a4d4fa506fbd470e1434c628d275ee01557beb1c82093ff0f5728"' :
                                            'id="xs-controllers-links-module-StorageApiModule-0d82ab99577a5caa99a642e15af00efae6ffa060581d04b2d91adb392c36d2c50e35f4f7489a4d4fa506fbd470e1434c628d275ee01557beb1c82093ff0f5728"' }>
                                            <li class="link">
                                                <a href="controllers/StorageController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorageController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StorageApiModule-0d82ab99577a5caa99a642e15af00efae6ffa060581d04b2d91adb392c36d2c50e35f4f7489a4d4fa506fbd470e1434c628d275ee01557beb1c82093ff0f5728"' : 'data-bs-target="#xs-injectables-links-module-StorageApiModule-0d82ab99577a5caa99a642e15af00efae6ffa060581d04b2d91adb392c36d2c50e35f4f7489a4d4fa506fbd470e1434c628d275ee01557beb1c82093ff0f5728"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StorageApiModule-0d82ab99577a5caa99a642e15af00efae6ffa060581d04b2d91adb392c36d2c50e35f4f7489a4d4fa506fbd470e1434c628d275ee01557beb1c82093ff0f5728"' :
                                        'id="xs-injectables-links-module-StorageApiModule-0d82ab99577a5caa99a642e15af00efae6ffa060581d04b2d91adb392c36d2c50e35f4f7489a4d4fa506fbd470e1434c628d275ee01557beb1c82093ff0f5728"' }>
                                        <li class="link">
                                            <a href="injectables/StorageApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorageApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StorageModule.html" data-type="entity-link" >StorageModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StorageModule-cbdf35122c15afa21f5959df347f21f9c4cae165ba17b6472e6bbacc3edfb9a348586f929d55afcf35a351f938ecb7fc9246e785099af6b4f5c1d472b571003f"' : 'data-bs-target="#xs-injectables-links-module-StorageModule-cbdf35122c15afa21f5959df347f21f9c4cae165ba17b6472e6bbacc3edfb9a348586f929d55afcf35a351f938ecb7fc9246e785099af6b4f5c1d472b571003f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StorageModule-cbdf35122c15afa21f5959df347f21f9c4cae165ba17b6472e6bbacc3edfb9a348586f929d55afcf35a351f938ecb7fc9246e785099af6b4f5c1d472b571003f"' :
                                        'id="xs-injectables-links-module-StorageModule-cbdf35122c15afa21f5959df347f21f9c4cae165ba17b6472e6bbacc3edfb9a348586f929d55afcf35a351f938ecb7fc9246e785099af6b4f5c1d472b571003f"' }>
                                        <li class="link">
                                            <a href="injectables/StorageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorageService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersApiModule.html" data-type="entity-link" >UsersApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersApiModule-47544caad4bb880f5dbc0837c03793f6fc9ff7366b5f556242f2a70d897e7ddf43fc5f7f93bd02cf280adc1a63bfc993d6ca0acb0fa9e5c4f5decd831a8b9eab"' : 'data-bs-target="#xs-controllers-links-module-UsersApiModule-47544caad4bb880f5dbc0837c03793f6fc9ff7366b5f556242f2a70d897e7ddf43fc5f7f93bd02cf280adc1a63bfc993d6ca0acb0fa9e5c4f5decd831a8b9eab"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersApiModule-47544caad4bb880f5dbc0837c03793f6fc9ff7366b5f556242f2a70d897e7ddf43fc5f7f93bd02cf280adc1a63bfc993d6ca0acb0fa9e5c4f5decd831a8b9eab"' :
                                            'id="xs-controllers-links-module-UsersApiModule-47544caad4bb880f5dbc0837c03793f6fc9ff7366b5f556242f2a70d897e7ddf43fc5f7f93bd02cf280adc1a63bfc993d6ca0acb0fa9e5c4f5decd831a8b9eab"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersApiModule-47544caad4bb880f5dbc0837c03793f6fc9ff7366b5f556242f2a70d897e7ddf43fc5f7f93bd02cf280adc1a63bfc993d6ca0acb0fa9e5c4f5decd831a8b9eab"' : 'data-bs-target="#xs-injectables-links-module-UsersApiModule-47544caad4bb880f5dbc0837c03793f6fc9ff7366b5f556242f2a70d897e7ddf43fc5f7f93bd02cf280adc1a63bfc993d6ca0acb0fa9e5c4f5decd831a8b9eab"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersApiModule-47544caad4bb880f5dbc0837c03793f6fc9ff7366b5f556242f2a70d897e7ddf43fc5f7f93bd02cf280adc1a63bfc993d6ca0acb0fa9e5c4f5decd831a8b9eab"' :
                                        'id="xs-injectables-links-module-UsersApiModule-47544caad4bb880f5dbc0837c03793f6fc9ff7366b5f556242f2a70d897e7ddf43fc5f7f93bd02cf280adc1a63bfc993d6ca0acb0fa9e5c4f5decd831a8b9eab"' }>
                                        <li class="link">
                                            <a href="injectables/UserRolesDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserRolesDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersDBModule.html" data-type="entity-link" >UsersDBModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersDBModule-728343a2575b906a7be605bdfb1ff96127b686c6d518e6639f523d5bfca7df3163d0938c577660b234be2923d3459b15db46a113d3f259af0914e62ff42b058d"' : 'data-bs-target="#xs-injectables-links-module-UsersDBModule-728343a2575b906a7be605bdfb1ff96127b686c6d518e6639f523d5bfca7df3163d0938c577660b234be2923d3459b15db46a113d3f259af0914e62ff42b058d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersDBModule-728343a2575b906a7be605bdfb1ff96127b686c6d518e6639f523d5bfca7df3163d0938c577660b234be2923d3459b15db46a113d3f259af0914e62ff42b058d"' :
                                        'id="xs-injectables-links-module-UsersDBModule-728343a2575b906a7be605bdfb1ff96127b686c6d518e6639f523d5bfca7df3163d0938c577660b234be2923d3459b15db46a113d3f259af0914e62ff42b058d"' }>
                                        <li class="link">
                                            <a href="injectables/UserRolesDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserRolesDBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersDBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersDBService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AccountApiController.html" data-type="entity-link" >AccountApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ActivityLogsApiController.html" data-type="entity-link" >ActivityLogsApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AiDisclosureApiController.html" data-type="entity-link" >AiDisclosureApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ApiClientsApiController.html" data-type="entity-link" >ApiClientsApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuditLogsApiController.html" data-type="entity-link" >AuditLogsApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthApiController.html" data-type="entity-link" >AuthApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/CatalogOrmApiController.html" data-type="entity-link" >CatalogOrmApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/CatalogRawApiController.html" data-type="entity-link" >CatalogRawApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ExampleApiController.html" data-type="entity-link" >ExampleApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/HealthController.html" data-type="entity-link" >HealthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/JobsApiController.html" data-type="entity-link" >JobsApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/LegalApiController.html" data-type="entity-link" >LegalApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/M2mDemoController.html" data-type="entity-link" >M2mDemoController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/MessagesApiController.html" data-type="entity-link" >MessagesApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/NotificationsApiController.html" data-type="entity-link" >NotificationsApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/OnboardingController.html" data-type="entity-link" >OnboardingController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/OrdersApiController.html" data-type="entity-link" >OrdersApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/RolesApiController.html" data-type="entity-link" >RolesApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/StorageController.html" data-type="entity-link" >StorageController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UsersController.html" data-type="entity-link" >UsersController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UsersRolesApiController.html" data-type="entity-link" >UsersRolesApiController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AcceptConsentRequestDTO.html" data-type="entity-link" >AcceptConsentRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActivityLog.html" data-type="entity-link" >ActivityLog</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActivityLogResponseDTO.html" data-type="entity-link" >ActivityLogResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActivityLogsListResponseDTO.html" data-type="entity-link" >ActivityLogsListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AffectedRowsResponseDTO.html" data-type="entity-link" >AffectedRowsResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AiDisclosureResponseDTO.html" data-type="entity-link" >AiDisclosureResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AllExceptionsFilter.html" data-type="entity-link" >AllExceptionsFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/ApiClientResponseDTO.html" data-type="entity-link" >ApiClientResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ApiClientsDBHelper.html" data-type="entity-link" >ApiClientsDBHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/ApiClientsListResponseDTO.html" data-type="entity-link" >ApiClientsListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ApiClientWithSecretsResponseDTO.html" data-type="entity-link" >ApiClientWithSecretsResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ApiKeyHeaderStrategy.html" data-type="entity-link" >ApiKeyHeaderStrategy</a>
                            </li>
                            <li class="link">
                                <a href="classes/AssignedPermissionDTO.html" data-type="entity-link" >AssignedPermissionDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AssignedPermissionDTO-1.html" data-type="entity-link" >AssignedPermissionDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AssignedRoleDTO.html" data-type="entity-link" >AssignedRoleDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AssignPermissionsToRoleRequestDTO.html" data-type="entity-link" >AssignPermissionsToRoleRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AssignPermissionsToUserRequestDTO.html" data-type="entity-link" >AssignPermissionsToUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AssignRolesToUserRequestDTO.html" data-type="entity-link" >AssignRolesToUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AsyncManager.html" data-type="entity-link" >AsyncManager</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuditLogFiltersDTO.html" data-type="entity-link" >AuditLogFiltersDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuditLogResponseDTO.html" data-type="entity-link" >AuditLogResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuditLogsListResponseDTO.html" data-type="entity-link" >AuditLogsListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseHttpClient.html" data-type="entity-link" >BaseHttpClient</a>
                            </li>
                            <li class="link">
                                <a href="classes/BasicAuthStrategy.html" data-type="entity-link" >BasicAuthStrategy</a>
                            </li>
                            <li class="link">
                                <a href="classes/BearerAuthStrategy.html" data-type="entity-link" >BearerAuthStrategy</a>
                            </li>
                            <li class="link">
                                <a href="classes/BlockUserRequestDTO.html" data-type="entity-link" >BlockUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CardHelper.html" data-type="entity-link" >CardHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CatalogItemHelper.html" data-type="entity-link" >CatalogItemHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CatalogItemResponseDTO.html" data-type="entity-link" >CatalogItemResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CatalogItemsListResponseDTO.html" data-type="entity-link" >CatalogItemsListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CatalogOrmCategoryResponseDTO.html" data-type="entity-link" >CatalogOrmCategoryResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CatalogOrmHelper.html" data-type="entity-link" >CatalogOrmHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CatalogOrmItemResponseDTO.html" data-type="entity-link" >CatalogOrmItemResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CatalogOrmItemsListResponseDTO.html" data-type="entity-link" >CatalogOrmItemsListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CatalogOrmStockResponseDTO.html" data-type="entity-link" >CatalogOrmStockResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CatalogPriceItemRequestDTO.html" data-type="entity-link" >CatalogPriceItemRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryEntity.html" data-type="entity-link" >CategoryEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChangeCatalogItemsStatusRequestDTO.html" data-type="entity-link" >ChangeCatalogItemsStatusRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CompositeAuthStrategy.html" data-type="entity-link" >CompositeAuthStrategy</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConsoleEmailSender.html" data-type="entity-link" >ConsoleEmailSender</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConsoleSmsSender.html" data-type="entity-link" >ConsoleSmsSender</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateApiClientRequestDTO.html" data-type="entity-link" >CreateApiClientRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCatalogItemRequestDTO.html" data-type="entity-link" >CreateCatalogItemRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCatalogOrmItemRequestDTO.html" data-type="entity-link" >CreateCatalogOrmItemRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateExampleRequestDto.html" data-type="entity-link" >CreateExampleRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateExampleResponseDto.html" data-type="entity-link" >CreateExampleResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOrderRequestDTO.html" data-type="entity-link" >CreateOrderRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePasswordDTO.html" data-type="entity-link" >CreatePasswordDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePermissionRequestDTO.html" data-type="entity-link" >CreatePermissionRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateResponseDataDTO.html" data-type="entity-link" >CreateResponseDataDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRoleRequestDTO.html" data-type="entity-link" >CreateRoleRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserRequestDTO.html" data-type="entity-link" >CreateUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CryptoHelper.html" data-type="entity-link" >CryptoHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomHttpResponseHelper.html" data-type="entity-link" >CustomHttpResponseHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/DeleteStorageRequestDTO.html" data-type="entity-link" >DeleteStorageRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/DeletionStatusResponseDTO.html" data-type="entity-link" >DeletionStatusResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/DocumentValidationDTO.html" data-type="entity-link" >DocumentValidationDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/EditContextAccessDTO.html" data-type="entity-link" >EditContextAccessDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/EditContextRoleDTO.html" data-type="entity-link" >EditContextRoleDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/EditContextRolesResponseDTO.html" data-type="entity-link" >EditContextRolesResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/EditContextUserDTO.html" data-type="entity-link" >EditContextUserDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/EditContextUserResponseDTO.html" data-type="entity-link" >EditContextUserResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailHelper.html" data-type="entity-link" >EmailHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailProviderError.html" data-type="entity-link" >EmailProviderError</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailSendRequestDTO.html" data-type="entity-link" >EmailSendRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailUnavailableError.html" data-type="entity-link" >EmailUnavailableError</a>
                            </li>
                            <li class="link">
                                <a href="classes/EnqueueJobRequestDTO.html" data-type="entity-link" >EnqueueJobRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ErrorHelper.html" data-type="entity-link" >ErrorHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/EventsGateway.html" data-type="entity-link" >EventsGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/ExcelGenerator.html" data-type="entity-link" >ExcelGenerator</a>
                            </li>
                            <li class="link">
                                <a href="classes/ForgotUserPasswordDTO.html" data-type="entity-link" >ForgotUserPasswordDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/FormatHelper.html" data-type="entity-link" >FormatHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetEditContextResponseDTO.html" data-type="entity-link" >GetEditContextResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPermissionListQueryDTO.html" data-type="entity-link" >GetPermissionListQueryDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPermissionParamDTO.html" data-type="entity-link" >GetPermissionParamDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetRoleListQueryDTO.html" data-type="entity-link" >GetRoleListQueryDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetRoleParamDTO.html" data-type="entity-link" >GetRoleParamDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetUserRoleListQueryDTO.html" data-type="entity-link" >GetUserRoleListQueryDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetUserRoleParamDTO.html" data-type="entity-link" >GetUserRoleParamDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/HmacAuthStrategy.html" data-type="entity-link" >HmacAuthStrategy</a>
                            </li>
                            <li class="link">
                                <a href="classes/InfobipErrorHelper.html" data-type="entity-link" >InfobipErrorHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/InfobipGateway.html" data-type="entity-link" >InfobipGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/InfobipLogsSource.html" data-type="entity-link" >InfobipLogsSource</a>
                            </li>
                            <li class="link">
                                <a href="classes/InfobipReportsSource.html" data-type="entity-link" >InfobipReportsSource</a>
                            </li>
                            <li class="link">
                                <a href="classes/InfobipSmsSender.html" data-type="entity-link" >InfobipSmsSender</a>
                            </li>
                            <li class="link">
                                <a href="classes/InMemoryNonceStore.html" data-type="entity-link" >InMemoryNonceStore</a>
                            </li>
                            <li class="link">
                                <a href="classes/IsDateRangeWithinSixMonths.html" data-type="entity-link" >IsDateRangeWithinSixMonths</a>
                            </li>
                            <li class="link">
                                <a href="classes/IsEndDateAfterStartDate.html" data-type="entity-link" >IsEndDateAfterStartDate</a>
                            </li>
                            <li class="link">
                                <a href="classes/IsOrderByFormat.html" data-type="entity-link" >IsOrderByFormat</a>
                            </li>
                            <li class="link">
                                <a href="classes/ItemEntity.html" data-type="entity-link" >ItemEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/ItemStockEntity.html" data-type="entity-link" >ItemStockEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/JobResponseDTO.html" data-type="entity-link" >JobResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/JsonStreamHelper.html" data-type="entity-link" >JsonStreamHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/LegalDocumentResponseDTO.html" data-type="entity-link" >LegalDocumentResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListActivityLogsRequestDTO.html" data-type="entity-link" >ListActivityLogsRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListApiClientsRequestDTO.html" data-type="entity-link" >ListApiClientsRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListAuditLogsRequestDTO.html" data-type="entity-link" >ListAuditLogsRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListCatalogItemsRequestDTO.html" data-type="entity-link" >ListCatalogItemsRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListCatalogOrmItemsRequestDTO.html" data-type="entity-link" >ListCatalogOrmItemsRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListMessagesRequestDTO.html" data-type="entity-link" >ListMessagesRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListNotificationsRequestDTO.html" data-type="entity-link" >ListNotificationsRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListOrdersRequestDTO.html" data-type="entity-link" >ListOrdersRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListUsersRequestDTO.html" data-type="entity-link" >ListUsersRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginNonceResponseDTO.html" data-type="entity-link" >LoginNonceResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginUserDTO.html" data-type="entity-link" >LoginUserDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginUserResponseDTO.html" data-type="entity-link" >LoginUserResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/M2mEchoRequestDTO.html" data-type="entity-link" >M2mEchoRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/MarkAiContentRequestDTO.html" data-type="entity-link" >MarkAiContentRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/MaxCommaSeparatedConstraint.html" data-type="entity-link" >MaxCommaSeparatedConstraint</a>
                            </li>
                            <li class="link">
                                <a href="classes/MessageContentResponseDTO.html" data-type="entity-link" >MessageContentResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/MessageResponseDTO.html" data-type="entity-link" >MessageResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/MessagesListResponseDTO.html" data-type="entity-link" >MessagesListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoAuthStrategy.html" data-type="entity-link" >NoAuthStrategy</a>
                            </li>
                            <li class="link">
                                <a href="classes/NonRetryableJobError.html" data-type="entity-link" >NonRetryableJobError</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotExpiredConstraint.html" data-type="entity-link" >NotExpiredConstraint</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotificationResponseDTO.html" data-type="entity-link" >NotificationResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotificationsListResponseDTO.html" data-type="entity-link" >NotificationsListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/OnboardingUserRequestDTO.html" data-type="entity-link" >OnboardingUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/OnboardingUserResponseDTO.html" data-type="entity-link" >OnboardingUserResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderResponseDTO.html" data-type="entity-link" >OrderResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrdersListResponseDTO.html" data-type="entity-link" >OrdersListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginatedRequest.html" data-type="entity-link" >PaginatedRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginatedResponse.html" data-type="entity-link" >PaginatedResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationHelper.html" data-type="entity-link" >PaginationHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationMetaDTO.html" data-type="entity-link" >PaginationMetaDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationQueryDTO.html" data-type="entity-link" >PaginationQueryDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationResponseDTO.html" data-type="entity-link" >PaginationResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PasswordOnlyMessageResponseDTO.html" data-type="entity-link" >PasswordOnlyMessageResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PasswordResponseDTO.html" data-type="entity-link" >PasswordResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PdfHtmlGenerator.html" data-type="entity-link" >PdfHtmlGenerator</a>
                            </li>
                            <li class="link">
                                <a href="classes/PdfNativeGenerator.html" data-type="entity-link" >PdfNativeGenerator</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionItemDTO.html" data-type="entity-link" >PermissionItemDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionListResponseDTO.html" data-type="entity-link" >PermissionListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionResponseDTO.html" data-type="entity-link" >PermissionResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionResponseDTO-1.html" data-type="entity-link" >PermissionResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionScopeDTO.html" data-type="entity-link" >PermissionScopeDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionSummaryDTO.html" data-type="entity-link" >PermissionSummaryDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionSummaryDTO-1.html" data-type="entity-link" >PermissionSummaryDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PhoneHelper.html" data-type="entity-link" >PhoneHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/PresenceUpdateDTO.html" data-type="entity-link" >PresenceUpdateDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrismaBaseRepository.html" data-type="entity-link" >PrismaBaseRepository</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrismaBaseService.html" data-type="entity-link" >PrismaBaseService</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrismaClientExceptionFilter.html" data-type="entity-link" >PrismaClientExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrismaPaginationUtil.html" data-type="entity-link" >PrismaPaginationUtil</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProcedureResultResponseDTO.html" data-type="entity-link" >ProcedureResultResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProcessBatchManager.html" data-type="entity-link" >ProcessBatchManager</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProviderRejectedError.html" data-type="entity-link" >ProviderRejectedError</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProviderUnavailableError.html" data-type="entity-link" >ProviderUnavailableError</a>
                            </li>
                            <li class="link">
                                <a href="classes/PublishLegalVersionRequestDTO.html" data-type="entity-link" >PublishLegalVersionRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RecentAccessRequestDTO.html" data-type="entity-link" >RecentAccessRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RecentAccessResponseDTO.html" data-type="entity-link" >RecentAccessResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RecipientHelper.html" data-type="entity-link" >RecipientHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/RedisIoAdapter.html" data-type="entity-link" >RedisIoAdapter</a>
                            </li>
                            <li class="link">
                                <a href="classes/RedisNonceStore.html" data-type="entity-link" >RedisNonceStore</a>
                            </li>
                            <li class="link">
                                <a href="classes/RedisThrottlerStorage.html" data-type="entity-link" >RedisThrottlerStorage</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshTokenResponseDTO.html" data-type="entity-link" >RefreshTokenResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterSubscriptionRequestDTO.html" data-type="entity-link" >RegisterSubscriptionRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RequestContext.html" data-type="entity-link" >RequestContext</a>
                            </li>
                            <li class="link">
                                <a href="classes/RetentionPolicyResponseDTO.html" data-type="entity-link" >RetentionPolicyResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleItemDTO.html" data-type="entity-link" >RoleItemDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleListResponseDTO.html" data-type="entity-link" >RoleListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RolePermissionAssignmentResponseDTO.html" data-type="entity-link" >RolePermissionAssignmentResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleResponseDTO.html" data-type="entity-link" >RoleResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleResponseDTO-1.html" data-type="entity-link" >RoleResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleScopeDTO.html" data-type="entity-link" >RoleScopeDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleSummaryDTO.html" data-type="entity-link" >RoleSummaryDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleWithPermissionsResponseDTO.html" data-type="entity-link" >RoleWithPermissionsResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ScheduledJob.html" data-type="entity-link" >ScheduledJob</a>
                            </li>
                            <li class="link">
                                <a href="classes/SendEmailRequestDTO.html" data-type="entity-link" >SendEmailRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/SendSmsRequestDTO.html" data-type="entity-link" >SendSmsRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/SequelizeExceptionFilter.html" data-type="entity-link" >SequelizeExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/SmsProviderError.html" data-type="entity-link" >SmsProviderError</a>
                            </li>
                            <li class="link">
                                <a href="classes/SmsUnavailableError.html" data-type="entity-link" >SmsUnavailableError</a>
                            </li>
                            <li class="link">
                                <a href="classes/SmtpEmailSender.html" data-type="entity-link" >SmtpEmailSender</a>
                            </li>
                            <li class="link">
                                <a href="classes/SocketThrottle.html" data-type="entity-link" >SocketThrottle</a>
                            </li>
                            <li class="link">
                                <a href="classes/SqlQueryHelper.html" data-type="entity-link" >SqlQueryHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorageHelper.html" data-type="entity-link" >StorageHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/SubscriptionResponseDTO.html" data-type="entity-link" >SubscriptionResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/TestNotificationResponseDTO.html" data-type="entity-link" >TestNotificationResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/TransientConnectionErrorHelper.html" data-type="entity-link" >TransientConnectionErrorHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/TransientConnectionExceptionFilter.html" data-type="entity-link" >TransientConnectionExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnblockUserRequestDTO.html" data-type="entity-link" >UnblockUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnreadCountResponseDTO.html" data-type="entity-link" >UnreadCountResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateApiClientSettingsRequestDTO.html" data-type="entity-link" >UpdateApiClientSettingsRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateApiClientStatusRequestDTO.html" data-type="entity-link" >UpdateApiClientStatusRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCatalogOrmItemRequestDTO.html" data-type="entity-link" >UpdateCatalogOrmItemRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCatalogPricesRequestDTO.html" data-type="entity-link" >UpdateCatalogPricesRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateEditContextRequestDTO.html" data-type="entity-link" >UpdateEditContextRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateEditContextResponseDTO.html" data-type="entity-link" >UpdateEditContextResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateOrderStatusRequestDTO.html" data-type="entity-link" >UpdateOrderStatusRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatePermissionRequestDTO.html" data-type="entity-link" >UpdatePermissionRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateRoleRequestDTO.html" data-type="entity-link" >UpdateRoleRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserPasswordDTO.html" data-type="entity-link" >UpdateUserPasswordDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserRequestDTO.html" data-type="entity-link" >UpdateUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpsertRetentionPolicyRequestDTO.html" data-type="entity-link" >UpsertRetentionPolicyRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserConsentResponseDTO.html" data-type="entity-link" >UserConsentResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserDetailResponseDTO.html" data-type="entity-link" >UserDetailResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserHelper.html" data-type="entity-link" >UserHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserPermissionAssignmentResponseDTO.html" data-type="entity-link" >UserPermissionAssignmentResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserResponseDTO.html" data-type="entity-link" >UserResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserRoleAssignmentResponseDTO.html" data-type="entity-link" >UserRoleAssignmentResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserScopeResponseDTO.html" data-type="entity-link" >UserScopeResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UsersListResponseDTO.html" data-type="entity-link" >UsersListResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserWithRolesResponseDTO.html" data-type="entity-link" >UserWithRolesResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/VerificationStatusQueryDTO.html" data-type="entity-link" >VerificationStatusQueryDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/VerificationStatusResponseDTO.html" data-type="entity-link" >VerificationStatusResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/VerifyContentRequestDTO.html" data-type="entity-link" >VerifyContentRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/VerifyContentResponseDTO.html" data-type="entity-link" >VerifyContentResponseDTO</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AccountAnonymizationJob.html" data-type="entity-link" >AccountAnonymizationJob</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AccountApiService.html" data-type="entity-link" >AccountApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AccountDeletionDBService.html" data-type="entity-link" >AccountDeletionDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ActivityLogService.html" data-type="entity-link" >ActivityLogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AiDisclosureDBService.html" data-type="entity-link" >AiDisclosureDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiClientsApiService.html" data-type="entity-link" >ApiClientsApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiClientsDBService.html" data-type="entity-link" >ApiClientsDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiClientSigningSecretService.html" data-type="entity-link" >ApiClientSigningSecretService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiClientThrottlerGuard.html" data-type="entity-link" >ApiClientThrottlerGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AppThrottlerGuard.html" data-type="entity-link" >AppThrottlerGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuditInterceptor.html" data-type="entity-link" >AuditInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuditLogDBService.html" data-type="entity-link" >AuditLogDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuditLogsApiService.html" data-type="entity-link" >AuditLogsApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthApiService.html" data-type="entity-link" >AuthApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthCookieService.html" data-type="entity-link" >AuthCookieService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthMigrationService.html" data-type="entity-link" >AuthMigrationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthPasswordService.html" data-type="entity-link" >AuthPasswordService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthTokenService.html" data-type="entity-link" >AuthTokenService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BackgroundJobsDBService.html" data-type="entity-link" >BackgroundJobsDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BackgroundJobsRepository.html" data-type="entity-link" >BackgroundJobsRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BackgroundJobWorkerJob.html" data-type="entity-link" >BackgroundJobWorkerJob</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BaseThrottlerGuard.html" data-type="entity-link" >BaseThrottlerGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CacheShutdown.html" data-type="entity-link" >CacheShutdown</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogCategoryRepository.html" data-type="entity-link" >CatalogCategoryRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogItemRepository.html" data-type="entity-link" >CatalogItemRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogItemStockRepository.html" data-type="entity-link" >CatalogItemStockRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogOrmApiService.html" data-type="entity-link" >CatalogOrmApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogOrmService.html" data-type="entity-link" >CatalogOrmService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogRawApiService.html" data-type="entity-link" >CatalogRawApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogRawRepository.html" data-type="entity-link" >CatalogRawRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogRawService.html" data-type="entity-link" >CatalogRawService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CredentialsRepository.html" data-type="entity-link" >CredentialsRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DatabaseHelper.html" data-type="entity-link" >DatabaseHelper</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DataRetentionDBService.html" data-type="entity-link" >DataRetentionDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DataRetentionExecutorService.html" data-type="entity-link" >DataRetentionExecutorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Db2HealthIndicator.html" data-type="entity-link" >Db2HealthIndicator</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DomainEventsActivityListener.html" data-type="entity-link" >DomainEventsActivityListener</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmailService.html" data-type="entity-link" >EmailService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExampleApiService.html" data-type="entity-link" >ExampleApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExampleRepository.html" data-type="entity-link" >ExampleRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExampleService.html" data-type="entity-link" >ExampleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExampleUpstreamClient.html" data-type="entity-link" >ExampleUpstreamClient</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FcmPushProvider.html" data-type="entity-link" >FcmPushProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FeeCalculator.html" data-type="entity-link" >FeeCalculator</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileDownloadInterceptor.html" data-type="entity-link" >FileDownloadInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IdempotencyInterceptor.html" data-type="entity-link" >IdempotencyInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IdempotencyPurgeJob.html" data-type="entity-link" >IdempotencyPurgeJob</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IdempotencyService.html" data-type="entity-link" >IdempotencyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JobHandlerRegistry.html" data-type="entity-link" >JobHandlerRegistry</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JobsApiService.html" data-type="entity-link" >JobsApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JobSchedulerService.html" data-type="entity-link" >JobSchedulerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JsonStreamInterceptor.html" data-type="entity-link" >JsonStreamInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtRefreshStrategy.html" data-type="entity-link" >JwtRefreshStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LegalApiService.html" data-type="entity-link" >LegalApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LegalDocumentsDBService.html" data-type="entity-link" >LegalDocumentsDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageContentService.html" data-type="entity-link" >MessageContentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageDBService.html" data-type="entity-link" >MessageDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageDispatcherService.html" data-type="entity-link" >MessageDispatcherService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessagePurgeJob.html" data-type="entity-link" >MessagePurgeJob</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessagesApiService.html" data-type="entity-link" >MessagesApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MongoActivityLogStore.html" data-type="entity-link" >MongoActivityLogStore</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NonceService.html" data-type="entity-link" >NonceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NoopActivityLogStore.html" data-type="entity-link" >NoopActivityLogStore</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NoopPushProvider.html" data-type="entity-link" >NoopPushProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationInboxDBService.html" data-type="entity-link" >NotificationInboxDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationRealtimeListener.html" data-type="entity-link" >NotificationRealtimeListener</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationsApiService.html" data-type="entity-link" >NotificationsApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationsService.html" data-type="entity-link" >NotificationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ObservabilityInterceptor.html" data-type="entity-link" >ObservabilityInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OnboardingApiService.html" data-type="entity-link" >OnboardingApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OnboardingService.html" data-type="entity-link" >OnboardingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrderNotificationsListener.html" data-type="entity-link" >OrderNotificationsListener</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrdersApiService.html" data-type="entity-link" >OrdersApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrdersDBService.html" data-type="entity-link" >OrdersDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrdersRepository.html" data-type="entity-link" >OrdersRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ParseFilesPipe.html" data-type="entity-link" >ParseFilesPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PermissionsCacheService.html" data-type="entity-link" >PermissionsCacheService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PermissionsDBService.html" data-type="entity-link" >PermissionsDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrismaDatasource.html" data-type="entity-link" >PrismaDatasource</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PushProviderRegistry.html" data-type="entity-link" >PushProviderRegistry</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PushSubscriptionsDBService.html" data-type="entity-link" >PushSubscriptionsDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RawQueryExecutorService.html" data-type="entity-link" >RawQueryExecutorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RealtimeService.html" data-type="entity-link" >RealtimeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RedisHealthIndicator.html" data-type="entity-link" >RedisHealthIndicator</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RedisService.html" data-type="entity-link" >RedisService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportExportHandler.html" data-type="entity-link" >ReportExportHandler</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportService.html" data-type="entity-link" >ReportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolePermissionsDBService.html" data-type="entity-link" >RolePermissionsDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolesApiService.html" data-type="entity-link" >RolesApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolesDBService.html" data-type="entity-link" >RolesDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolesPermissionsMapper.html" data-type="entity-link" >RolesPermissionsMapper</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SentryReporterService.html" data-type="entity-link" >SentryReporterService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SequelizeBaseRepository.html" data-type="entity-link" >SequelizeBaseRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SequelizeBaseService.html" data-type="entity-link" >SequelizeBaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SequelizeService.html" data-type="entity-link" >SequelizeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SmsDeliveryPollJob.html" data-type="entity-link" >SmsDeliveryPollJob</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SmtpHealthIndicator.html" data-type="entity-link" >SmtpHealthIndicator</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageApiService.html" data-type="entity-link" >StorageApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageService.html" data-type="entity-link" >StorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TraceIdMiddleware.html" data-type="entity-link" >TraceIdMiddleware</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserConsentsDBService.html" data-type="entity-link" >UserConsentsDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserPermissionsDBService.html" data-type="entity-link" >UserPermissionsDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserRolesDBService.html" data-type="entity-link" >UserRolesDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserRolesDBService-1.html" data-type="entity-link" >UserRolesDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersApiService.html" data-type="entity-link" >UsersApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersDBService.html" data-type="entity-link" >UsersDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WebPushProvider.html" data-type="entity-link" >WebPushProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WsAuthService.html" data-type="entity-link" >WsAuthService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/BasicAuthGuard.html" data-type="entity-link" >BasicAuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/HmacSignatureGuard.html" data-type="entity-link" >HmacSignatureGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/PermissionsGuard.html" data-type="entity-link" >PermissionsGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/RequiresActiveConsentGuard.html" data-type="entity-link" >RequiresActiveConsentGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/TenantContextGuard.html" data-type="entity-link" >TenantContextGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/UserByEmailLoaderGuard.html" data-type="entity-link" >UserByEmailLoaderGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/WsJwtGuard.html" data-type="entity-link" >WsJwtGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AccountAnonymizedEvent.html" data-type="entity-link" >AccountAnonymizedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccountDeletionCancelledEvent.html" data-type="entity-link" >AccountDeletionCancelledEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccountDeletionRequestedEvent.html" data-type="entity-link" >AccountDeletionRequestedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiClientRequest.html" data-type="entity-link" >ApiClientRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiErrorResponse.html" data-type="entity-link" >ApiErrorResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BaseHttpClientOptions.html" data-type="entity-link" >BaseHttpClientOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CatalogItemFilterParams.html" data-type="entity-link" >CatalogItemFilterParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CatalogItemQueryParams.html" data-type="entity-link" >CatalogItemQueryParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DateRangeDTO.html" data-type="entity-link" >DateRangeDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Db2TimestampRange.html" data-type="entity-link" >Db2TimestampRange</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DbErrorLike.html" data-type="entity-link" >DbErrorLike</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DescribedDbError.html" data-type="entity-link" >DescribedDbError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FailedAttemptDecision.html" data-type="entity-link" >FailedAttemptDecision</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FeeConfig.html" data-type="entity-link" >FeeConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FileUploaderOptions.html" data-type="entity-link" >FileUploaderOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlatTenantAssignment.html" data-type="entity-link" >FlatTenantAssignment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupedAssignments.html" data-type="entity-link" >GroupedAssignments</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HttpAuthSettings.html" data-type="entity-link" >HttpAuthSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HttpAuthStrategy.html" data-type="entity-link" >HttpAuthStrategy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAcceptConsent.html" data-type="entity-link" >IAcceptConsent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IActivityLogEntry.html" data-type="entity-link" >IActivityLogEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IActivityLogQuery.html" data-type="entity-link" >IActivityLogQuery</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IActivityLogRecord.html" data-type="entity-link" >IActivityLogRecord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IActivityLogStore.html" data-type="entity-link" >IActivityLogStore</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAdvisoryLockOptions.html" data-type="entity-link" >IAdvisoryLockOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IApiClientDetail.html" data-type="entity-link" >IApiClientDetail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IApiClientPrincipal.html" data-type="entity-link" >IApiClientPrincipal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IApiClientSecrets.html" data-type="entity-link" >IApiClientSecrets</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuditLogFilters.html" data-type="entity-link" >IAuditLogFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuditLogPage.html" data-type="entity-link" >IAuditLogPage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuditLogRow.html" data-type="entity-link" >IAuditLogRow</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuthenticatedRequest.html" data-type="entity-link" >IAuthenticatedRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBuiltQuery.html" data-type="entity-link" >IBuiltQuery</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBuiltWhere.html" data-type="entity-link" >IBuiltWhere</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICallerContext.html" data-type="entity-link" >ICallerContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICatalogItemCreate.html" data-type="entity-link" >ICatalogItemCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICatalogItemRaw.html" data-type="entity-link" >ICatalogItemRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICatalogItemView.html" data-type="entity-link" >ICatalogItemView</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICatalogOrmCreate.html" data-type="entity-link" >ICatalogOrmCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICatalogOrmItemView.html" data-type="entity-link" >ICatalogOrmItemView</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICatalogOrmListParams.html" data-type="entity-link" >ICatalogOrmListParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICatalogOrmStockView.html" data-type="entity-link" >ICatalogOrmStockView</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICatalogOrmUpdate.html" data-type="entity-link" >ICatalogOrmUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICatalogPriceUpdate.html" data-type="entity-link" >ICatalogPriceUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICookies.html" data-type="entity-link" >ICookies</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICreateApiClientData.html" data-type="entity-link" >ICreateApiClientData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICreateNotification.html" data-type="entity-link" >ICreateNotification</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICreatePendingMessage.html" data-type="entity-link" >ICreatePendingMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDeletionStatus.html" data-type="entity-link" >IDeletionStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDeliveryReport.html" data-type="entity-link" >IDeliveryReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDeliveryStatusSource.html" data-type="entity-link" >IDeliveryStatusSource</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IdempotentOptions.html" data-type="entity-link" >IdempotentOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDispatchContext.html" data-type="entity-link" >IDispatchContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDownloadResponse.html" data-type="entity-link" >IDownloadResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmailDispatch.html" data-type="entity-link" >IEmailDispatch</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmailMessage.html" data-type="entity-link" >IEmailMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmailSender.html" data-type="entity-link" >IEmailSender</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmailSendResult.html" data-type="entity-link" >IEmailSendResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEnqueueJobInput.html" data-type="entity-link" >IEnqueueJobInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IExcelColumn.html" data-type="entity-link" >IExcelColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IExceptionContext.html" data-type="entity-link" >IExceptionContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IExceptionReporter.html" data-type="entity-link" >IExceptionReporter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInfobipAxiosError.html" data-type="entity-link" >IInfobipAxiosError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInfobipClient.html" data-type="entity-link" >IInfobipClient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInfobipGatewayOptions.html" data-type="entity-link" >IInfobipGatewayOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInfobipHttpResponse.html" data-type="entity-link" >IInfobipHttpResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInfobipMessageLog.html" data-type="entity-link" >IInfobipMessageLog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInfobipSendPayload.html" data-type="entity-link" >IInfobipSendPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInfobipSendResponse.html" data-type="entity-link" >IInfobipSendResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInfobipStatus.html" data-type="entity-link" >IInfobipStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IJobContext.html" data-type="entity-link" >IJobContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IJobHandler.html" data-type="entity-link" >IJobHandler</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IJsonStreamAccumulator.html" data-type="entity-link" >IJsonStreamAccumulator</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IJsonStreamDocument.html" data-type="entity-link" >IJsonStreamDocument</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IJwtPayload.html" data-type="entity-link" >IJwtPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IListApiClientsQuery.html" data-type="entity-link" >IListApiClientsQuery</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IListNotifications.html" data-type="entity-link" >IListNotifications</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMarkAiContent.html" data-type="entity-link" >IMarkAiContent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMessageListFilters.html" data-type="entity-link" >IMessageListFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/INonceStore.html" data-type="entity-link" >INonceStore</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/INotifyInput.html" data-type="entity-link" >INotifyInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/INotifyResult.html" data-type="entity-link" >INotifyResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProcedureResultRaw.html" data-type="entity-link" >IProcedureResultRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProtectedContent.html" data-type="entity-link" >IProtectedContent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPublishVersion.html" data-type="entity-link" >IPublishVersion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPushPayload.html" data-type="entity-link" >IPushPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPushProvider.html" data-type="entity-link" >IPushProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPushSendResult.html" data-type="entity-link" >IPushSendResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPushTarget.html" data-type="entity-link" >IPushTarget</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRecentAccess.html" data-type="entity-link" >IRecentAccess</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRecipients.html" data-type="entity-link" >IRecipients</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRegisterSubscription.html" data-type="entity-link" >IRegisterSubscription</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportDataMetadata.html" data-type="entity-link" >IReportDataMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportExportPayload.html" data-type="entity-link" >IReportExportPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportOptions.html" data-type="entity-link" >IReportOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportOptions-1.html" data-type="entity-link" >IReportOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportPayload.html" data-type="entity-link" >IReportPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportService.html" data-type="entity-link" >IReportService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRequestUser.html" data-type="entity-link" >IRequestUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRolePermission.html" data-type="entity-link" >IRolePermission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISendEmailOptions.html" data-type="entity-link" >ISendEmailOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISequelizeBaseAttributes.html" data-type="entity-link" >ISequelizeBaseAttributes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISmsMessage.html" data-type="entity-link" >ISmsMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISmsSender.html" data-type="entity-link" >ISmsSender</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISmsSendResult.html" data-type="entity-link" >ISmsSendResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISmtpOptions.html" data-type="entity-link" >ISmtpOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITenantContext.html" data-type="entity-link" >ITenantContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUpdateApiClientSettingsData.html" data-type="entity-link" >IUpdateApiClientSettingsData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUploadedFileUrls.html" data-type="entity-link" >IUploadedFileUrls</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUploadFileParams.html" data-type="entity-link" >IUploadFileParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUpsertRetentionPolicy.html" data-type="entity-link" >IUpsertRetentionPolicy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserDataOnJwt.html" data-type="entity-link" >IUserDataOnJwt</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IWhereClause.html" data-type="entity-link" >IWhereClause</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IWhereOptions.html" data-type="entity-link" >IWhereOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListOrdersParams.html" data-type="entity-link" >ListOrdersParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LockoutOptions.html" data-type="entity-link" >LockoutOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationCreatedEvent.html" data-type="entity-link" >NotificationCreatedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OdbcErrorLike.html" data-type="entity-link" >OdbcErrorLike</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderStatusChangedEvent.html" data-type="entity-link" >OrderStatusChangedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OwnershipOptions.html" data-type="entity-link" >OwnershipOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OwnershipSubject.html" data-type="entity-link" >OwnershipSubject</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PackageJson.html" data-type="entity-link" >PackageJson</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PackageJson-1.html" data-type="entity-link" >PackageJson</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginationOptions.html" data-type="entity-link" >PaginationOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PasswordPolicy.html" data-type="entity-link" >PasswordPolicy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PasswordPolicyResult.html" data-type="entity-link" >PasswordPolicyResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionDTO.html" data-type="entity-link" >PermissionDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PresenceSnapshot.html" data-type="entity-link" >PresenceSnapshot</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PrismaModelDelegate.html" data-type="entity-link" >PrismaModelDelegate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RequestContextStore.html" data-type="entity-link" >RequestContextStore</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RequestOptions.html" data-type="entity-link" >RequestOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResolveInput.html" data-type="entity-link" >ResolveInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RetryOptions.html" data-type="entity-link" >RetryOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RoleDTO.html" data-type="entity-link" >RoleDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SignatureParts.html" data-type="entity-link" >SignatureParts</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageDeleteInput.html" data-type="entity-link" >StorageDeleteInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageExecutionOptions.html" data-type="entity-link" >StorageExecutionOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageModuleOptions.html" data-type="entity-link" >StorageModuleOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StoragePresignedUrlInput.html" data-type="entity-link" >StoragePresignedUrlInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StoragePresignedUrlOptions.html" data-type="entity-link" >StoragePresignedUrlOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StoragePresignedUrlResult.html" data-type="entity-link" >StoragePresignedUrlResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageUploadInput.html" data-type="entity-link" >StorageUploadInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageUploadResult.html" data-type="entity-link" >StorageUploadResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TruncatedPayloadInfo.html" data-type="entity-link" >TruncatedPayloadInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpstreamEcho.html" data-type="entity-link" >UpstreamEcho</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});