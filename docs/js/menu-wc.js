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
                                        'data-bs-target="#injectables-links-module-AppModule-e9eb65c9e72d2492b98903821027ab9583ae3ca6488eceba24bcf13c728765504a2c2bdc42f180143ce6d7285ac77fe18ec4efa2dac59e80839c8595f6ef7d38"' : 'data-bs-target="#xs-injectables-links-module-AppModule-e9eb65c9e72d2492b98903821027ab9583ae3ca6488eceba24bcf13c728765504a2c2bdc42f180143ce6d7285ac77fe18ec4efa2dac59e80839c8595f6ef7d38"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-e9eb65c9e72d2492b98903821027ab9583ae3ca6488eceba24bcf13c728765504a2c2bdc42f180143ce6d7285ac77fe18ec4efa2dac59e80839c8595f6ef7d38"' :
                                        'id="xs-injectables-links-module-AppModule-e9eb65c9e72d2492b98903821027ab9583ae3ca6488eceba24bcf13c728765504a2c2bdc42f180143ce6d7285ac77fe18ec4efa2dac59e80839c8595f6ef7d38"' }>
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
                                            'data-bs-target="#controllers-links-module-AuthApiModule-fbbddf458130c7cdf4b63596c4d50201ffdb076f4eec89c7361c4195de1f267e8042060b2dbb63b2f5cdf63de760521d114b5f1997af83c2dab2f5606186870d"' : 'data-bs-target="#xs-controllers-links-module-AuthApiModule-fbbddf458130c7cdf4b63596c4d50201ffdb076f4eec89c7361c4195de1f267e8042060b2dbb63b2f5cdf63de760521d114b5f1997af83c2dab2f5606186870d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthApiModule-fbbddf458130c7cdf4b63596c4d50201ffdb076f4eec89c7361c4195de1f267e8042060b2dbb63b2f5cdf63de760521d114b5f1997af83c2dab2f5606186870d"' :
                                            'id="xs-controllers-links-module-AuthApiModule-fbbddf458130c7cdf4b63596c4d50201ffdb076f4eec89c7361c4195de1f267e8042060b2dbb63b2f5cdf63de760521d114b5f1997af83c2dab2f5606186870d"' }>
                                            <li class="link">
                                                <a href="controllers/AuthApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthApiModule-fbbddf458130c7cdf4b63596c4d50201ffdb076f4eec89c7361c4195de1f267e8042060b2dbb63b2f5cdf63de760521d114b5f1997af83c2dab2f5606186870d"' : 'data-bs-target="#xs-injectables-links-module-AuthApiModule-fbbddf458130c7cdf4b63596c4d50201ffdb076f4eec89c7361c4195de1f267e8042060b2dbb63b2f5cdf63de760521d114b5f1997af83c2dab2f5606186870d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthApiModule-fbbddf458130c7cdf4b63596c4d50201ffdb076f4eec89c7361c4195de1f267e8042060b2dbb63b2f5cdf63de760521d114b5f1997af83c2dab2f5606186870d"' :
                                        'id="xs-injectables-links-module-AuthApiModule-fbbddf458130c7cdf4b63596c4d50201ffdb076f4eec89c7361c4195de1f267e8042060b2dbb63b2f5cdf63de760521d114b5f1997af83c2dab2f5606186870d"' }>
                                        <li class="link">
                                            <a href="injectables/AuthApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthApiService</a>
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
                                        'data-bs-target="#injectables-links-module-AuthModule-1220292e5f899b6783780bdc42e12363f789069f25b67cc4664a76155aef56d8169c8e76d8bf13bebcff857bd61f25f77c9698af5471ec24855a21303491a7cb"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-1220292e5f899b6783780bdc42e12363f789069f25b67cc4664a76155aef56d8169c8e76d8bf13bebcff857bd61f25f77c9698af5471ec24855a21303491a7cb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-1220292e5f899b6783780bdc42e12363f789069f25b67cc4664a76155aef56d8169c8e76d8bf13bebcff857bd61f25f77c9698af5471ec24855a21303491a7cb"' :
                                        'id="xs-injectables-links-module-AuthModule-1220292e5f899b6783780bdc42e12363f789069f25b67cc4664a76155aef56d8169c8e76d8bf13bebcff857bd61f25f77c9698af5471ec24855a21303491a7cb"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DatabaseModule-fb01083117890ec3d848fc38a506b58765172a5b37e1413ad015e3d980333bebc0886529a6bf98cea9b0c9066d68dc9a45e4f8198d84d1c0f639fc0d6b7da4f2"' : 'data-bs-target="#xs-injectables-links-module-DatabaseModule-fb01083117890ec3d848fc38a506b58765172a5b37e1413ad015e3d980333bebc0886529a6bf98cea9b0c9066d68dc9a45e4f8198d84d1c0f639fc0d6b7da4f2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DatabaseModule-fb01083117890ec3d848fc38a506b58765172a5b37e1413ad015e3d980333bebc0886529a6bf98cea9b0c9066d68dc9a45e4f8198d84d1c0f639fc0d6b7da4f2"' :
                                        'id="xs-injectables-links-module-DatabaseModule-fb01083117890ec3d848fc38a506b58765172a5b37e1413ad015e3d980333bebc0886529a6bf98cea9b0c9066d68dc9a45e4f8198d84d1c0f639fc0d6b7da4f2"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaDatasource.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaDatasource</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EmailApiModule.html" data-type="entity-link" >EmailApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EmailApiModule-808370c3bde490064bf52992da4acd7cbdb592db8a979b62b2c280af37d6d029ec7065b346892ae9ad01f7f974b0167d9919654c5af8b122703af893f8b01761"' : 'data-bs-target="#xs-controllers-links-module-EmailApiModule-808370c3bde490064bf52992da4acd7cbdb592db8a979b62b2c280af37d6d029ec7065b346892ae9ad01f7f974b0167d9919654c5af8b122703af893f8b01761"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EmailApiModule-808370c3bde490064bf52992da4acd7cbdb592db8a979b62b2c280af37d6d029ec7065b346892ae9ad01f7f974b0167d9919654c5af8b122703af893f8b01761"' :
                                            'id="xs-controllers-links-module-EmailApiModule-808370c3bde490064bf52992da4acd7cbdb592db8a979b62b2c280af37d6d029ec7065b346892ae9ad01f7f974b0167d9919654c5af8b122703af893f8b01761"' }>
                                            <li class="link">
                                                <a href="controllers/EmailApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EmailApiModule-808370c3bde490064bf52992da4acd7cbdb592db8a979b62b2c280af37d6d029ec7065b346892ae9ad01f7f974b0167d9919654c5af8b122703af893f8b01761"' : 'data-bs-target="#xs-injectables-links-module-EmailApiModule-808370c3bde490064bf52992da4acd7cbdb592db8a979b62b2c280af37d6d029ec7065b346892ae9ad01f7f974b0167d9919654c5af8b122703af893f8b01761"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EmailApiModule-808370c3bde490064bf52992da4acd7cbdb592db8a979b62b2c280af37d6d029ec7065b346892ae9ad01f7f974b0167d9919654c5af8b122703af893f8b01761"' :
                                        'id="xs-injectables-links-module-EmailApiModule-808370c3bde490064bf52992da4acd7cbdb592db8a979b62b2c280af37d6d029ec7065b346892ae9ad01f7f974b0167d9919654c5af8b122703af893f8b01761"' }>
                                        <li class="link">
                                            <a href="injectables/EmailApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailApiService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
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
                                <a href="modules/OnboardingModule.html" data-type="entity-link" >OnboardingModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OnboardingModule-0c6d47e889e3fe1664b75531f2452e9d8fc2fc48751e8f512a8728b3c15db64d0ece02c8c237879fc5080cee4aab77bcb94d6da804e0717a78f00a42159f1289"' : 'data-bs-target="#xs-controllers-links-module-OnboardingModule-0c6d47e889e3fe1664b75531f2452e9d8fc2fc48751e8f512a8728b3c15db64d0ece02c8c237879fc5080cee4aab77bcb94d6da804e0717a78f00a42159f1289"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OnboardingModule-0c6d47e889e3fe1664b75531f2452e9d8fc2fc48751e8f512a8728b3c15db64d0ece02c8c237879fc5080cee4aab77bcb94d6da804e0717a78f00a42159f1289"' :
                                            'id="xs-controllers-links-module-OnboardingModule-0c6d47e889e3fe1664b75531f2452e9d8fc2fc48751e8f512a8728b3c15db64d0ece02c8c237879fc5080cee4aab77bcb94d6da804e0717a78f00a42159f1289"' }>
                                            <li class="link">
                                                <a href="controllers/OnboardingController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OnboardingController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OnboardingModule-0c6d47e889e3fe1664b75531f2452e9d8fc2fc48751e8f512a8728b3c15db64d0ece02c8c237879fc5080cee4aab77bcb94d6da804e0717a78f00a42159f1289"' : 'data-bs-target="#xs-injectables-links-module-OnboardingModule-0c6d47e889e3fe1664b75531f2452e9d8fc2fc48751e8f512a8728b3c15db64d0ece02c8c237879fc5080cee4aab77bcb94d6da804e0717a78f00a42159f1289"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OnboardingModule-0c6d47e889e3fe1664b75531f2452e9d8fc2fc48751e8f512a8728b3c15db64d0ece02c8c237879fc5080cee4aab77bcb94d6da804e0717a78f00a42159f1289"' :
                                        'id="xs-injectables-links-module-OnboardingModule-0c6d47e889e3fe1664b75531f2452e9d8fc2fc48751e8f512a8728b3c15db64d0ece02c8c237879fc5080cee4aab77bcb94d6da804e0717a78f00a42159f1289"' }>
                                        <li class="link">
                                            <a href="injectables/AuditInterceptor.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditInterceptor</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OnboardingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OnboardingService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PermissionsModule.html" data-type="entity-link" >PermissionsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PermissionsModule-1b25250dc94b6f2ae6e2fb124e233bb0821b680342f06a90f9b6c2f672969361f7803c56aedb9796e0cc463036d8adcaebec6d478aa99831bf60be1af0744daa"' : 'data-bs-target="#xs-controllers-links-module-PermissionsModule-1b25250dc94b6f2ae6e2fb124e233bb0821b680342f06a90f9b6c2f672969361f7803c56aedb9796e0cc463036d8adcaebec6d478aa99831bf60be1af0744daa"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PermissionsModule-1b25250dc94b6f2ae6e2fb124e233bb0821b680342f06a90f9b6c2f672969361f7803c56aedb9796e0cc463036d8adcaebec6d478aa99831bf60be1af0744daa"' :
                                            'id="xs-controllers-links-module-PermissionsModule-1b25250dc94b6f2ae6e2fb124e233bb0821b680342f06a90f9b6c2f672969361f7803c56aedb9796e0cc463036d8adcaebec6d478aa99831bf60be1af0744daa"' }>
                                            <li class="link">
                                                <a href="controllers/PermissionsAssignmentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionsAssignmentController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/PermissionsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PermissionsModule-1b25250dc94b6f2ae6e2fb124e233bb0821b680342f06a90f9b6c2f672969361f7803c56aedb9796e0cc463036d8adcaebec6d478aa99831bf60be1af0744daa"' : 'data-bs-target="#xs-injectables-links-module-PermissionsModule-1b25250dc94b6f2ae6e2fb124e233bb0821b680342f06a90f9b6c2f672969361f7803c56aedb9796e0cc463036d8adcaebec6d478aa99831bf60be1af0744daa"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PermissionsModule-1b25250dc94b6f2ae6e2fb124e233bb0821b680342f06a90f9b6c2f672969361f7803c56aedb9796e0cc463036d8adcaebec6d478aa99831bf60be1af0744daa"' :
                                        'id="xs-injectables-links-module-PermissionsModule-1b25250dc94b6f2ae6e2fb124e233bb0821b680342f06a90f9b6c2f672969361f7803c56aedb9796e0cc463036d8adcaebec6d478aa99831bf60be1af0744daa"' }>
                                        <li class="link">
                                            <a href="injectables/AuditInterceptor.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditInterceptor</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PermissionsAssignmentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionsAssignmentService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PermissionsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RolesModule.html" data-type="entity-link" >RolesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-RolesModule-1a15457731127e0ea9d668e0612680d76ccba0d983314f0075d3be006f6688762d5c5b85b44f40e79d3f11b7feaf8b9541fdd88fe53198ab40cffb0f3b5e22b3"' : 'data-bs-target="#xs-controllers-links-module-RolesModule-1a15457731127e0ea9d668e0612680d76ccba0d983314f0075d3be006f6688762d5c5b85b44f40e79d3f11b7feaf8b9541fdd88fe53198ab40cffb0f3b5e22b3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RolesModule-1a15457731127e0ea9d668e0612680d76ccba0d983314f0075d3be006f6688762d5c5b85b44f40e79d3f11b7feaf8b9541fdd88fe53198ab40cffb0f3b5e22b3"' :
                                            'id="xs-controllers-links-module-RolesModule-1a15457731127e0ea9d668e0612680d76ccba0d983314f0075d3be006f6688762d5c5b85b44f40e79d3f11b7feaf8b9541fdd88fe53198ab40cffb0f3b5e22b3"' }>
                                            <li class="link">
                                                <a href="controllers/RolesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RolesModule-1a15457731127e0ea9d668e0612680d76ccba0d983314f0075d3be006f6688762d5c5b85b44f40e79d3f11b7feaf8b9541fdd88fe53198ab40cffb0f3b5e22b3"' : 'data-bs-target="#xs-injectables-links-module-RolesModule-1a15457731127e0ea9d668e0612680d76ccba0d983314f0075d3be006f6688762d5c5b85b44f40e79d3f11b7feaf8b9541fdd88fe53198ab40cffb0f3b5e22b3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RolesModule-1a15457731127e0ea9d668e0612680d76ccba0d983314f0075d3be006f6688762d5c5b85b44f40e79d3f11b7feaf8b9541fdd88fe53198ab40cffb0f3b5e22b3"' :
                                        'id="xs-injectables-links-module-RolesModule-1a15457731127e0ea9d668e0612680d76ccba0d983314f0075d3be006f6688762d5c5b85b44f40e79d3f11b7feaf8b9541fdd88fe53198ab40cffb0f3b5e22b3"' }>
                                        <li class="link">
                                            <a href="injectables/AuditInterceptor.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditInterceptor</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RolesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesService</a>
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
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-414163e6d8bf78cdd4b56034284147abc7b512a0b2640a21ba6ebe3644cb81f3182a722a7ac900048b863f9b357b30c20451c7f2eb1d2e1620d6c7c1998c6ad7"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-414163e6d8bf78cdd4b56034284147abc7b512a0b2640a21ba6ebe3644cb81f3182a722a7ac900048b863f9b357b30c20451c7f2eb1d2e1620d6c7c1998c6ad7"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-414163e6d8bf78cdd4b56034284147abc7b512a0b2640a21ba6ebe3644cb81f3182a722a7ac900048b863f9b357b30c20451c7f2eb1d2e1620d6c7c1998c6ad7"' :
                                            'id="xs-controllers-links-module-UsersModule-414163e6d8bf78cdd4b56034284147abc7b512a0b2640a21ba6ebe3644cb81f3182a722a7ac900048b863f9b357b30c20451c7f2eb1d2e1620d6c7c1998c6ad7"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-414163e6d8bf78cdd4b56034284147abc7b512a0b2640a21ba6ebe3644cb81f3182a722a7ac900048b863f9b357b30c20451c7f2eb1d2e1620d6c7c1998c6ad7"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-414163e6d8bf78cdd4b56034284147abc7b512a0b2640a21ba6ebe3644cb81f3182a722a7ac900048b863f9b357b30c20451c7f2eb1d2e1620d6c7c1998c6ad7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-414163e6d8bf78cdd4b56034284147abc7b512a0b2640a21ba6ebe3644cb81f3182a722a7ac900048b863f9b357b30c20451c7f2eb1d2e1620d6c7c1998c6ad7"' :
                                        'id="xs-injectables-links-module-UsersModule-414163e6d8bf78cdd4b56034284147abc7b512a0b2640a21ba6ebe3644cb81f3182a722a7ac900048b863f9b357b30c20451c7f2eb1d2e1620d6c7c1998c6ad7"' }>
                                        <li class="link">
                                            <a href="injectables/AuditInterceptor.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditInterceptor</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-1d4dbf23eec6d13367819726d855c6053ecd456ef745306b0943c79b41f0682ff9124d940af3aa7f3f2b93f506ea9681079f657aeef501379adc279c63331dcb-1"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-1d4dbf23eec6d13367819726d855c6053ecd456ef745306b0943c79b41f0682ff9124d940af3aa7f3f2b93f506ea9681079f657aeef501379adc279c63331dcb-1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-1d4dbf23eec6d13367819726d855c6053ecd456ef745306b0943c79b41f0682ff9124d940af3aa7f3f2b93f506ea9681079f657aeef501379adc279c63331dcb-1"' :
                                        'id="xs-injectables-links-module-UsersModule-1d4dbf23eec6d13367819726d855c6053ecd456ef745306b0943c79b41f0682ff9124d940af3aa7f3f2b93f506ea9681079f657aeef501379adc279c63331dcb-1"' }>
                                        <li class="link">
                                            <a href="injectables/UsersRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
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
                                    <a href="controllers/EmailApiController.html" data-type="entity-link" >EmailApiController</a>
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
                                    <a href="controllers/PermissionsAssignmentController.html" data-type="entity-link" >PermissionsAssignmentController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PermissionsController.html" data-type="entity-link" >PermissionsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/RolesController.html" data-type="entity-link" >RolesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UsersController.html" data-type="entity-link" >UsersController</a>
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
                                <a href="classes/AssignPermissionToRoleRequestDto.html" data-type="entity-link" >AssignPermissionToRoleRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AssignPermissionToUserRequestDto.html" data-type="entity-link" >AssignPermissionToUserRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateExampleRequestDto.html" data-type="entity-link" >CreateExampleRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateExampleResponseDto.html" data-type="entity-link" >CreateExampleResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePermissionRequestDto.html" data-type="entity-link" >CreatePermissionRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRoleRequestDto.html" data-type="entity-link" >CreateRoleRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserRequestDto.html" data-type="entity-link" >CreateUserRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CryptoHelper.html" data-type="entity-link" >CryptoHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomHttpResponseHelper.html" data-type="entity-link" >CustomHttpResponseHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailHelper.html" data-type="entity-link" >EmailHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailSendRequestDto.html" data-type="entity-link" >EmailSendRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ForgotUserPasswordDto.html" data-type="entity-link" >ForgotUserPasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginUserDto.html" data-type="entity-link" >LoginUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginUserResponseDto.html" data-type="entity-link" >LoginUserResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OnboardingUserRequestDto.html" data-type="entity-link" >OnboardingUserRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionAssignedResponseDto.html" data-type="entity-link" >PermissionAssignedResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionResponseDto.html" data-type="entity-link" >PermissionResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrismaBaseRepository.html" data-type="entity-link" >PrismaBaseRepository</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrismaBaseService.html" data-type="entity-link" >PrismaBaseService</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleResponseDto.html" data-type="entity-link" >RoleResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatePermissionRequestDto.html" data-type="entity-link" >UpdatePermissionRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateRoleRequestDto.html" data-type="entity-link" >UpdateRoleRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserPasswordDto.html" data-type="entity-link" >UpdateUserPasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserRequestDto.html" data-type="entity-link" >UpdateUserRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserHelper.html" data-type="entity-link" >UserHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserResponseDto.html" data-type="entity-link" >UserResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserScopeResponseDto.html" data-type="entity-link" >UserScopeResponseDto</a>
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
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmailApiService.html" data-type="entity-link" >EmailApiService</a>
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
                                    <a href="injectables/OnboardingService.html" data-type="entity-link" >OnboardingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PermissionsAssignmentService.html" data-type="entity-link" >PermissionsAssignmentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PermissionsService.html" data-type="entity-link" >PermissionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrismaDatasource.html" data-type="entity-link" >PrismaDatasource</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolesService.html" data-type="entity-link" >RolesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TemplateEditorService.html" data-type="entity-link" >TemplateEditorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TraceIdMiddleware.html" data-type="entity-link" >TraceIdMiddleware</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersRepository.html" data-type="entity-link" >UsersRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService-1.html" data-type="entity-link" >UsersService</a>
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
                                <a href="interfaces/CompoDocConfig.html" data-type="entity-link" >CompoDocConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuthenticatedRequest.html" data-type="entity-link" >IAuthenticatedRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IChangePasswordPayload.html" data-type="entity-link" >IChangePasswordPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICookies.html" data-type="entity-link" >ICookies</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICreatePasswordPayload.html" data-type="entity-link" >ICreatePasswordPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IForgotPasswordPayload.html" data-type="entity-link" >IForgotPasswordPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IJwtPayload.html" data-type="entity-link" >IJwtPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPasswordPayload.html" data-type="entity-link" >IPasswordPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRefreshTokenPayload.html" data-type="entity-link" >IRefreshTokenPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISendEmailOptions.html" data-type="entity-link" >ISendEmailOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PackageJson.html" data-type="entity-link" >PackageJson</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PackageJson-1.html" data-type="entity-link" >PackageJson</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Template.html" data-type="entity-link" >Template</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserCredentialInterface.html" data-type="entity-link" >UserCredentialInterface</a>
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