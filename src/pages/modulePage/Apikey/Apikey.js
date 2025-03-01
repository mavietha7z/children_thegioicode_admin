import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconInfoCircleFilled, IconCopy, IconWebhook } from '@tabler/icons-react';
import { Card, Flex, Spin, Space, Table, Input, Button, Switch, Tooltip, Pagination, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import DetailApikey from './DetailApikey';
import useDebounce from '~/hooks/useDebounce';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { generateCateString, serviceCopyKeyBoard } from '~/configs';
import { requestAuthGetApiKeys, requestAuthSearchApikey, requestAuthUpdateApikey } from '~/services/module';

function Apikey() {
    const [apiKeys, setApiKeys] = useState([]);
    const [apikey, setApikey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [openDetail, setOpenDetail] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const debounce = useDebounce(searchValue, 800);

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách apikey';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetApiKeys(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setApiKeys(result.data);
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

    // Search
    useEffect(() => {
        if (debounce.length < 1) {
            return;
        }

        const fetch = async () => {
            const result = await requestAuthSearchApikey(debounce);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(1);
                setApiKeys(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };

        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounce]);

    const handleToggleStatusApikey = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID giá cả cần sửa',
            });
        }

        const result = await requestAuthUpdateApikey('status', id, {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneApikey = [...apiKeys];

            const indexApikey = cloneApikey.findIndex((apikey) => apikey.key === id);
            if (indexApikey === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy apikey trong danh sách',
                });
            }

            cloneApikey[indexApikey].status = !cloneApikey[indexApikey].status;
            setApiKeys(cloneApikey);

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
            title: 'Dịch vụ',
            key: 'service',
            render: (data) => (
                <Tooltip title={data.service.title}>
                    <Link to={`${router.apis}?id=${data.service._id}`} target="_blank">
                        <span>{data.category}</span>
                        <br />
                        {generateCateString(data.service.title, 30)}
                    </Link>
                </Tooltip>
            ),
        },
        {
            title: 'Sử dụng',
            key: 'use',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Lượt dùng miễn phí">
                        <span className="text-success mr-1">{data.free_usage}</span>
                    </Tooltip>
                    /
                    <Tooltip title="Tổng lượt sử dụng">
                        <span className="text-info ml-1">{data.use}</span>
                    </Tooltip>
                </Fragment>
            ),
        },
        {
            title: 'Key',
            dataIndex: 'apikey',
            key: 'apikey',
            render: (apikey) => (
                <Flex align="center">
                    <span className="mr-2">{apikey}</span>
                    <Tooltip title="Sao chép">
                        <IconCopy className="cursor-pointer" size={18} stroke={1.5} onClick={() => serviceCopyKeyBoard(apikey)} />
                    </Tooltip>
                </Flex>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (data) => (
                <Switch
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    value={data.status}
                    onChange={() => handleToggleStatusApikey(data.key)}
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
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setApikey(data);
                                setOpenDetail(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Webhook">
                        <Button className="box-center" type="primary" size="small">
                            <IconWebhook size={18} />
                        </Button>
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
                                    title: 'Danh sách apikey',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm kiếm"
                            style={{ width: 260 }}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </Flex>
                </Flex>
            </Card>

            {openDetail && apikey && (
                <DetailApikey open={openDetail} setOpen={setOpenDetail} apikey={apikey} callback={apiKeys} setCallback={setApiKeys} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={apiKeys} pagination={false} />
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

export default Apikey;
