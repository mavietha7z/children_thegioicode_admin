import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tag, Card, Flex, Spin, Space, Table, Image, Button, Tooltip, Pagination, Breadcrumb, notification } from 'antd';
import { IconArrowLeft, IconUsersGroup, IconGitPullRequest, IconInfoCircleFilled, IconRotate } from '@tabler/icons-react';

import UpdateApi from './UpdateApi';
import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import { requestAuthAsyncApi, requestAuthGetApis } from '~/services/api';

function Apis() {
    const [api, setApi] = useState(null);
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [loadingAsync, setLoadingAsync] = useState(false);
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

    const handleAsyncApis = async () => {
        setLoadingAsync(true);
        const result = await requestAuthAsyncApi();

        setLoadingAsync(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const getRegions = await requestAuthGetApis(page, id);

            setLoading(false);
            if (getRegions.status === 401 || getRegions.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (getRegions?.status === 200) {
                setPages(getRegions.pages);
                setApis(getRegions.data);

                notification.success({
                    message: 'Thông báo',
                    description: result.message,
                });
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: getRegions?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
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
                        <Button
                            className="box-center w-xs-full gap-1"
                            type="primary"
                            onClick={handleAsyncApis}
                            disabled={loadingAsync}
                            loading={loadingAsync}
                        >
                            <IconRotate size={16} />
                            Đồng bộ
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            {openUpdate && api && <UpdateApi open={openUpdate} setOpen={setOpenUpdate} api={api} callback={apis} setCallback={setApis} />}

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
