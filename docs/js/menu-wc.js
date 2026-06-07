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
                    <a href="index.html" data-type="index-link">node-started-backend documentation</a>
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
                                <a href="modules/ApiModule.html" data-type="entity-link" >ApiModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-d8f650ef0cc1a375f71267fb7c9014e487a0f151313a0bca2d534e7ea8d49fd62e545e2acb6314c69bbd1669363d47523d351a10d0a0bd0258e2ae098319827c"' : 'data-bs-target="#xs-injectables-links-module-AppModule-d8f650ef0cc1a375f71267fb7c9014e487a0f151313a0bca2d534e7ea8d49fd62e545e2acb6314c69bbd1669363d47523d351a10d0a0bd0258e2ae098319827c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-d8f650ef0cc1a375f71267fb7c9014e487a0f151313a0bca2d534e7ea8d49fd62e545e2acb6314c69bbd1669363d47523d351a10d0a0bd0258e2ae098319827c"' :
                                        'id="xs-injectables-links-module-AppModule-d8f650ef0cc1a375f71267fb7c9014e487a0f151313a0bca2d534e7ea8d49fd62e545e2acb6314c69bbd1669363d47523d351a10d0a0bd0258e2ae098319827c"' }>
                                        <li class="link">
                                            <a href="injectables/ObservabilityInterceptor.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ObservabilityInterceptor</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthApiModule.html" data-type="entity-link" >AuthApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthApiModule-5b0ea43e7d36810fa75bc95b6611d18a9eb4f435cc6c79170a7baa1434d8452fb14fd2932b8b1a8436cc4c58b482f6d475321189ab43ff95bd4c9883617661d5"' : 'data-bs-target="#xs-controllers-links-module-AuthApiModule-5b0ea43e7d36810fa75bc95b6611d18a9eb4f435cc6c79170a7baa1434d8452fb14fd2932b8b1a8436cc4c58b482f6d475321189ab43ff95bd4c9883617661d5"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthApiModule-5b0ea43e7d36810fa75bc95b6611d18a9eb4f435cc6c79170a7baa1434d8452fb14fd2932b8b1a8436cc4c58b482f6d475321189ab43ff95bd4c9883617661d5"' :
                                            'id="xs-controllers-links-module-AuthApiModule-5b0ea43e7d36810fa75bc95b6611d18a9eb4f435cc6c79170a7baa1434d8452fb14fd2932b8b1a8436cc4c58b482f6d475321189ab43ff95bd4c9883617661d5"' }>
                                            <li class="link">
                                                <a href="controllers/AuthApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthApiModule-5b0ea43e7d36810fa75bc95b6611d18a9eb4f435cc6c79170a7baa1434d8452fb14fd2932b8b1a8436cc4c58b482f6d475321189ab43ff95bd4c9883617661d5"' : 'data-bs-target="#xs-injectables-links-module-AuthApiModule-5b0ea43e7d36810fa75bc95b6611d18a9eb4f435cc6c79170a7baa1434d8452fb14fd2932b8b1a8436cc4c58b482f6d475321189ab43ff95bd4c9883617661d5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthApiModule-5b0ea43e7d36810fa75bc95b6611d18a9eb4f435cc6c79170a7baa1434d8452fb14fd2932b8b1a8436cc4c58b482f6d475321189ab43ff95bd4c9883617661d5"' :
                                        'id="xs-injectables-links-module-AuthApiModule-5b0ea43e7d36810fa75bc95b6611d18a9eb4f435cc6c79170a7baa1434d8452fb14fd2932b8b1a8436cc4c58b482f6d475321189ab43ff95bd4c9883617661d5"' }>
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
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DatabaseModule-f7a1e5fadd649c672ca0f668311434c5c40fbe28cfddcd11553f9b2be534e8510b5353cbcd360bae519f0a3641f3d29b0e6a7ed450e16a94bd77558f0b07ca95"' : 'data-bs-target="#xs-injectables-links-module-DatabaseModule-f7a1e5fadd649c672ca0f668311434c5c40fbe28cfddcd11553f9b2be534e8510b5353cbcd360bae519f0a3641f3d29b0e6a7ed450e16a94bd77558f0b07ca95"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DatabaseModule-f7a1e5fadd649c672ca0f668311434c5c40fbe28cfddcd11553f9b2be534e8510b5353cbcd360bae519f0a3641f3d29b0e6a7ed450e16a94bd77558f0b07ca95"' :
                                        'id="xs-injectables-links-module-DatabaseModule-f7a1e5fadd649c672ca0f668311434c5c40fbe28cfddcd11553f9b2be534e8510b5353cbcd360bae519f0a3641f3d29b0e6a7ed450e16a94bd77558f0b07ca95"' }>
                                        <li class="link">
                                            <a href="injectables/DatabaseHelper.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatabaseHelper</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PrismaDatasource.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaDatasource</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RawQueryExecutorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RawQueryExecutorService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EmailModule.html" data-type="entity-link" >EmailModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EmailModule-554bf3df44489b5c67a783cd1b600614c1ef7ac176e2b9a7bb2d39d2dd91345a9a59df3fb196caadda83ea153ecb9735608778ed25fba1553b6a2b1d737f6219"' : 'data-bs-target="#xs-injectables-links-module-EmailModule-554bf3df44489b5c67a783cd1b600614c1ef7ac176e2b9a7bb2d39d2dd91345a9a59df3fb196caadda83ea153ecb9735608778ed25fba1553b6a2b1d737f6219"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EmailModule-554bf3df44489b5c67a783cd1b600614c1ef7ac176e2b9a7bb2d39d2dd91345a9a59df3fb196caadda83ea153ecb9735608778ed25fba1553b6a2b1d737f6219"' :
                                        'id="xs-injectables-links-module-EmailModule-554bf3df44489b5c67a783cd1b600614c1ef7ac176e2b9a7bb2d39d2dd91345a9a59df3fb196caadda83ea153ecb9735608778ed25fba1553b6a2b1d737f6219"' }>
                                        <li class="link">
                                            <a href="injectables/EmailService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailService</a>
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
                                            'data-bs-target="#controllers-links-module-HealthModule-e00d67b112c41d9e106494fdcadec0b30b4d281d7032db3f43dca009db340c517f86564730b12ada1da3b5f4f27df80f003115a72cee1e93dd6869558bda9b76"' : 'data-bs-target="#xs-controllers-links-module-HealthModule-e00d67b112c41d9e106494fdcadec0b30b4d281d7032db3f43dca009db340c517f86564730b12ada1da3b5f4f27df80f003115a72cee1e93dd6869558bda9b76"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HealthModule-e00d67b112c41d9e106494fdcadec0b30b4d281d7032db3f43dca009db340c517f86564730b12ada1da3b5f4f27df80f003115a72cee1e93dd6869558bda9b76"' :
                                            'id="xs-controllers-links-module-HealthModule-e00d67b112c41d9e106494fdcadec0b30b4d281d7032db3f43dca009db340c517f86564730b12ada1da3b5f4f27df80f003115a72cee1e93dd6869558bda9b76"' }>
                                            <li class="link">
                                                <a href="controllers/HealthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HealthController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ObservabilityModule.html" data-type="entity-link" >ObservabilityModule</a>
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
                                        'data-bs-target="#injectables-links-module-StorageModule-2fa2acf46b3a65c572893ef681089ed9e7bf730c8376eaee0966305bb9b85b594a6efdf62ebfd3fac1e560fb4493d9d08745aa50e585b7e9c3255c9ef81ad8af"' : 'data-bs-target="#xs-injectables-links-module-StorageModule-2fa2acf46b3a65c572893ef681089ed9e7bf730c8376eaee0966305bb9b85b594a6efdf62ebfd3fac1e560fb4493d9d08745aa50e585b7e9c3255c9ef81ad8af"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StorageModule-2fa2acf46b3a65c572893ef681089ed9e7bf730c8376eaee0966305bb9b85b594a6efdf62ebfd3fac1e560fb4493d9d08745aa50e585b7e9c3255c9ef81ad8af"' :
                                        'id="xs-injectables-links-module-StorageModule-2fa2acf46b3a65c572893ef681089ed9e7bf730c8376eaee0966305bb9b85b594a6efdf62ebfd3fac1e560fb4493d9d08745aa50e585b7e9c3255c9ef81ad8af"' }>
                                        <li class="link">
                                            <a href="injectables/StorageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorageService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TemplatePlaygroundModule.html" data-type="entity-link" >TemplatePlaygroundModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                            'id="xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <li class="link">
                                                <a href="components/TemplatePlaygroundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplatePlaygroundComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                        'id="xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <li class="link">
                                            <a href="injectables/HbsRenderService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HbsRenderService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TemplateEditorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplateEditorService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ZipExportService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ZipExportService</a>
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
                                    <a href="controllers/AuthApiController.html" data-type="entity-link" >AuthApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ExampleApiController.html" data-type="entity-link" >ExampleApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/HealthController.html" data-type="entity-link" >HealthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/OnboardingController.html" data-type="entity-link" >OnboardingController</a>
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
                                <a href="classes/AllExceptionsFilter.html" data-type="entity-link" >AllExceptionsFilter</a>
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
                                <a href="classes/BankDataDTO.html" data-type="entity-link" >BankDataDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/BlockUserRequestDTO.html" data-type="entity-link" >BlockUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CardHelper.html" data-type="entity-link" >CardHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CommercialDataDTO.html" data-type="entity-link" >CommercialDataDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateExampleRequestDto.html" data-type="entity-link" >CreateExampleRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateExampleResponseDto.html" data-type="entity-link" >CreateExampleResponseDto</a>
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
                                <a href="classes/DocumentsDataDTO.html" data-type="entity-link" >DocumentsDataDTO</a>
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
                                <a href="classes/EmailSendRequestDTO.html" data-type="entity-link" >EmailSendRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ErrorHelper.html" data-type="entity-link" >ErrorHelper</a>
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
                                <a href="classes/IsDateRangeWithinSixMonths.html" data-type="entity-link" >IsDateRangeWithinSixMonths</a>
                            </li>
                            <li class="link">
                                <a href="classes/IsEndDateAfterStartDate.html" data-type="entity-link" >IsEndDateAfterStartDate</a>
                            </li>
                            <li class="link">
                                <a href="classes/IsOrderByFormat.html" data-type="entity-link" >IsOrderByFormat</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListUsersRequestDTO.html" data-type="entity-link" >ListUsersRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/LocationDataDTO.html" data-type="entity-link" >LocationDataDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginUserDTO.html" data-type="entity-link" >LoginUserDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginUserResponseDTO.html" data-type="entity-link" >LoginUserResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/MaxCommaSeparatedConstraint.html" data-type="entity-link" >MaxCommaSeparatedConstraint</a>
                            </li>
                            <li class="link">
                                <a href="classes/MerchantApplicationRequestDTO.html" data-type="entity-link" >MerchantApplicationRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/MerchantApplicationResponseDTO.html" data-type="entity-link" >MerchantApplicationResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotExpiredConstraint.html" data-type="entity-link" >NotExpiredConstraint</a>
                            </li>
                            <li class="link">
                                <a href="classes/OnboardingMerchantActivationResponseDTO.html" data-type="entity-link" >OnboardingMerchantActivationResponseDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/OnboardingSetApplicationStatusDTO.html" data-type="entity-link" >OnboardingSetApplicationStatusDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/OnboardingUserRequestDTO.html" data-type="entity-link" >OnboardingUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/OnboardingUserResponseDTO.html" data-type="entity-link" >OnboardingUserResponseDTO</a>
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
                                <a href="classes/ProcessBatchManager.html" data-type="entity-link" >ProcessBatchManager</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshTokenResponseDTO.html" data-type="entity-link" >RefreshTokenResponseDTO</a>
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
                                <a href="classes/StepDTO.html" data-type="entity-link" >StepDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorageHelper.html" data-type="entity-link" >StorageHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnblockUserRequestDTO.html" data-type="entity-link" >UnblockUserRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateEditContextRequestDTO.html" data-type="entity-link" >UpdateEditContextRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateEditContextResponseDTO.html" data-type="entity-link" >UpdateEditContextResponseDTO</a>
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
                                    <a href="injectables/AuditInterceptor.html" data-type="entity-link" >AuditInterceptor</a>
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
                                    <a href="injectables/CredentialsRepository.html" data-type="entity-link" >CredentialsRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DatabaseHelper.html" data-type="entity-link" >DatabaseHelper</a>
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
                                    <a href="injectables/FileDownloadInterceptor.html" data-type="entity-link" >FileDownloadInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HbsRenderService.html" data-type="entity-link" >HbsRenderService</a>
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
                                    <a href="injectables/ObservabilityInterceptor.html" data-type="entity-link" >ObservabilityInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OnboardingApiService.html" data-type="entity-link" >OnboardingApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OnboardingService.html" data-type="entity-link" >OnboardingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ParseFilesPipe.html" data-type="entity-link" >ParseFilesPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PermissionsDBService.html" data-type="entity-link" >PermissionsDBService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrismaDatasource.html" data-type="entity-link" >PrismaDatasource</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RawQueryExecutorService.html" data-type="entity-link" >RawQueryExecutorService</a>
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
                                    <a href="injectables/SequelizeBaseRepository.html" data-type="entity-link" >SequelizeBaseRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SequelizeBaseService.html" data-type="entity-link" >SequelizeBaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SequelizeService.html" data-type="entity-link" >SequelizeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageApiService.html" data-type="entity-link" >StorageApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageService.html" data-type="entity-link" >StorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TemplateEditorService.html" data-type="entity-link" >TemplateEditorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TraceIdMiddleware.html" data-type="entity-link" >TraceIdMiddleware</a>
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
                                    <a href="injectables/ZipExportService.html" data-type="entity-link" >ZipExportService</a>
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
                                <a href="guards/MerchantContextGuard.html" data-type="entity-link" >MerchantContextGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/PermissionsGuard.html" data-type="entity-link" >PermissionsGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/UserByEmailLoaderGuard.html" data-type="entity-link" >UserByEmailLoaderGuard</a>
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
                                <a href="interfaces/ApiErrorResponse.html" data-type="entity-link" >ApiErrorResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompoDocConfig.html" data-type="entity-link" >CompoDocConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DateRangeDTO.html" data-type="entity-link" >DateRangeDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FileUploaderOptions.html" data-type="entity-link" >FileUploaderOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlatMerchantAssignment.html" data-type="entity-link" >FlatMerchantAssignment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupedAssignments.html" data-type="entity-link" >GroupedAssignments</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuthenticatedRequest.html" data-type="entity-link" >IAuthenticatedRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICookies.html" data-type="entity-link" >ICookies</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDownloadResponse.html" data-type="entity-link" >IDownloadResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IExcelColumn.html" data-type="entity-link" >IExcelColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IJwtPayload.html" data-type="entity-link" >IJwtPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMerchantContext.html" data-type="entity-link" >IMerchantContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportDataMetadata.html" data-type="entity-link" >IReportDataMetadata</a>
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
                                <a href="interfaces/IRolePermission.html" data-type="entity-link" >IRolePermission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISendEmailOptions.html" data-type="entity-link" >ISendEmailOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISequelizeBaseAttributes.html" data-type="entity-link" >ISequelizeBaseAttributes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUploadedFileUrls.html" data-type="entity-link" >IUploadedFileUrls</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUploadFileParams.html" data-type="entity-link" >IUploadFileParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserDataOnJwt.html" data-type="entity-link" >IUserDataOnJwt</a>
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
                                <a href="interfaces/PermissionDTO.html" data-type="entity-link" >PermissionDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PrismaModelDelegate.html" data-type="entity-link" >PrismaModelDelegate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RetryOptions.html" data-type="entity-link" >RetryOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RoleDTO.html" data-type="entity-link" >RoleDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
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
                                <a href="interfaces/Template.html" data-type="entity-link" >Template</a>
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