import router from '~/configs/routes';

import Home from '~/layouts/Home';
import NotFound from '~/layouts/NotFound';
import Login from '~/layouts/components/Login';

import Apis from '~/pages/apiPage/Apis';
import Account from '~/pages/apiPage/Account';
import Document from '~/pages/apiPage/Document';
import Requests from '~/pages/apiPage/Requests';

import Cart from '~/pages/orderPage/Cart';
import Orders from '~/pages/orderPage/Orders';

import Users from '~/pages/accountPage/Users';
import Membership from '~/pages/accountPage/Membership';
import LoginHistory from '~/pages/accountPage/LoginHistory';

import Partner from '~/pages/partnerPage/Partner';
import Service from '~/pages/partnerPage/Service';

import NotificationWeb from '~/pages/notiPage/NotificationWeb';
import NotificationEmail from '~/pages/notiPage/NotificationEmail';

import Token from '~/pages/modulePage/Token';
import Cycles from '~/pages/modulePage/Cycles';
import Coupon from '~/pages/modulePage/Coupon';
import ApiKeys from '~/pages/modulePage/Apikey';
import Pricing from '~/pages/modulePage/Pricing';

import Paygate from '~/pages/configPage/Paygate';
import NewFeed from '~/pages/configPage/NewsFeed';
import Options from '~/pages/configPage/Paygate/Options';
import SettingInfo from '~/pages/configPage/Setting/SettingInfo';
import OtherConfig from '~/pages/configPage/Setting/OtherConfig';
import SettingSendMail from '~/pages/configPage/Setting/SettingSendMail';
import PublishNewsFeed from '~/pages/configPage/NewsFeed/PublishNewsFeed';

import SourcePublished from '~/pages/sourcePage/SourcePublished';
import SourceUnpublished from '~/pages/sourcePage/SourceUnpublished';

import Invoices from '~/pages/payPage/Invoices';

import Wallets from '~/pages/walletPage/Wallets';
import Withdrawal from '~/pages/walletPage/Withdrawal';
import BonusPoint from '~/pages/walletPage/BonusPoint';
import WalletHistory from '~/pages/walletPage/WalletHistory';

import Databases from '~/pages/databasePage/Databases';

import Userbank from '~/pages/bankPage/Userbank';
import Localbank from '~/pages/bankPage/Localbank';

import Template from '~/pages/templatePage/Template';
import OrderTemplate from '~/pages/templatePage/OrderTemplate';

import ServerPlans from '~/pages/cloudServerPage/Plans';
import ServerImages from '~/pages/cloudServerPage/Images';
import ServerOrders from '~/pages/cloudServerPage/Orders';
import ServerRegions from '~/pages/cloudServerPage/Regions';
import ServerPartners from '~/pages/cloudServerPage/Partners';
import ServerProducts from '~/pages/cloudServerPage/Products';

import ResourceProduct from '~/pages/resourcePage/Product';
import ResourceAccount from '~/pages/resourcePage/Account';
import ResourceCategory from '~/pages/resourcePage/Category';

export const privateRoutes = [
    { path: '*', component: NotFound },
    { path: router.apis, component: Apis },
    { path: router.home, component: Home },
    { path: router.cart, component: Cart },
    { path: router.users, component: Users },
    { path: router.tokens, component: Token },
    { path: router.coupon, component: Coupon },
    { path: router.cycles, component: Cycles },
    { path: router.orders, component: Orders },
    { path: router.apikey, component: ApiKeys },
    { path: router.pricing, component: Pricing },
    { path: router.wallets, component: Wallets },
    { path: router.paygates, component: Paygate },
    { path: router.partners, component: Partner },
    { path: router.invoices, component: Invoices },
    { path: router.templates, component: Template },
    { path: router.news_feeds, component: NewFeed },
    { path: router.databases, component: Databases },
    { path: router.localbank, component: Localbank },
    { path: router.memberships, component: Membership },
    { path: router.localbank_users, component: Userbank },
    { path: router.partners_services, component: Service },
    { path: router.login, component: Login, layout: null },
    { path: router.settings_info, component: SettingInfo },
    { path: router.settings_other, component: OtherConfig },
    { path: router.resources, component: ResourceCategory },
    { path: router.users_histories, component: LoginHistory },
    { path: router.cloud_server_plan, component: ServerPlans },
    { path: router.wallets_withdrawal, component: Withdrawal },
    { path: router.apis_players + '/:id', component: Account },
    { path: router.templates_orders, component: OrderTemplate },
    { path: router.settings_email, component: SettingSendMail },
    { path: router.wallets_bonus_points, component: BonusPoint },
    { path: router.apis_requests + '/:id', component: Requests },
    { path: router.apis_document + '/:id', component: Document },
    { path: router.wallets_histories, component: WalletHistory },
    { path: router.cloud_server_image, component: ServerImages },
    { path: router.notification_web, component: NotificationWeb },
    { path: router.cloud_server_orders, component: ServerOrders },
    { path: router.cloud_server_region, component: ServerRegions },
    { path: router.sources_published, component: SourcePublished },
    { path: router.paygates + '/options/:id', component: Options },
    { path: router.resources_products, component: ResourceProduct },
    { path: router.resources_accounts, component: ResourceAccount },
    { path: router.cloud_server_product, component: ServerProducts },
    { path: router.cloud_server_partner, component: ServerPartners },
    { path: router.notification_email, component: NotificationEmail },
    { path: router.sources_unpublished, component: SourceUnpublished },
    { path: router.news_feeds + '/create', component: PublishNewsFeed },
    { path: router.news_feeds + '/edit/:id', component: PublishNewsFeed },
];
