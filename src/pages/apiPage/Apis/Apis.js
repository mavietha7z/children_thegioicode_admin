import moment from 'moment';
import { useDispatch } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconTrash, IconArrowLeft, IconUsersGroup, IconClipboardText, IconGitPullRequest, IconInfoCircleFilled } from '@tabler/icons-react';
import { Tag, Card, Flex, Spin, Space, Table, Image, Button, Tooltip, Pagination, Popconfirm, Breadcrumb, notification } from 'antd';

import CreateApi from './CreateApi';
import DetailApi from './DetailApi';
import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import { requestAuthDestroyApi, requestAuthGetApis } from '~/services/api';

function Apis() {
    const [api, setApi] = useState(null);
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách apis';
        setLoading(true);

        const fetch = async () => {
            const result = await requestAuthGetApis(page, id);

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setApis(result.data);
                setPages(result.pages);
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

    const confirmDestroyApi = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID API cần xoá',
            });
        }

        const result = await requestAuthDestroyApi(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneApis = [...apis];

            const indexApi = cloneApis.findIndex((item) => item.key === id);
            if (indexApi === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy api trong danh sách',
                });
            }

            cloneApis.splice(indexApi, 1);
            setApis(cloneApis);

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
            title: 'Tên',
            dataIndex: 'title',
            key: 'title',
            render: (title) => (
                <Tooltip title={title}>
                    <Fragment>{title}</Fragment>
                </Tooltip>
            ),
        },
        {
            title: 'Ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            render: (image_url) => <Image width={40} src={image_url} alt="Avatar" fallback={imageNotFound} className="border rounded-8" />,
        },
        {
            title: 'Giá',
            key: 'price',
            render: (data) => (
                <Fragment>
                    {data.price < 1 ? (
                        <span className="text-success">Free</span>
                    ) : (
                        <Fragment>
                            <Tooltip title="Giá hiện tại">
                                <span className="text-success">{convertCurrency(data.price)}</span>
                            </Tooltip>
                            <span className="mx-1">/</span>
                            <Tooltip title="Giá cũ">
                                <span className="text-line-through text-subtitle">{convertCurrency(data.old_price)}</span>
                            </Tooltip>
                        </Fragment>
                    )}
                </Fragment>
            ),
        },
        {
            title: 'Yêu cầu',
            key: 'requests',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Thành công">
                        <span className="text-success">{data.requests.success}</span>
                    </Tooltip>
                    <span className="mx-1">/</span>
                    <Tooltip title="Thất bại">
                        <span className="text-danger">{data.requests.error}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Tổng requests">
                        <span className="text-info">{data.requests.success + data.requests.error}</span>
                    </Tooltip>
                </Fragment>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let title = '';
                let color = '';
                if (status === 'activated') {
                    title = 'Hoạt động';
                    color = 'green';
                }
                if (status === 'maintenance') {
                    title = 'Đang bảo trì';
                    color = 'orange';
                }
                if (status === 'blocked') {
                    title = 'Không hoạt động';
                    color = 'red';
                }
                return <Tag color={color}>{title}</Tag>;
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
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            size="small"
                            className="box-center"
                            onClick={() => {
                                setApi(data);
                                setOpenUpdate(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xem document">
                        <Link to={`${router.apis_document}/${data.key}`}>
                            <Button type="primary" size="small" className="box-center">
                                <IconClipboardText size={18} />
                            </Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Xem requests">
                        <Link to={`${router.apis_requests}/${data.key}`}>
                            <Button type="primary" size="small" className="box-center">
                                <IconGitPullRequest size={18} />
                            </Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Xem players">
                        <Link to={`${router.apis_players}/${data.key}`}>
                            <Button type="primary" size="small" className="box-center">
                                <IconUsersGroup size={18} />
                            </Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyApi(data.key)}
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
                                    title: 'Danh sách Apis',
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

            {openCreate && <CreateApi open={openCreate} setOpen={setOpenCreate} callback={apis} setCallback={setApis} />}
            {openUpdate && api && <DetailApi open={openUpdate} setOpen={setOpenUpdate} api={api} callback={apis} setCallback={setApis} />}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={apis} pagination={false} />
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

export default Apis;
