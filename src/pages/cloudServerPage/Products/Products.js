import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconCoin, IconInfoCircleFilled, IconPlus, IconRotate, IconTrash } from '@tabler/icons-react';
import { Card, Flex, Spin, Space, Table, Badge, Button, Switch, Tooltip, Breadcrumb, Popconfirm, Pagination, notification } from 'antd';

import router from '~/configs/routes';
import UpdateProduct from './UpdateProduct';
import IconQuestion from '~/assets/icon/IconQuestion';
import DrawerPricing from '~/components/DrawerPricing';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreatePricing } from '~/services/module';
import {
    controlAuthGetCloudServerProduct,
    requestAuthAsyncCloudServerProduct,
    requestAuthUpdateCloudServerProduct,
    controlAuthDestroyCloudServerProduct,
} from '~/services/cloudServer';

function ServerProducts() {
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openPricing, setOpenPricing] = useState(false);
    const [loadingAsync, setLoadingAsync] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách cấu hình';

        const fetch = async () => {
            setLoading(true);
            const result = await controlAuthGetCloudServerProduct(page, id);

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setProducts(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, id]);

    const handleCreatePricing = async (values) => {
        const {
            price,
            discount,
            cycles_id,
            other_fees,
            penalty_fee,
            renewal_fee,
            upgrade_fee,
            bonus_point,
            creation_fee,
            brokerage_fee,
            original_price,
            cancellation_fee,
        } = values;

        const data = {
            price,
            discount,
            cycles_id,
            other_fees,
            bonus_point,
            penalty_fee,
            renewal_fee,
            upgrade_fee,
            creation_fee,
            brokerage_fee,
            original_price,
            cancellation_fee,
            service_id: product.key,
            service_type: 'CloudServerProduct',
        };

        const result = await requestAuthCreatePricing(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneProducts = [...products];

            const productIndex = cloneProducts.findIndex((pro) => pro.key === product.key);
            if (productIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy cấu hình trong danh sách',
                });
            }

            cloneProducts[productIndex].pricing += 1;

            setProduct(null);
            setOpenPricing(false);
            setProducts(cloneProducts);

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

    const handleToggleStatusProduct = async (id, type) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID cấu hình cần sửa',
            });
        }

        const result = await requestAuthUpdateCloudServerProduct(id, type, {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneProducts = [...products];

            const productIndex = cloneProducts.findIndex((product) => product.key === id);
            if (productIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy cấu hình trong danh sách',
                });
            }

            if (type === 'status') {
                cloneProducts[productIndex].status = !cloneProducts[productIndex].status;
            }
            if (type === 'sold_out') {
                cloneProducts[productIndex].sold_out = !cloneProducts[productIndex].sold_out;
            }

            setProducts(cloneProducts);

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

    const handleAsyncRegions = async () => {
        setLoadingAsync(true);
        const result = await requestAuthAsyncCloudServerProduct();

        setLoadingAsync(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const getProducts = await controlAuthGetCloudServerProduct(page, id);

            setLoading(false);
            if (getProducts.status === 401 || getProducts.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (getProducts?.status === 200) {
                setPages(getProducts.pages);
                setProducts(getProducts.data);

                notification.success({
                    message: 'Thông báo',
                    description: result.message,
                });
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: getProducts?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    const confirmDestroyServerProduct = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID cấu hình cần cập nhật',
            });
        }

        const result = await controlAuthDestroyCloudServerProduct(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneProducts = [...products];

            const productIndex = cloneProducts.findIndex((product) => product.key === id);
            if (productIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy cấu hình trong danh sách',
                });
            }

            cloneProducts.splice(productIndex, 1);
            setProducts(cloneProducts);

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
            title: 'Cấu hình',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'CPU',
            dataIndex: 'core',
            key: 'core',
            render: (core) => `${core} vCPU`,
        },
        {
            title: 'RAM',
            dataIndex: 'memory',
            key: 'memory',
            render: (memory) => `${memory / 1024} GB`,
        },
        {
            title: 'SSD',
            dataIndex: 'disk',
            key: 'disk',
            render: (disk) => `${disk} GB`,
        },
        {
            title: 'Băng thông',
            dataIndex: 'bandwidth',
            key: 'bandwidth',
        },
        {
            title: 'Tốc độ mạng',
            dataIndex: 'network_speed',
            key: 'network_speed',
            render: (network_speed) => `${network_speed} Mbps`,
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
                    onChange={() => handleToggleStatusProduct(data.key, 'status')}
                />
            ),
        },
        {
            title: 'Hết hàng',
            key: 'sold_out',
            render: (data) => (
                <Switch
                    checkedChildren="Hêt"
                    unCheckedChildren="Chưa"
                    defaultChecked
                    value={data.sold_out}
                    onChange={() => handleToggleStatusProduct(data.key, 'sold_out')}
                />
            ),
        },
        {
            title: 'Ngày tạo/cập nhật cuối',
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
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setProduct(data);
                                setOpenUpdate(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Giá cả">
                        <Link to={`${router.pricing}?service_id=${data.key}`} target="_blank">
                            <Badge count={data.pricing} size="small">
                                <Button className="box-center" type="primary" size="small">
                                    <IconCoin size={18} />
                                </Button>
                            </Badge>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Thêm giá">
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setProduct(data);
                                setOpenPricing(true);
                            }}
                        >
                            <IconPlus size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyServerProduct(data.key)}
                            okText="Xoá"
                            cancelText="Huỷ"
                            className="box-center"
                            icon={<IconQuestion width={14} height={14} className="mt-1 mr-1" style={{ color: '#ff4d4f' }} />}
                        >
                            <Button danger type="primary" size="small">
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
                                    title: 'Danh sách cấu hình',
                                },
                            ]}
                        />
                    </Flex>

                    <Flex justify="end" className="responsive-item">
                        <Button
                            className="box-center w-xs-full gap-1"
                            type="primary"
                            onClick={handleAsyncRegions}
                            disabled={loadingAsync}
                            loading={loadingAsync}
                        >
                            <IconRotate size={16} />
                            Đồng bộ
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            {openPricing && <DrawerPricing open={openPricing} setOpen={setOpenPricing} onClick={handleCreatePricing} />}
            {openUpdate && product && (
                <UpdateProduct open={openUpdate} setOpen={setOpenUpdate} product={product} callback={products} setCallback={setProducts} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={products} pagination={false} />
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

export default ServerProducts;
