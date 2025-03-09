import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconFileDescription, IconTemplate, IconTrash } from '@tabler/icons-react';
import { Card, Spin, Flex, Space, Table, Button, Badge, Tooltip, Popconfirm, Pagination, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import InvoiceDetail from './InvoiceDetail';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyInvoice, requestAuthGetInvoices } from '~/services/pay';

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openOrder, setOpenOrder] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const id = searchParams.get('id');
    const invoice_id = searchParams.get('invoice_id');

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách hoá đơn';
        setLoading(true);

        const fetch = async () => {
            const result = await requestAuthGetInvoices(page, id, invoice_id);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setInvoices(result.data);
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
    }, [page, id, invoice_id]);

    // Xoá
    const confirmDestroyInvoice = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID hoá đơn cần xoá',
            });
        }
        const result = await requestAuthDestroyInvoice(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneInvoices = [...invoices];

            const indexInvoice = cloneInvoices.findIndex((item) => item.key === id);
            if (indexInvoice === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy hoá đơn trong danh sách',
                });
            }

            cloneInvoices.splice(indexInvoice, 1);
            setInvoices(cloneInvoices);

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
            title: 'Tiền tệ/Loại',
            key: 'type',
            render: (data) => {
                let recurring_type = '';
                if (data.recurring_type === 'buy') {
                    recurring_type = 'Mua';
                }
                if (data.recurring_type === 'register') {
                    recurring_type = 'Đăng ký';
                }
                if (data.recurring_type === 'renew') {
                    recurring_type = 'Gia hạn';
                }
                if (data.recurring_type === 'upgrade') {
                    recurring_type = 'Nâng cấp';
                }

                let title = '';
                if (data.type === 'service') {
                    title = 'Dịch vụ';
                }
                if (data.type === 'deposit') {
                    title = 'Cộng tiền';
                }
                if (data.type === 'withdraw') {
                    title = 'Trừ tiền';
                }
                if (data.type === 'recharge') {
                    title = 'Nạp tiền';
                }
                if (data.type === 'withdrawal') {
                    title = 'Rút tiền';
                }

                return (
                    <Fragment>
                        <span>{data.currency}</span>
                        <br />
                        <span>{title}</span>
                        <br />
                        <span>{recurring_type}</span>
                    </Fragment>
                );
            },
        },
        {
            title: 'Số tiền',
            key: 'total_price',
            render: (data) => {
                let total_price = '';
                let total_payment = '';

                if (data.total_price > 0) {
                    total_payment = `+${convertCurrency(data.total_payment)}`;
                }
                if (data.total_price < 0) {
                    total_price = convertCurrency(data.total_price);
                    total_payment = convertCurrency(data.total_payment);
                }

                return (
                    <Fragment>
                        {total_price && (
                            <Fragment>
                                <Tooltip title="Tổng số tiền">
                                    <span className="text-default">{total_price}</span>
                                </Tooltip>
                                <br />
                            </Fragment>
                        )}
                        <Tooltip title="Tổng thanh toán">
                            <span className={`text-${data.total_price < 0 ? 'danger' : 'success'}`}>{total_payment}</span>
                        </Tooltip>
                    </Fragment>
                );
            },
        },
        {
            title: 'Điểm thưởng',
            dataIndex: 'bonus_point',
            key: 'bonus_point',
            render: (bonus_point) => <span>{convertCurrency(bonus_point).slice(0, -1)} điểm</span>,
        },
        {
            title: 'Phương thức',
            dataIndex: 'pay_method',
            key: 'pay_method',
            render: (pay_method) => {
                let title = '';
                if (pay_method === 'credit_card') {
                    title = 'Thẻ tín dụng';
                }
                if (pay_method === 'debit_card') {
                    title = 'Thẻ ghi nợ';
                }
                if (pay_method === 'bank_transfer') {
                    title = 'Chuyển khoản';
                }
                if (pay_method === 'app_wallet') {
                    title = 'Ví Netcode';
                }
                return <Fragment>{title}</Fragment>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let className = '';
                let title = '';
                let style = {};

                if (status === 'completed') {
                    title = 'Hoàn thành';
                    className = 'label-light-success font-weight-bold';
                    style = { backgroundColor: '#4caf501a', color: '#4caf50', border: '1px solid #4caf501a' };
                }
                if (status === 'pending') {
                    title = 'Chờ thanh toán';
                    className = 'label-light-warning font-weight-bold';
                    style = { backgroundColor: '#ff98001a', color: '#ff9800', border: '1px solid #ff98001a' };
                }
                if (status === 'canceled') {
                    title = 'Đã huỷ';
                    className = 'label-light-danger font-weight-bold';
                    style = { backgroundColor: '#f443361a', color: '#f44336', border: '1px solid #f443361a' };
                }

                return (
                    <div className={className} style={style}>
                        {title}
                    </div>
                );
            },
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
                    <Tooltip title="Ngày xử lý">
                        <span>{moment(data.processed_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Ngày hết hạn">
                        <span>{moment(data.expired_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    </Tooltip>
                </Fragment>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (data) => (
                <Flex align="center" gap={10}>
                    <Tooltip title={`Nội dung: ${data.description}`}>
                        <Button type="primary" size="small" className="box-center">
                            <IconFileDescription size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xem danh sách đơn">
                        <Badge size="small" count={data.products.length}>
                            <Button
                                type="primary"
                                size="small"
                                className="box-center"
                                onClick={() => {
                                    setInvoice(data);
                                    setOpenOrder(true);
                                }}
                            >
                                <IconTemplate size={18} />
                            </Button>
                        </Badge>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyInvoice(data.key)}
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
                                    title: 'Danh sách hoá đơn',
                                },
                            ]}
                        />
                    </Flex>
                </Flex>
            </Card>

            {openOrder && invoice && (
                <InvoiceDetail
                    open={openOrder}
                    setOpen={setOpenOrder}
                    products={invoice.products}
                    recurring_type={invoice.recurring_type}
                />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={invoices} pagination={false} />
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

export default Invoices;
