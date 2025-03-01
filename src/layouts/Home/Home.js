import moment from 'moment';
import { SettingOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Card, Col, Collapse, Flex, notification, Row, Spin, Tag } from 'antd';
import { IconUsersGroup, IconFileInvoice, IconShoppingBag, IconServer2, IconSourceCode, IconTemplate } from '@tabler/icons-react';

import './Home.css';
import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetDataDashboard } from '~/services/home';
import imageAvatarDefault from '~/assets/image/avatar-default.png';

function Home() {
    const [loading, setLoading] = useState(false);

    const [statistic, setStatistic] = useState({
        user: { total: 0, today: 0 },
        template: { total: 0, today: 0 },
        source: { total: 0, today: 0 },
        order: { total: 0, today: 0 },
        invoice: { total: 0, today: 0 },
        instance: { total: 0, today: 0 },
    });
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [requests, setRequests] = useState([]);
    const [instances, setInstances] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loginHistories, setLoginHistories] = useState([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const { currentUser } = useSelector((state) => state.auth);

    useEffect(() => {
        document.title = 'Quản trị website - Trang chủ website';

        setLoading(true);
        const fetch = async () => {
            const result = await requestAuthGetDataDashboard();

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setStatistic(result.data.statistic);
                setUsers(result.data.users);
                setOrders(result.data.orders);
                setInvoices(result.data.invoices);
                setRequests(result.data.requests);
                setInstances(result.data.instances);
                setTemplates(result.data.templates);
                setLoginHistories(result.data.login_histories);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };

        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Row style={{ margin: '0 -8px', rowGap: 16 }} className="dashboard">
            <Col md={18} style={{ padding: '0 8px' }}>
                {loading ? (
                    <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                        <Spin />
                    </Flex>
                ) : (
                    <Card className="rounded-15" styles={{ body: { padding: 18 } }} style={{ minHeight: 'calc(-120px + 100vh)' }}>
                        <div className="mb-8">
                            <h2 className="font-semibold font-size-20 mb-4">Bảng quảng trị</h2>

                            <Row
                                style={{
                                    marginLeft: -5,
                                    marginRight: -5,
                                    rowGap: 10,
                                }}
                            >
                                <Col md={8} xs={24} style={{ paddingLeft: 5, paddingRight: 5 }}>
                                    <Card styles={{ body: { padding: 16 } }}>
                                        <Flex className="gap-4" align="center">
                                            <Avatar
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    lineHeight: 50,
                                                    fontSize: 25,
                                                    background: '#096eff',
                                                }}
                                                icon={<IconUsersGroup size={28} />}
                                            />
                                            <div className="link-color flex-1">
                                                <h4 className="font-bold line-height-20 mb-0 font-size-16" style={{ color: '#096eff' }}>
                                                    {statistic.user.total} Người dùng
                                                </h4>
                                                <div className="line-height-20 font-bold">Hôm nay: {statistic.user.today}</div>
                                            </div>
                                        </Flex>
                                    </Card>
                                </Col>

                                <Col md={8} xs={24} style={{ paddingLeft: 5, paddingRight: 5 }}>
                                    <Card styles={{ body: { padding: 16 } }}>
                                        <Flex className="gap-4" align="center">
                                            <Avatar
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    lineHeight: 50,
                                                    fontSize: 25,
                                                    background: '#096eff',
                                                }}
                                                icon={<IconFileInvoice size={28} />}
                                            />
                                            <div className="link-color flex-1">
                                                <h4 className="font-bold line-height-20 mb-0 font-size-16" style={{ color: '#096eff' }}>
                                                    {statistic.invoice.total} Hoá đơn
                                                </h4>
                                                <div className="line-height-20 font-bold">Hôm nay: {statistic.invoice.today}</div>
                                            </div>
                                        </Flex>
                                    </Card>
                                </Col>
                                <Col md={8} xs={24} style={{ paddingLeft: 5, paddingRight: 5 }}>
                                    <Card styles={{ body: { padding: 16 } }}>
                                        <Flex className="gap-4" align="center">
                                            <Avatar
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    lineHeight: 50,
                                                    fontSize: 25,
                                                    background: '#096eff',
                                                }}
                                                icon={<IconShoppingBag size={28} />}
                                            />
                                            <div className="link-color flex-1">
                                                <h4 className="font-bold line-height-20 mb-0 font-size-16" style={{ color: '#096eff' }}>
                                                    {statistic.order.total} Đơn hàng
                                                </h4>
                                                <div className="line-height-20 font-bold">Hôm nay: {statistic.order.today}</div>
                                            </div>
                                        </Flex>
                                    </Card>
                                </Col>
                                <Col md={8} xs={24} style={{ paddingLeft: 5, paddingRight: 5 }}>
                                    <Card styles={{ body: { padding: 16 } }}>
                                        <Flex className="gap-4" align="center">
                                            <Avatar
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    lineHeight: 50,
                                                    fontSize: 25,
                                                    background: '#096eff',
                                                }}
                                                icon={<IconServer2 size={28} />}
                                            />
                                            <div className="link-color flex-1">
                                                <h4 className="font-bold line-height-20 mb-0 font-size-16" style={{ color: '#096eff' }}>
                                                    {statistic.instance.total} Instance
                                                </h4>
                                                <div className="line-height-20 font-bold">Hôm nay: {statistic.instance.today}</div>
                                            </div>
                                        </Flex>
                                    </Card>
                                </Col>
                                <Col md={8} xs={24} style={{ paddingLeft: 5, paddingRight: 5 }}>
                                    <Card styles={{ body: { padding: 16 } }}>
                                        <Flex className="gap-4" align="center">
                                            <Avatar
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    lineHeight: 50,
                                                    fontSize: 25,
                                                    background: '#096eff',
                                                }}
                                                icon={<IconSourceCode size={28} />}
                                            />
                                            <div className="link-color flex-1">
                                                <h4 className="font-bold line-height-20 mb-0 font-size-16" style={{ color: '#096eff' }}>
                                                    {statistic.source.total} Mã nguồn
                                                </h4>
                                                <div className="line-height-20 font-bold">Hôm nay: {statistic.source.today}</div>
                                            </div>
                                        </Flex>
                                    </Card>
                                </Col>
                                <Col md={8} xs={24} style={{ paddingLeft: 5, paddingRight: 5 }}>
                                    <Card styles={{ body: { padding: 16 } }}>
                                        <Flex className="gap-4" align="center">
                                            <Avatar
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    lineHeight: 50,
                                                    fontSize: 25,
                                                    background: '#096eff',
                                                }}
                                                icon={<IconTemplate size={28} />}
                                            />
                                            <div className="link-color flex-1">
                                                <h4 className="font-bold line-height-20 mb-0 font-size-16" style={{ color: '#096eff' }}>
                                                    {statistic.template.total} Tạo website
                                                </h4>
                                                <div className="line-height-20 font-bold">Hôm nay: {statistic.template.today}</div>
                                            </div>
                                        </Flex>
                                    </Card>
                                </Col>
                            </Row>
                        </div>

                        <Row style={{ margin: '0 -8px', rowGap: 8 }}>
                            <Col md={12} xs={24} style={{ padding: '0 8px' }}>
                                <Collapse
                                    defaultActiveKey={['1']}
                                    items={[
                                        {
                                            key: '1',
                                            label: <h4 className="font-size-16">Danh sách người dùng</h4>,
                                            children: (
                                                <Fragment>
                                                    <ul className="transfer-list">
                                                        {users.map((user) => (
                                                            <li key={user.id}>
                                                                <div>
                                                                    <b>{user.email}</b>
                                                                    <div className="font-size-13">
                                                                        {moment(user.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                                                    </div>
                                                                </div>
                                                                <Tag color="#28a745">{user.register_type.toUpperCase()}</Tag>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Fragment>
                                            ),
                                            showArrow: false,
                                            extra: <SettingOutlined />,
                                        },
                                    ]}
                                />
                            </Col>

                            <Col md={12} xs={24} style={{ padding: '0 8px' }}>
                                <Collapse
                                    defaultActiveKey={['1']}
                                    items={[
                                        {
                                            key: '1',
                                            label: <h4 className="font-size-16">Danh sách hoá đơn</h4>,
                                            children: (
                                                <Fragment>
                                                    <ul className="transfer-list">
                                                        {invoices.map((invoice) => (
                                                            <li key={invoice.id}>
                                                                <div>
                                                                    <b>{invoice.user_id.email}</b>
                                                                    <div className="font-size-13">
                                                                        {moment(invoice.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <span
                                                                        style={{
                                                                            marginRight: 0,
                                                                            color: invoice.total_payment > 0 ? '#28a745' : '#f44336',
                                                                        }}
                                                                    >
                                                                        {invoice.total_payment > 0 && '+'}
                                                                        {convertCurrency(invoice.total_payment)}
                                                                    </span>
                                                                    <div className="font-bold">{invoice.type.toUpperCase()}</div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Fragment>
                                            ),
                                            showArrow: false,
                                            extra: <SettingOutlined />,
                                        },
                                    ]}
                                />
                            </Col>

                            <Col md={12} xs={24} style={{ padding: '0 8px' }}>
                                <Collapse
                                    defaultActiveKey={['1']}
                                    items={[
                                        {
                                            key: '1',
                                            label: <h4 className="font-size-16">Danh sách đơn hàng</h4>,
                                            children: (
                                                <Fragment>
                                                    <ul className="transfer-list">
                                                        {orders.map((order) => (
                                                            <li key={order.id}>
                                                                <div>
                                                                    <b>{order.user_id.email}</b>
                                                                    <div className="font-size-13">
                                                                        {moment(order.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div>{convertCurrency(order.total_payment)}</div>
                                                                    <div className="font-bold">{order.pay_method}</div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Fragment>
                                            ),
                                            showArrow: false,
                                            extra: <SettingOutlined />,
                                        },
                                    ]}
                                />
                            </Col>

                            <Col md={12} xs={24} style={{ padding: '0 8px' }}>
                                <Collapse
                                    defaultActiveKey={['1']}
                                    items={[
                                        {
                                            key: '1',
                                            label: <h4 className="font-size-16">Danh sách đơn instance</h4>,
                                            children: (
                                                <Fragment>
                                                    <ul className="transfer-list">
                                                        {instances.map((instance) => (
                                                            <li key={instance.id}>
                                                                <div>
                                                                    <b>{instance.user_id.email}</b>
                                                                    <div className="font-size-13">
                                                                        {moment(instance.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold">{instance.image_id.title}</div>
                                                                    <div className="font-bold">
                                                                        {instance.product_id.core} vCPU |{' '}
                                                                        {instance.product_id.memory / 1024} RAM | {instance.product_id.disk}{' '}
                                                                        SSD
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Fragment>
                                            ),
                                            showArrow: false,
                                            extra: <SettingOutlined />,
                                        },
                                    ]}
                                />
                            </Col>

                            <Col md={12} xs={24} style={{ padding: '0 8px' }}>
                                <Collapse
                                    defaultActiveKey={['1']}
                                    items={[
                                        {
                                            key: '1',
                                            label: <h4 className="font-size-16">Danh sách đơn tạo website</h4>,
                                            children: (
                                                <Fragment>
                                                    <ul className="transfer-list">
                                                        {templates.map((template) => (
                                                            <li key={template.id}>
                                                                <div>
                                                                    <b>{template.user_id.email}</b>
                                                                    <div className="font-size-13">
                                                                        {moment(template.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold">{template.app_domain}</div>
                                                                    <div className="font-bold">{template.template_id.title}</div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Fragment>
                                            ),
                                            showArrow: false,
                                            extra: <SettingOutlined />,
                                        },
                                    ]}
                                />
                            </Col>

                            <Col md={12} xs={24} style={{ padding: '0 8px' }}>
                                <Collapse
                                    defaultActiveKey={['1']}
                                    items={[
                                        {
                                            key: '1',
                                            label: <h4 className="font-size-16">Lịch sử API v2</h4>,
                                            children: (
                                                <Fragment>
                                                    <ul className="transfer-list">
                                                        {requests.map((request) => (
                                                            <li key={request.id}>
                                                                <div>
                                                                    <b>{request.user_id.email}</b>
                                                                    <div className="font-size-13">
                                                                        {moment(request.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Tag color={request.status === 200 ? '#4caf50' : '#f44336'}>
                                                                        {request.status}
                                                                    </Tag>
                                                                    <div className="font-bold">{request.service_id.title}</div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Fragment>
                                            ),
                                            showArrow: false,
                                            extra: <SettingOutlined />,
                                        },
                                    ]}
                                />
                            </Col>
                        </Row>
                    </Card>
                )}
            </Col>

            <Col md={6} style={{ padding: '0 8px' }} className="flex-1">
                <Card
                    className="rounded-15 mb-4"
                    title={
                        <h2 className="font-semibold mb-0 white-space-break">
                            <span className="font-size-18 font-semibold">Tài khoản quản trị</span>
                        </h2>
                    }
                >
                    <Flex align="center" justify="center" className="h-full flex-column">
                        <Avatar
                            src={currentUser?.avatar_url || imageAvatarDefault}
                            style={{ fontSize: 50, width: 100, height: 100, lineHeight: 100 }}
                        />
                        <h3 className="text-center font-semibold mt-2 mb-0 font-size-20">{currentUser?.full_name}</h3>
                        <h3 className="text-center mt-1 mb-0 text-subtitle font-size-16">{currentUser?.email}</h3>
                    </Flex>
                </Card>

                <Card
                    className="rounded-15 mb-4"
                    title={
                        <h2 className="font-semibold mb-0 white-space-break">
                            <span className="font-size-18 font-semibold">Lịch sử đăng nhập</span>
                        </h2>
                    }
                >
                    <ul className="transfer-list">
                        {loginHistories.map((history) => (
                            <li>
                                <div>
                                    <b>{history.user_id.email}</b>
                                    <div className="font-size-13">{moment(history.created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
                                </div>

                                <Tag>
                                    {history.device.os.name} {history.device.os.version}
                                </Tag>
                            </li>
                        ))}
                    </ul>
                </Card>
            </Col>
        </Row>
    );
}

export default Home;
