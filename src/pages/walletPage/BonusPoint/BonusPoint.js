import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spin, Flex, Space, Table, Pagination, Button, Breadcrumb, notification, Tooltip, Popconfirm } from 'antd';

import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import imagePoint from '~/assets/image/point.png';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyBonusPoint, requestAuthGetBonusPoints } from '~/services/wallet';

function BonusPoint() {
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [bonusPoints, setBonusPoints] = useState([]);

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Lịch sử điểm thưởng';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetBonusPoints(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setBonusPoints(result.data);
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
    const confirmDestroyBonusPoint = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID điểm thưởng cần xoá',
            });
        }
        const result = await requestAuthDestroyBonusPoint(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneBonusPoints = [...bonusPoints];

            const bonusPointIndex = cloneBonusPoints.findIndex((item) => item.key === id);
            if (bonusPointIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy điểm thưởng trong danh sách',
                });
            }

            cloneBonusPoints.splice(bonusPointIndex, 1);
            setBonusPoints(cloneBonusPoints);

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
            title: 'Ví',
            dataIndex: 'wallet',
            key: 'wallet',
            render: (wallet) => (
                <Fragment>
                    ID:
                    <Link to={`${router.wallets}?id=${wallet._id}`} target="_blank">
                        <span> {wallet.id}</span>
                    </Link>
                    <br />
                    <span>{convertCurrency(wallet.total_balance)}</span>
                </Fragment>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'bonus_type',
            key: 'bonus_type',
            render: (bonus_type) => {
                let title = '';
                let className = '';

                if (bonus_type === 'income') {
                    title = 'Thu thập';
                    className = 'text-success';
                }
                if (bonus_type === 'exchange') {
                    title = 'Đổi điểm';
                    className = 'text-danger';
                }

                return <div className={className}>{title}</div>;
            },
        },
        {
            title: 'Số điểm',
            dataIndex: 'bonus_point',
            key: 'bonus_point',
            render: (bonus_point) => (
                <div className="d-flex align-items-center gap-1">
                    <span className={bonus_point > 0 ? 'text-success' : 'text-danger'}>
                        {bonus_point > 0 && '+'}
                        {convertCurrency(bonus_point).slice(0, -1)}
                    </span>

                    <img src={imagePoint} alt="Point" style={{ width: 15, height: 15 }} />
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let title = '';
                let style = {};
                let className = '';

                if (status === 'pending') {
                    title = 'Chờ xử lý';
                    className = 'label-light-warning font-weight-bold';
                    style = { backgroundColor: '#ff98001a', color: '#ff9800', border: '1px solid #ff98001a' };
                }
                if (status === 'processed') {
                    title = 'Đã xử lý';
                    className = 'label-light-success font-weight-bold';
                    style = { backgroundColor: '#4caf501a', color: '#4caf50', border: '1px solid #4caf501a' };
                }
                if (status === 'failed') {
                    title = 'Thất bại';
                    className = 'label-light-danger font-weight-bold';
                    style = { backgroundColor: '#f443361a', color: '#f44336', border: '1px solid #f443361a' };
                }

                return (
                    <span className={className} style={style}>
                        {title}
                    </span>
                );
            },
        },
        {
            title: 'Lí do',
            key: 'reason',
            render: (data) => {
                if (data.bonus_type === 'income') {
                    return (
                        <Fragment>
                            <Tooltip title="Mã hoá đơn">
                                <Link to={`${router.invoices}?invoice_id=${data.reason?.invoice_id}`} target="_blank">
                                    #{data.reason?.invoice_id}
                                </Link>
                            </Tooltip>
                            <br />
                            <span>{data.reason?.service}</span>
                        </Fragment>
                    );
                }
                if (data.bonus_type === 'exchange') {
                    return <span>{data.reason}</span>;
                }
            },
        },
        {
            title: 'Ngày tạo/cập nhật',
            key: 'date',
            render: (data) => (
                <Fragment>
                    <span>{moment(data.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    <br />
                    <span>{moment(data.updated_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                </Fragment>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (data) => (
                <Flex align="center" gap={12}>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyBonusPoint(data.key)}
                            okText="Xoá"
                            cancelText="Huỷ"
                            icon={<IconQuestion width={14} height={14} className="mt-1 mr-1" style={{ color: '#ff4d4f' }} />}
                        >
                            <Button danger type="primary" size="small" className="box-center">
                                <IconTrash size={18} />
                            </Button>
                        </Popconfirm>
                    </Tooltip>
                </Flex>
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
                                    title: 'Lịch sử điểm thưởng',
                                },
                            ]}
                        />
                    </Flex>
                </Flex>
            </Card>

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={bonusPoints} pagination={false} />
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

export default BonusPoint;
