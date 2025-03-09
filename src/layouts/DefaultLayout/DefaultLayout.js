import { isMobile } from 'react-device-detect';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Divider, Drawer, Dropdown, Flex, Layout, Menu, Spin, Tooltip, notification, theme } from 'antd';
import {
    IconBox,
    IconApi,
    IconWallet,
    IconServer2,
    IconTemplate,
    IconAlignLeft,
    IconBorderAll,
    IconAlignRight,
    IconUsersGroup,
    IconSourceCode,
    IconShoppingBag,
    IconSettingsCog,
    IconBuildingBank,
    IconCreditCardPay,
    IconNotification,
} from '@tabler/icons-react';

import './DefaultLayout.css';
import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import imageLogo from '~/assets/image/logo.png';
import ProfileMenu from '../components/ProfileMenu';
import Notification from '../components/Notification';
import { requestGetCurrentAuth } from '~/services/auth';
import imageAvatarDefault from '~/assets/image/avatar-default.png';
import { loginAuthSuccess, logoutAuthSuccess } from '~/redux/reducer/auth';

const { Content, Sider, Header } = Layout;

function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}

const items = [
    getItem(<Link to={router.home}>Trang chủ</Link>, router.home, <IconBorderAll />),
    getItem('Tài khoản', 'sub-2', <IconUsersGroup />, [
        getItem(<Link to={router.memberships}>Nhóm</Link>, router.memberships),
        getItem(<Link to={router.users}>Người dùng</Link>, router.users),
        getItem(<Link to={router.users_histories}>Lịch sử đăng nhập</Link>, router.users_histories),
    ]),
    getItem('Thông báo', 'sub-3', <IconNotification />, [
        getItem(<Link to={router.notification_web}>Danh sách</Link>, router.notification_web),
    ]),
    getItem('Ví điện tử', 'sub-4', <IconWallet />, [
        getItem(<Link to={router.wallets}>Danh sách ví</Link>, router.wallets),
        getItem(<Link to={router.wallets_bonus_points}>Điểm thưởng</Link>, router.wallets_bonus_points),
        getItem(<Link to={router.wallets_histories}>Lịch sử ví</Link>, router.wallets_histories),
    ]),
    getItem('Ngân hàng', 'sub-5', <IconBuildingBank />, [
        getItem(<Link to={router.localbank}>Danh sách ngân hàng</Link>, router.localbank),
        getItem(<Link to={router.localbank_users}>Ngân hàng thành viên</Link>, router.localbank_users),
    ]),
    getItem('Thanh toán', 'sub-6', <IconCreditCardPay />, [
        getItem(<Link to={router.invoices}>Hoá đơn</Link>, router.invoices),
        getItem(<Link to={router.chargings}>Nạp thẻ</Link>, router.chargings),
    ]),
    getItem('Đơn hàng', 'sub-7', <IconShoppingBag />, [
        getItem(<Link to={router.cart}>Giỏ hàng</Link>, router.cart),
        getItem(<Link to={router.orders}>Danh sách</Link>, router.orders),
    ]),
    getItem('Cloud server', 'sub-8', <IconServer2 />, [
        getItem(<Link to={router.cloud_server_region}>Khu vực</Link>, router.cloud_server_region),
        getItem(<Link to={router.cloud_server_product}>Cấu hình</Link>, router.cloud_server_product),
        getItem(<Link to={router.cloud_server_image}>Hệ điều hành</Link>, router.cloud_server_image),
        getItem(<Link to={router.cloud_server_orders}>Đơn máy chủ</Link>, router.cloud_server_orders),
    ]),
    getItem('Mẫu Website', 'sub-9', <IconTemplate />, [
        getItem(<Link to={router.templates}>Danh sách</Link>, router.templates),
        getItem(<Link to={router.templates_orders}>Đơn tạo website</Link>, router.templates_orders),
    ]),
    getItem('Mã nguồn', 'sub-10', <IconSourceCode />, [
        getItem(<Link to={router.sources}>Danh sách</Link>, router.sources),
        getItem(<Link to={router.sources_orders}>Đơn đã mua</Link>, router.sources_orders),
    ]),
    getItem('Public API', 'sub-12', <IconApi />, [
        getItem(<Link to={router.apikey}>Apikey</Link>, router.apikey),
        getItem(<Link to={router.apis}>Danh sách</Link>, router.apis),
    ]),
    getItem('Mô-đun khác', 'sub-14', <IconBox />, [
        getItem(<Link to={router.tokens}>Token</Link>, router.tokens),
        getItem(<Link to={router.cycles}>Chu kỳ</Link>, router.cycles),
        getItem(<Link to={router.pricing}>Giá cả</Link>, router.pricing),
        getItem(<Link to={router.coupon}>Khuyễn mãi</Link>, router.coupon),
    ]),
    getItem('Cấu hình', 'sub-15', <IconSettingsCog />, [
        getItem(<Link to={router.partners}>Đối tác</Link>, router.partners),
        getItem(<Link to={router.settings_info}>Cài đặt</Link>, router.settings_info),
        getItem(<Link to={router.paygates}>Cổng thanh toán</Link>, router.paygates),
    ]),
];

function DefaultLayout({ children }) {
    const { pathname } = useLocation();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(isMobile);
    const [current, setCurrent] = useState(() => pathname);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.auth);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        const fetch = async () => {
            try {
                const result = await requestGetCurrentAuth();

                if (result.status === 200) {
                    dispatch(loginAuthSuccess(result.data));
                } else {
                    dispatch(logoutAuthSuccess());
                    navigate(`${router.login}?redirect_url=${pathname}`);

                    notification.error({
                        message: 'Thông báo',
                        description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                    });
                }
            } catch (error) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);

                notification.error({
                    message: 'Thông báo',
                    description: 'Lỗi hệ thống vui lòng thử lại sau',
                });
            } finally {
                setLoading(false);
            }
        };
        fetch();

        const intervalId = setInterval(fetch, 8000);

        return () => clearInterval(intervalId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleCollapsed = () => {
        if (isMobile) {
            setOpen(!open);
        } else {
            if (collapsed) {
                setCollapsed(false);
                document.querySelector('.default-content').classList.remove('active');
            } else {
                setCollapsed(true);
                document.querySelector('.default-content').classList.add('active');
            }
        }
    };

    const onClickMenu = (e) => {
        setCurrent(e.key);

        if (isMobile) {
            setOpen(false);
        }
    };

    return (
        <Fragment>
            {loading ? (
                <Flex align="center" justify="center" style={{ height: '70vh' }}>
                    <Spin />
                </Flex>
            ) : (
                <Layout>
                    <Header
                        className="default__header"
                        style={{ background: colorBgContainer, width: '100%', paddingLeft: 10, paddingRight: 20 }}
                    >
                        <div className="default__header-hr"></div>
                        <Flex align="center" justify="space-between" style={{ height: '100%' }}>
                            <div className="default__header-logo">
                                <span className="default-btn" onClick={toggleCollapsed}>
                                    {collapsed ? <IconAlignLeft className="text-subtitle" /> : <IconAlignRight className="text-subtitle" />}
                                </span>
                                <Link to={router.home}>
                                    <div className="header__logo-pc">
                                        <img src={imageLogo} alt="Trang chủ" className="header__logo-mobile" />
                                    </div>
                                </Link>
                            </div>

                            <Flex align="center" className="h-full">
                                <Notification currentUser={currentUser} />

                                <Divider type="vertical" className="ml-3 mr-0" style={{ height: 20 }} />

                                <div className="default__header-item d-none-tablet">
                                    <div className="box-header-text">
                                        <Tooltip title="Số dư có thể rút">
                                            <div>
                                                <div className="font-size-10 font-semibold line-height-12">Số dư chính</div>
                                                <div className="font-semibold line-height-14 font-size-13 text-warning text-center">
                                                    {convertCurrency(currentUser?.wallet.main_balance)}
                                                </div>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="default__header-item d-none-tablet">
                                    <div className="box-header-text">
                                        <div>
                                            <div className="font-size-10 font-semibold line-height-12">Số dư hiện tại</div>
                                            <div className="font-semibold line-height-14 font-size-13 text-primary text-center">
                                                {convertCurrency(currentUser?.wallet.total_balance)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Dropdown
                                    dropdownRender={() => (
                                        <Fragment>
                                            <ProfileMenu />
                                        </Fragment>
                                    )}
                                    placement="bottomLeft"
                                    className="default__header-item"
                                    trigger={['click']}
                                >
                                    <Avatar
                                        src={currentUser?.avatar_url || imageAvatarDefault}
                                        style={{ cursor: 'pointer', width: 35, height: 35, lineHeight: 35 }}
                                    />
                                </Dropdown>
                            </Flex>
                        </Flex>
                    </Header>
                    <Layout>
                        {isMobile ? (
                            <Drawer
                                title={
                                    <Link to={router.home} onClick={() => setOpen(false)}>
                                        <img src={imageLogo} alt="Trang chủ" className="header__logo-mobile" />
                                    </Link>
                                }
                                open={open}
                                placement="left"
                                onClose={() => setOpen(false)}
                                width={'70%'}
                                style={{ maxWidth: 320, minWidth: 270 }}
                                className="header-drawer"
                            >
                                <Menu
                                    selectedKeys={[current]}
                                    onClick={(e) => onClickMenu(e)}
                                    defaultOpenKeys={['1']}
                                    mode="inline"
                                    className="menu-sidebar"
                                    items={items}
                                />
                            </Drawer>
                        ) : (
                            <Sider
                                trigger={null}
                                collapsible
                                collapsed={collapsed}
                                theme="line"
                                className="default-sider"
                                width={230}
                                style={{
                                    background: colorBgContainer,
                                    minHeight: 'calc(100vh - 116px)',
                                    position: 'fixed',
                                }}
                            >
                                <div className="default-menu">MENU</div>
                                <Menu
                                    selectedKeys={[current]}
                                    onClick={(e) => setCurrent(e.key)}
                                    defaultOpenKeys={['1']}
                                    mode="inline"
                                    items={items}
                                    className="menu-sidebar"
                                    style={{
                                        overflowX: 'hidden',
                                        overflowY: 'auto',
                                        height: 'calc(100vh - 120px)',
                                    }}
                                />
                            </Sider>
                        )}
                        <Content
                            className="default-content"
                            style={{
                                padding: 20,
                                borderRadius: borderRadiusLG,
                                minHeight: 'calc(100vh - 64px)',
                            }}
                        >
                            {children}
                        </Content>
                    </Layout>
                </Layout>
            )}
        </Fragment>
    );
}

export default DefaultLayout;
