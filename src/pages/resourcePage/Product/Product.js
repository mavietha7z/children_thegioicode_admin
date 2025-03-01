import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconCoin, IconInfoCircleFilled, IconPlus, IconTrash } from '@tabler/icons-react';
import {
    Row,
    Col,
    Card,
    Flex,
    Spin,
    Space,
    Table,
    Input,
    Image,
    Badge,
    Button,
    Switch,
    Tooltip,
    Pagination,
    Popconfirm,
    Breadcrumb,
    notification,
} from 'antd';

import router from '~/configs/routes';
import CreateProduct from './CreateProduct';
import UpdateProduct from './UpdateProduct';
import IconQuestion from '~/assets/icon/IconQuestion';
import DrawerPricing from '~/components/DrawerPricing';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import { requestAuthCreatePricing } from '~/services/module';
import { requestAuthUpdateResourceProduct, requestAuthDestroyResourceProduct, requestAuthGetResourceProducts } from '~/services/resource';

function Product() {
    const [product, setProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openPricing, setOpenPricing] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');
    const category_id = searchParams.get('category_id');

    useEffect(() => {
        document.title = 'Quản trị website - Loại tài khoản';

        setLoading(true);

        const fetch = async () => {
            const result = await requestAuthGetResourceProducts(page, id, category_id);

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
            setLoading(false);
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, id, category_id]);

    const handleToggleStatusProduct = async (id, type) => {
        if (!id) {
            return notification.error({ message: 'Thông báo', description: 'Không lấy được ID danh mục' });
        }

        const result = await requestAuthUpdateResourceProduct(id, type, {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneProducts = [...products];

            const productIndex = cloneProducts.findIndex((product) => product.key === id);
            if (productIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy danh mục trong danh sách',
                });
            }

            cloneProducts[productIndex].status = !cloneProducts[productIndex].status;
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
            service_type: 'ResourceProduct',
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
                    description: 'Không tìm thấy sản phẩm trong danh sách',
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

    const confirmDestroyProduct = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID danh mục cần xoá',
            });
        }
        const result = await requestAuthDestroyResourceProduct(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneProducts = [...products];

            const productIndex = cloneProducts.findIndex((product) => product.key === id);
            if (productIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy danh mục trong danh sách',
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
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category) => (
                <Link to={`${router.resources}?id=${category._id}`} target="_blank">
                    <span>#{category.id}</span>
                    <br />
                    <span>{category.title}</span>
                </Link>
            ),
        },
        {
            title: 'Tên',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            render: (image_url) => <Image width={40} src={image_url} alt="Avatar" fallback={imageNotFound} className="border rounded-8" />,
        },
        {
            title: 'Kho',
            dataIndex: 'inventory',
            key: 'inventory',
        },
        {
            title: 'Xem/mua',
            key: 'turn',
            render: (data) => {
                return (
                    <Fragment>
                        <span className="text-success">{data.view_count}</span>
                        <br />
                        <span className="text-info">{data.purchase_count}</span>
                    </Fragment>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (data) => (
                <Switch
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    value={data.status}
                    onChange={() => handleToggleStatusProduct(data.key, 'status')}
                />
            ),
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
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            size="small"
                            className="box-center"
                            onClick={() => {
                                setOpenUpdate(true);
                                setProduct(data);
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
                            onConfirm={() => confirmDestroyProduct(data.key)}
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
                                    title: 'Loại tài khoản',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Row style={{ margin: '0 -4px', rowGap: 8 }}>
                            <Col xs={24} md={16} className="mt-xs-2" style={{ padding: '0 4px' }}>
                                <Input prefix={<SearchOutlined />} style={{ width: 250 }} className="w-xs-full" placeholder="Tìm kiếm" />
                            </Col>
                            <Col xs={24} md={6} className="mt-xs-2" style={{ padding: '0 4px' }}>
                                <Button className="box-center w-xs-full" type="primary" onClick={() => setOpenCreate(true)}>
                                    <PlusOutlined />
                                    Thêm mới
                                </Button>
                            </Col>
                        </Row>
                    </Flex>
                </Flex>
            </Card>

            {openPricing && <DrawerPricing open={openPricing} setOpen={setOpenPricing} onClick={handleCreatePricing} />}
            {openCreate && <CreateProduct open={openCreate} setOpen={setOpenCreate} callback={products} setCallback={setProducts} />}
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

export default Product;
