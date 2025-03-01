import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconCopy, IconDatabaseExport } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Tag,
    Card,
    Flex,
    Spin,
    Space,
    Table,
    Image,
    Empty,
    Input,
    Modal,
    Button,
    Tooltip,
    Pagination,
    DatePicker,
    Breadcrumb,
    notification,
} from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import { generateCateString, serviceCopyKeyBoard } from '~/configs';
import { requestAuthExportsPlayersApi, requestAuthGetPlayersApi } from '~/services/api';

const { RangePicker } = DatePicker;

const today = moment();
const sevenDaysAgo = moment().subtract(7, 'days');

const disabledDate = (current) => {
    return current && (current < sevenDaysAgo || current > today);
};

function Account() {
    const [pages, setPages] = useState(1);
    const [service, setService] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [accountType, setAccountType] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const [dateEnd, setDateEnd] = useState('');
    const [dateStart, setDateStart] = useState('');

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách tài khoản';

        if (id) {
            const fetch = async () => {
                setLoading(true);
                const result = await requestAuthGetPlayersApi(id, page);

                setLoading(false);
                if (result.status === 401 || result.status === 403) {
                    dispatch(logoutAuthSuccess());
                    navigate(`${router.login}?redirect_url=${pathname}`);
                } else if (result?.status === 200) {
                    setPages(result.pages);
                    setAccounts(result.data);
                    setService(result.service);
                    setAccountType(result.account_type);
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                    });
                }
            };
            fetch();
        } else {
            navigate(router.apis);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleRangeChange = (dates, dateStrings) => {
        if (dates) {
            setDateEnd(dateStrings[1]);
            setDateStart(dateStrings[0]);
        }
    };

    const handleExportAccount = async (account_type) => {
        if (!account_type) {
            return notification.error({
                message: 'Thông báo',
                description: 'Vui lòng chọn loại tài khoản để xuất file',
            });
        }

        if (!dateStart || !dateEnd) {
            return notification.error({
                message: 'Thông báo',
                description: 'Vui lòng chọn khoảng ngày để xuất file',
            });
        }

        const result = await requestAuthExportsPlayersApi(account_type, dateStart, dateEnd);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const jsonStr = JSON.stringify(result.data, null, 4);

            const blob = new Blob([jsonStr], { type: 'application/json' });

            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${accountType}_${dateStart}_${dateEnd}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);

            setModalVisible(false);
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

    let columns = [];
    if (accountType === 'garena') {
        columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: 'UID',
                dataIndex: 'uid',
                key: 'uid',
            },
            {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
            },
            {
                title: 'Password',
                dataIndex: 'password',
                key: 'password',
            },
            {
                title: 'Session key',
                dataIndex: 'session_key',
                key: 'session_key',
                render: (session_key) => (
                    <Flex align="center">
                        <Tooltip title={session_key}>
                            <Fragment>{generateCateString(session_key, 30)}</Fragment>
                        </Tooltip>
                        <IconCopy size={18} className="text-subtitle cursor-pointer" onClick={() => serviceCopyKeyBoard(session_key)} />
                    </Flex>
                ),
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status) => <Tag color={status ? '#52c41a' : '#ff4d4f'}>{status ? 'BẬT' : 'TẮT'}</Tag>,
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
        ];
    }
    if (accountType === 'freefire') {
        columns = [
            {
                title: 'ID',
                dataIndex: 'account_id',
                key: 'account_id',
            },
            {
                title: 'Tên',
                dataIndex: 'nickname',
                key: 'nickname',
            },
            {
                title: 'Ảnh',
                dataIndex: 'img_url',
                key: 'img_url',
                render: (img_url) => <Image width={40} src={img_url} alt="Avatar" fallback={imageNotFound} />,
            },
            {
                title: 'Quốc gia',
                dataIndex: 'region',
                key: 'region',
            },
            {
                title: 'Token',
                dataIndex: 'open_id',
                key: 'open_id',
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status) => <Tag color={status ? '#52c41a' : '#ff4d4f'}>{status ? 'BẬT' : 'TẮT'}</Tag>,
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
        ];
    }
    if (accountType === 'vnggames') {
        columns = [
            {
                title: 'ID',
                dataIndex: 'user_id',
                key: 'user_id',
                render: (user_id) => (
                    <Tooltip title={user_id}>
                        <Fragment>{generateCateString(user_id, 8)}</Fragment>
                    </Tooltip>
                ),
            },
            {
                title: 'Role ID',
                dataIndex: 'role_id',
                key: 'role_id',
            },
            {
                title: 'Role Name',
                dataIndex: 'role_name',
                key: 'role_name',
            },
            {
                title: 'Module',
                dataIndex: 'module',
                key: 'module',
            },
            {
                title: 'Front ID',
                dataIndex: 'front_id',
                key: 'front_id',
            },
            {
                title: 'Token',
                dataIndex: 'jwt_token',
                key: 'jwt_token',
                render: (jwt_token) => (
                    <Flex align="center">
                        <Tooltip title={jwt_token}>
                            <Fragment>{generateCateString(jwt_token, 30)}</Fragment>
                        </Tooltip>
                        <IconCopy size={18} className="text-subtitle cursor-pointer" onClick={() => serviceCopyKeyBoard(jwt_token)} />
                    </Flex>
                ),
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status) => <Tag color={status ? '#52c41a' : '#ff4d4f'}>{status ? 'BẬT' : 'TẮT'}</Tag>,
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
        ];
    }

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
                        <Button size="small" className="box-center" onClick={() => navigate(router.apis)}>
                            <IconArrowLeft size={18} />
                        </Button>
                        <Breadcrumb
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: <Link to={router.apis}>Apis</Link>,
                                },
                                {
                                    title: service,
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        {accountType === 'garena' && (
                            <Button className="mr-2 box-center" type="primary" onClick={() => setModalVisible(true)}>
                                <IconDatabaseExport />
                                <span className="ml-1">Xuất tài khoản</span>
                            </Button>
                        )}
                        <Input prefix={<SearchOutlined />} style={{ width: 260 }} placeholder="Tìm kiếm" />
                    </Flex>
                </Flex>
            </Card>

            <Card style={{ minHeight: 'calc(-180px + 100vh)' }}>
                {!loading ? (
                    <Fragment>
                        {accounts.length > 0 ? (
                            <Table columns={columns} dataSource={accounts} pagination={false} />
                        ) : (
                            <Empty className="mt-5" description="Không có dữ liệu tài khoản cho API này" />
                        )}
                    </Fragment>
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

            <Modal
                centered
                closable={false}
                maskClosable={false}
                open={modalVisible}
                onOk={() => handleExportAccount(accountType)}
                onCancel={() => setModalVisible(false)}
                width={460}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <h2 className="font-size-15">Bạn chỉ có thể xuất tài khoản 7 ngày gần nhất</h2>

                <div className="text-center py-4">
                    <RangePicker disabledDate={disabledDate} onChange={handleRangeChange} />
                </div>
            </Modal>
        </Space>
    );
}

export default Account;
