import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import { Breadcrumb, Button, Card, Flex, Input, notification, Pagination, Popconfirm, Space, Spin, Switch, Table, Tooltip } from 'antd';

import router from '~/configs/routes';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyNewsFeed, requestAuthGetNewsFeed, requestAuthUpdateNewsFeed } from '~/services/app';

function NewsFeed() {
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [newsFeeds, setNewsFeeds] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách news feed';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetNewsFeed(page);

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setNewsFeeds(result.data);
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

    const handlePinTopNewsFeed = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID bài viết cần ghim/bỏ ghim',
            });
        }

        const result = await requestAuthUpdateNewsFeed(id, 'pintop', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneNewsFeeds = [...newsFeeds];

            const indexNewsFeed = cloneNewsFeeds.findIndex((item) => item.key === id);
            if (indexNewsFeed === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ID bài viết trong danh sách',
                });
            }

            const isCurrentlyPinned = cloneNewsFeeds[indexNewsFeed].pin_top;
            if (!isCurrentlyPinned) {
                cloneNewsFeeds[indexNewsFeed].pin_top = true;

                cloneNewsFeeds.forEach((cloneNewsFeed) => {
                    if (cloneNewsFeed.key !== id) {
                        cloneNewsFeed.pin_top = false;
                    }
                });
            } else {
                cloneNewsFeeds[indexNewsFeed].pin_top = false;
            }

            setNewsFeeds(cloneNewsFeeds);

            notification.success({
                message: 'Thông báo',
                description: 'Ghim/Bỏ ghim bài viết thành công',
            });
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    const handleToggleStatusNewsFeed = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID bài viết cần cập nhật',
            });
        }

        const result = await requestAuthUpdateNewsFeed(id, 'status', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneNewsFeeds = [...newsFeeds];

            const indexNewsFeed = cloneNewsFeeds.findIndex((item) => item.key === id);
            if (indexNewsFeed === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ID bài viết trong danh sách',
                });
            }

            cloneNewsFeeds[indexNewsFeed].status = !cloneNewsFeeds[indexNewsFeed].status;
            setNewsFeeds(cloneNewsFeeds);

            notification.success({
                message: 'Thông báo',
                description: 'Bật/Tắt trạng thái bài viết thành công',
            });
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    const confirmDestroyNewsFeed = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID bài viết cần xoá',
            });
        }

        const result = await requestAuthDestroyNewsFeed(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneNewsFeeds = [...newsFeeds];

            const indexNewsFeed = cloneNewsFeeds.findIndex((item) => item.key === id);
            if (indexNewsFeed === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy bài viết trong danh sách',
                });
            }

            cloneNewsFeeds.splice(indexNewsFeed, 1);
            setNewsFeeds(cloneNewsFeeds);

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
            title: 'Tác giả',
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
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Lượt yêu',
            dataIndex: 'like_count',
            key: 'like_count',
        },
        {
            title: 'Bình luận',
            dataIndex: 'comment_count',
            key: 'comment_count',
        },
        {
            title: 'Chia sẻ',
            dataIndex: 'share_count',
            key: 'share_count',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (data) => (
                <Switch
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    value={data.status}
                    onChange={() => handleToggleStatusNewsFeed(data.key)}
                />
            ),
        },
        {
            title: 'Pin top',
            key: 'pin_top',
            render: (data) => (
                <Switch
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    value={data.pin_top}
                    onChange={() => handlePinTopNewsFeed(data.key)}
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
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Link to={router.news_feeds + '/edit/' + data.key}>
                            <Button className="box-center" type="primary" size="small">
                                <IconInfoCircleFilled size={18} />
                            </Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyNewsFeed(data.key)}
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
                    <Flex className="gap-2 responsive-item">
                        <Button size="small" className="box-center" onClick={() => navigate(router.home)}>
                            <IconArrowLeft size={18} />
                        </Button>
                        <Breadcrumb
                            className="flex-1"
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: 'Thông báo',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Input prefix={<SearchOutlined />} style={{ width: 260 }} placeholder="Tìm kiếm" />

                        <Link to={router.news_feeds + '/create'}>
                            <Button style={{ display: 'flex', alignItems: 'center' }} type="primary" className="w-xs-full box-center ml-2">
                                <PlusOutlined />
                                Thêm mới
                            </Button>
                        </Link>
                    </Flex>
                </Flex>
            </Card>

            <Card style={{ minHeight: 'calc(-144px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={newsFeeds} pagination={false} />
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

export default NewsFeed;
