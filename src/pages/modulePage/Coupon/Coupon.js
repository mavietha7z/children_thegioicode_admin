import moment from 'moment';
import { useDispatch } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import { Card, Flex, Spin, Space, Table, Button, Switch, Tooltip, Breadcrumb, Pagination, Popconfirm, notification } from 'antd';

import router from '~/configs/routes';
import UpdateCoupon from './UpdateCoupon';
import CreateCoupon from './CreateCoupon';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyCoupon, requestAuthGetCoupons, requestAuthUpdateCoupon } from '~/services/module';

function Coupon() {
    const [coupons, setCoupons] = useState([]);
    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Mã giảm giá';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetCoupons(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setCoupons(result.data);
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

    const handleToggleStatusCoupon = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID mã giảm giá cần sửa',
            });
        }

        const result = await requestAuthUpdateCoupon('status', id, {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneCoupons = [...coupons];

            const couponIndex = cloneCoupons.findIndex((coupon) => coupon.key === id);
            if (couponIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy mã giảm giá trong danh sách',
                });
            }

            cloneCoupons[couponIndex].status = !cloneCoupons[couponIndex].status;
            setCoupons(cloneCoupons);

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

    const confirmDestroyCoupon = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID mã giảm giá cần xoá',
            });
        }
        const result = await requestAuthDestroyCoupon(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneCoupons = [...coupons];

            const couponIndex = cloneCoupons.findIndex((item) => item.key === id);
            if (couponIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy mã giảm giá trong danh sách',
                });
            }

            cloneCoupons.splice(couponIndex, 1);
            setCoupons(cloneCoupons);

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
            render: (id) => `#${id}`,
        },
        {
            title: 'Loại dịch vụ',
            dataIndex: 'service_type',
            key: 'service_type',
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'cycles',
            key: 'cycles',
            render: (cycles) => (
                <Link to={`${router.cycles}?id=${cycles._id}`} target="_blank">
                    <span>{cycles.display_name}</span>
                </Link>
            ),
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            render: (data) => {
                return (
                    <Fragment>
                        <span>{data.discount_value}</span>
                        <br />
                        <span>{data.discount_type}</span>
                    </Fragment>
                );
            },
        },
        {
            title: 'Loại đơn',
            dataIndex: 'recurring_type',
            key: 'recurring_type',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (data) => (
                <Switch
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    defaultChecked
                    value={data.status}
                    onChange={() => handleToggleStatusCoupon(data.key)}
                />
            ),
        },
        {
            title: 'Ngày tạo/Hết hạn',
            key: 'date',
            render: (data) => (
                <Fragment>
                    <span>{moment(data.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    <br />
                    <span>{moment(data.expired_at).format('DD/MM/YYYY HH:mm:ss')}</span>
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
                                setCoupon(data);
                                setOpenDetail(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyCoupon(data.key)}
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
                                    title: 'Mã giảm giá',
                                },
                            ]}
                        />
                    </Flex>

                    <Flex justify="end" className="responsive-item">
                        <Button className="box-center w-xs-full" type="primary" onClick={() => setOpenCreate(true)}>
                            <PlusOutlined />
                            Thêm mới
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            {openCreate && <CreateCoupon open={openCreate} setOpen={setOpenCreate} callback={coupons} setCallback={setCoupons} />}
            {openDetail && coupon && (
                <UpdateCoupon open={openDetail} setOpen={setOpenDetail} coupon={coupon} callback={coupons} setCallback={setCoupons} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={coupons} pagination={false} />
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

export default Coupon;
