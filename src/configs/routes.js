const apis = '/apis';
const users = '/users';
const cloud = '/cloud';
const wallets = '/wallets';
const sources = '/sources';
const settings = '/settings';
const templates = '/templates';
const histories = '/histories';
const localbank = '/localbank';

const router = {
    apis,
    users,
    cloud,
    wallets,
    templates,
    localbank,
    home: '/',
    cart: '/cart',
    login: '/login',
    cycles: '/cycles',
    tokens: '/tokens',
    orders: '/orders',
    apikey: '/apikey',
    coupon: '/coupon',
    pricing: '/pricing',
    paygates: '/paygates',
    invoices: '/invoices',
    partners: '/partners',
    memberships: '/memberships',
    apis_players: apis + '/players',
    cloud_server: cloud + '/server',
    apis_requests: apis + '/requests',
    settings_info: settings + '/info',
    localbank_users: localbank + users,
    settings_email: settings + '/email',
    settings_other: settings + '/other',
    notification_web: '/notification-web',
    wallets_histories: wallets + histories,
    templates_orders: templates + '/orders',
    sources_published: sources + '/published',
    localbank_histories: localbank + histories,
    users_histories: users + '/login-histories',
    cloud_server_image: cloud + '-server/images',
    cloud_server_orders: cloud + '-server/orders',
    cloud_server_region: cloud + '-server/regions',
    wallets_bonus_points: wallets + '/bonus-points',
    cloud_server_product: cloud + '-server/products',
};

export default router;
