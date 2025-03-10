import router from '~/configs/routes';

import Home from '~/layouts/Home';
import NotFound from '~/layouts/NotFound';
import Login from '~/layouts/components/Login';

import Apis from '~/pages/apiPage/Apis';
import ApiKeys from '~/pages/apiPage/Apikey';
import Account from '~/pages/apiPage/Account';
import Requests from '~/pages/apiPage/Requests';

import Cart from '~/pages/orderPage/Cart';
import Orders from '~/pages/orderPage/Orders';

import Users from '~/pages/accountPage/Users';
import Membership from '~/pages/accountPage/Membership';
import LoginHistory from '~/pages/accountPage/LoginHistory';

import NotificationWeb from '~/pages/notiPage/NotificationWeb';

import Token from '~/pages/modulePage/Token';
import Cycles from '~/pages/modulePage/Cycles';
import Coupon from '~/pages/modulePage/Coupon';
import Pricing from '~/pages/modulePage/Pricing';

import Paygate from '~/pages/configPage/Paygate';
import Partners from '~/pages/configPage/Partners';
import Options from '~/pages/configPage/Paygate/Options';
import SettingInfo from '~/pages/configPage/Setting/SettingInfo';
import OtherConfig from '~/pages/configPage/Setting/OtherConfig';
import SettingSendMail from '~/pages/configPage/Setting/SettingSendMail';

import Sources from '~/pages/sourcePage/Sources';
import OrderSource from '~/pages/sourcePage/OrderSource';

import Invoices from '~/pages/payPage/Invoices';
import Charging from '~/pages/payPage/Charging';

import Wallets from '~/pages/walletPage/Wallets';
import BonusPoint from '~/pages/walletPage/BonusPoint';
import WalletHistory from '~/pages/walletPage/WalletHistory';

import Userbank from '~/pages/bankPage/Userbank';
import Localbank from '~/pages/bankPage/Localbank';

import Template from '~/pages/templatePage/Template';
import OrderTemplate from '~/pages/templatePage/OrderTemplate';

import ServerImages from '~/pages/cloudServerPage/Images';
import ServerOrders from '~/pages/cloudServerPage/Orders';
import ServerRegions from '~/pages/cloudServerPage/Regions';
import ServerProducts from '~/pages/cloudServerPage/Products';

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
    { path: router.sources, component: Sources },
    { path: router.pricing, component: Pricing },
    { path: router.wallets, component: Wallets },
    { path: router.paygates, component: Paygate },
    { path: router.partners, component: Partners },
    { path: router.invoices, component: Invoices },
    { path: router.chargings, component: Charging },
    { path: router.templates, component: Template },
    { path: router.localbank, component: Localbank },
    { path: router.memberships, component: Membership },
    { path: router.localbank_users, component: Userbank },
    { path: router.login, component: Login, layout: null },
    { path: router.settings_info, component: SettingInfo },
    { path: router.sources_orders, component: OrderSource },
    { path: router.settings_other, component: OtherConfig },
    { path: router.users_histories, component: LoginHistory },
    { path: router.apis_players + '/:id', component: Account },
    { path: router.templates_orders, component: OrderTemplate },
    { path: router.settings_email, component: SettingSendMail },
    { path: router.wallets_bonus_points, component: BonusPoint },
    { path: router.apis_requests + '/:id', component: Requests },
    { path: router.wallets_histories, component: WalletHistory },
    { path: router.cloud_server_image, component: ServerImages },
    { path: router.notification_web, component: NotificationWeb },
    { path: router.cloud_server_orders, component: ServerOrders },
    { path: router.cloud_server_region, component: ServerRegions },
    { path: router.paygates + '/options/:id', component: Options },
    { path: router.cloud_server_product, component: ServerProducts },
];
