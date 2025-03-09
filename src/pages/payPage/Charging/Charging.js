import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { Card, Spin, Flex, Space, Table, Button, Tooltip, Popconfirm, Pagination, Breadcrumb, notification, Tag } from 'antd';

import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyCharging, requestAuthGetChargings } from '~/services/pay';

function Charging() {
    const [chargings, setChargings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh thẻ đã nạp';
        setLoading(true);

        const fetch = async () => {
            const result = await requestAuthGetChargings(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setChargings(result.data);
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

    // Xoá
    const confirmDestroyCharging = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID thẻ cào cần xoá',
            });
        }
        const result = await requestAuthDestroyCharging(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneChargings = [...chargings];

            const chargingIndex = cloneChargings.findIndex((charging) => charging.key === id);
            if (chargingIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy thẻ cào trong danh sách',
                });
            }

            cloneChargings.splice(chargingIndex, 1);
            setChargings(cloneChargings);

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
            title: 'Trạng thái',
            key: 'message',
            render: (data) => {
                let color = '#ff4d4f';
                if (data.status === 1) {
                    color = '#28a745';
                }
                if (data.status === 2) {
                    color = '#17a2b8';
                }
                if (data.status === 99) {
                    color = '#ffc107';
                }

                return <Tag color={color}>{data.message}</Tag>;
            },
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
            title: 'Thông tin',
            key: 'info',
            render: (data) => (
                <Fragment>
                    <b>{data.telco}</b>
                    <br />
                    <b>M: </b>
                    <span>{data.code}</span>
                    <br />
                    <b>S: </b>
                    <span>{data.serial}</span>
                </Fragment>
            ),
        },
        {
            title: 'Khai',
            dataIndex: 'declared_value',
            key: 'declared_value',
            render: (declared_value) => convertCurrency(declared_value),
        },
        {
            title: 'Thực',
            dataIndex: 'value',
            key: 'value',
            render: (value) => convertCurrency(value),
        },
        {
            title: 'Phí',
            dataIndex: 'fees',
            key: 'fees',
            render: (fees) => `${fees}%`,
        },
        {
            title: 'Nhận',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => convertCurrency(amount),
        },
        {
            title: 'Thời gian',
            key: 'date',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Ngày tạo mới">
                        <span>{moment(data.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    </Tooltip>
                    <br />
                    {data.approved_at ? (
                        <Tooltip title="Ngày xử lý">
                            <span className="text-success">{moment(data.processed_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                        </Tooltip>
                    ) : (
                        'Chưa xử lý'
                    )}
                </Fragment>
            ),
        },
        {
            title: 'Yêu cầu',
            dataIndex: 'request_id',
            key: 'request_id',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (data) => (
                <Tooltip title="Xoá">
                    <Popconfirm
                        title="Delete?"
                        description={`#${data.id}`}
                        onConfirm={() => confirmDestroyCharging(data.key)}
                        okText="Xoá"
                        cancelText="Huỷ"
                        icon={<IconQuestion width={14} height={14} className="mt-1 mr-1" style={{ color: '#ff4d4f' }} />}
                    >
                        <Button danger type="primary" size="small" className="box-center">
                            <IconTrash size={18} />
                        </Button>
                    </Popconfirm>
                </Tooltip>
            ),
        },
    ];

    return (
        <Space style={{ width: '100%', flexDirection: 'column' }}>
            <Card styles={{ body: { padding: 12 } }}>
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
                                    title: 'Danh sách thẻ đã nạp',
                                },
                            ]}
                        />
                    </Flex>
                </Flex>
            </Card>

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={chargings} pagination={false} />
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

export default Charging;
