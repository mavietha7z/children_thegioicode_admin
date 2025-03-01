import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconTrash, IconArrowLeft, IconInfoCircleFilled } from '@tabler/icons-react';
import { Card, Flex, Spin, Space, Table, Input, Switch, Button, Tooltip, Popconfirm, Pagination, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import IconQuestion from '~/assets/icon/IconQuestion';
import OrderTemplateDetail from './OrderTemplateDetail';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { calculateDaysLeft, convertCurrency } from '~/configs';
import { requestAuthGetOrderTemplates, requestAuthDestroyOrderTemplate } from '~/services/template';

function OrderTemplate() {
    const [loading, setLoading] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [orderTemplate, setOrderTemplate] = useState(null);
    const [orderTemplates, setOrderTemplates] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách đơn tạo website';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetOrderTemplates(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setOrderTemplates(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
            setLoading(false);
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Destroy
    const confirmDestroyOrderTemplate = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID đơn tạo web cần xoá',
            });
        }
        const result = await requestAuthDestroyOrderTemplate(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneOrderTemplates = [...orderTemplates];

            const indexOrderTemplate = cloneOrderTemplates.findIndex((item) => item.key === id);
            if (indexOrderTemplate === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy đơn tạo web trong danh sách',
                });
            }

            cloneOrderTemplates.splice(indexOrderTemplate, 1);
            setOrderTemplates(cloneOrderTemplates);

            notification.success({
                message: 'Thông báo',
                description: result.message,
            });
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Fragment>#{id}</Fragment>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Link to={`${router.users}?id=${user._id}`} target="_blank">
                    <span>{user.full_name}</span>
                    <br />
                    <span>{user.email}</span>
                </Link>
            ),
        },
        {
            title: 'Mẫu website',
            dataIndex: 'template',
            key: 'template',
            render: (template) => (
                <Link to={`${router.templates}?id=${template._id}`} target="_blank">
                    <span>#{template.id}</span>
                    <br />
                    <span>{template.title}</span>
                </Link>
            ),
        },
        {
            title: 'Tên miền',
            dataIndex: 'app_domain',
            key: 'app_domain',
            render: (app_domain) => (
                <a href={`https://${app_domain}`} target="_blank" rel="noreferrer">
                    {app_domain.charAt(0).toUpperCase() + app_domain.slice(1)}
                </a>
            ),
        },
        {
            title: 'Giá cả',
            dataIndex: 'pricing',
            key: 'pricing',
            render: (pricing) => (
                <Tooltip title="Giá/Chu kỳ đang dùng">
                    <Link to={`${router.pricing}?id=${pricing._id}`} target="_blank">
                        <span>{pricing.cycles_id.display_name}</span>
                        <br />
                        <span>{convertCurrency(pricing.price)}</span>
                    </Link>
                </Tooltip>
            ),
        },
        {
            title: 'Số tiền',
            key: 'price',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Tổng số tiền">
                        <span className="text-info">{convertCurrency(data.total_price)}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Chiết khấu">
                        <span className="text-danger">{convertCurrency(data.total_payment - data.total_price)}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Số tiền đã thanh toán">
                        <span className="text-success">{convertCurrency(data.total_payment)}</span>
                    </Tooltip>
                </Fragment>
            ),
        },
        {
            title: 'Auto renew',
            dataIndex: 'auto_renew',
            key: 'auto_renew',
            render: (auto_renew) => <Switch checkedChildren="Bật" unCheckedChildren="Tắt" value={auto_renew} disabled />,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let className = '';
                let style = {};

                if (status === 'activated') {
                    className = 'label-light-success font-weight-bold';
                    style = { backgroundColor: '#4caf501a', color: '#4caf50', border: '1px solid #4caf501a' };
                }
                if (status === 'pending' || status === 'wait_confirm') {
                    className = 'label-light-warning font-weight-bold';
                    style = { backgroundColor: '#ff98001a', color: '#ff9800', border: '1px solid #ff98001a' };
                }
                if (status === 'inactivated' || status === 'expired' || status === 'blocked' || status === 'deleted') {
                    className = 'label-light-danger font-weight-bold';
                    style = { backgroundColor: '#f443361a', color: '#f44336', border: '1px solid #f443361a' };
                }

                return (
                    <div className={className} style={style}>
                        {status.toUpperCase()}
                    </div>
                );
            },
        },
        {
            title: 'Thời gian',
            key: 'date',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Ngày đăng ký">
                        <span>{moment(data.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Ngày hết hạn">
                        <span>{moment(data.expired_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    </Tooltip>
                    <br />
                    <Fragment>
                        (
                        <b className={moment(data.expired_at).diff(new Date(), 'days') < 8 ? 'text-danger' : ''}>
                            {calculateDaysLeft(data.expired_at)}
                        </b>
                        )
                    </Fragment>
                </Fragment>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (data) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setOrderTemplate(data);
                                setOpenUpdate(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyOrderTemplate(data.key)}
                            okText="Xoá"
                            cancelText="Huỷ"
                            icon={<IconQuestion width={14} height={14} className="mt-1 mr-1" style={{ color: '#ff4d4f' }} />}
                        >
                            <Button danger type="primary" size="small" className="box-center">
                                <IconTrash size={18} />
                            </Button>
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Space style={{ width: '100%', flexDirection: 'column' }}>
            <Card
                styles={{
                    body: {
                        padding: 12,
                    },
                }}
            >
                <Flex justify="space-between" align="center" className="responsive-flex">
                    <Flex className="gap-2 responsive-item" align="center">
                        <Button size="small" className="box-center" onClick={() => navigate(router.home)}>
                            <IconArrowLeft size={18} />
                        </Button>
                        <Breadcrumb
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: 'Danh sách đơn tạo web',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm" style={{ width: 240 }} className="w-xs-full" />
                    </Flex>
                </Flex>
            </Card>

            {openUpdate && orderTemplate && (
                <OrderTemplateDetail
                    open={openUpdate}
                    setOpen={setOpenUpdate}
                    orderTemplate={orderTemplate}
                    callback={orderTemplates}
                    setCallback={setOrderTemplates}
                />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={orderTemplates} pagination={false} />
                ) : (
                    <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                        <Spin />
                    </Flex>
                )}

                {Number(pages) > 1 && (
                    <Flex justify="end" style={{ margin: '20px 0 10px 0' }}>
                        <Pagination
                            current={page || 1}
                            pageSize={20}
                            total={Number(pages) * 20}
                            onChange={(page) => {
                                setPage(page);
                                setSearchParams({ page });
                            }}
                        />
                    </Flex>
                )}
            </Card>
        </Space>
    );
}

export default OrderTemplate;
