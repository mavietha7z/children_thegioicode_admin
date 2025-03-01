import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, DatePicker, Drawer, Flex, Form, Input, InputNumber, Row, Select, Space, Spin, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreateCoupon, requestAuthSearchCoupon } from '~/services/module';

const { TextArea } = Input;

function CreateCoupon({ open, setOpen, callback, setCallback }) {
    const [loading, setLoading] = useState(false);

    const [services, setServices] = useState([]);
    const [serviceSelected, setServiceSelected] = useState([]);
    const filteredService = services.filter((service) => !serviceSelected.includes(service.title));

    const [applyAllUsers, setApplyAllUsers] = useState(true);

    const [users, setUsers] = useState([]);
    const [userSelected, setUserSelected] = useState([]);
    const filteredUser = users.filter((user) => !userSelected.includes(user.title));

    const [cycles, setCycles] = useState([]);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            const data = {
                type: 'cycles',
            };
            const result = await requestAuthSearchCoupon(data);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setCycles(result.data);
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

    const handleSelectService = async (value) => {
        const data = {
            type: 'service',
            service_type: value,
        };

        const result = await requestAuthSearchCoupon(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setServices(result.data);
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    const handleSelectApplyUser = async (value) => {
        if (value) {
            setUsers([]);
            setUserSelected([]);
            setApplyAllUsers(true);
        } else {
            const data = {
                type: 'user',
            };

            const result = await requestAuthSearchCoupon(data);
            setApplyAllUsers(false);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setUsers(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        }
    };

    const handleCreateCoupon = async (values) => {
        const {
            code,
            cycles_id,
            user_limit,
            expired_at,
            pay_method,
            usage_limit,
            first_order,
            description,
            min_discount,
            service_type,
            discount_type,
            recurring_type,
            discount_value,
            apply_services,
            apply_all_users,
            apply_users: applyUsers,
            max_discount: maxDiscount,
        } = values;

        const apply_users = apply_all_users ? [] : applyUsers;
        const max_discount = discount_type === 'percentage' ? 0 : maxDiscount;

        const data = {
            code,
            cycles_id,
            user_limit,
            pay_method,
            expired_at,
            description,
            apply_users,
            first_order,
            usage_limit,
            max_discount,
            min_discount,
            service_type,
            discount_type,
            apply_services,
            discount_value,
            recurring_type,
            apply_all_users,
        };

        setLoading(true);

        const result = await requestAuthCreateCoupon(data);

        setLoading(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setCallback([result.data, ...callback]);

            setOpen(false);

            notification.success({
                message: 'Thông báo',
                description: result?.message,
            });
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    return (
        <Drawer
            title="Thêm mới mã giảm giá"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            {loading ? (
                <Flex style={{ height: '60vh' }} align="center" justify="center">
                    <Spin />
                </Flex>
            ) : (
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleCreateCoupon}
                    initialValues={{
                        user_limit: 1,
                        min_discount: 0,
                        max_discount: 0,
                        usage_limit: 10,
                        discount_value: 1,
                        first_order: false,
                        pay_method: 'app_wallet',
                        discount_type: 'percentage',
                        apply_all_users: applyAllUsers,
                    }}
                >
                    <Row gutter={16}>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="service_type"
                                label="Loại dịch vụ"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn loại dịch vụ',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Loại dịch vụ"
                                    onChange={handleSelectService}
                                    options={[
                                        { label: 'Mã nguồn', value: 'Source' },
                                        { label: 'Tạo website', value: 'Template' },
                                        { label: 'Cloud Server', value: 'CloudServerProduct' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="apply_services"
                                label="Dịch vụ"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn dịch vụ',
                                    },
                                ]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn dịch vụ"
                                    value={serviceSelected}
                                    onChange={setServiceSelected}
                                    options={filteredService.map((item) => ({
                                        value: item.id,
                                        label: item.title,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="code"
                                label="Mã"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mã giảm giá',
                                    },
                                ]}
                            >
                                <Input placeholder="Mã" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="discount_type"
                                label="Loại giảm giá"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn loại giảm giá',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Loại giảm giá"
                                    options={[
                                        { label: 'Cố định', value: 'fixed' },
                                        { label: 'Phần trăm', value: 'percentage' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="discount_value"
                                label="Số tiền giảm"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số tiền giảm giá',
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Phân trăm hoặc cố định" className="w-full" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="min_discount"
                                label="Giá trị tối thiểu"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập giá trị tối thiểu',
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Giá trị tối thiểu để được giảm" className="w-full" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="max_discount"
                                label="Giá trị tối đa"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập giá trị tối đa',
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Giá trị tối đa để được giảm" className="w-full" />
                            </Form.Item>
                        </Col>

                        <Col md={12} xs={24}>
                            <Form.Item
                                name="usage_limit"
                                label="Số lần được sử dụng"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số lần được sử dụng',
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Số lần được sử dụng" className="w-full" />
                            </Form.Item>
                        </Col>

                        <Col md={12} xs={24}>
                            <Form.Item
                                name="user_limit"
                                label="Sử dụng cho 1 khách hàng"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số lần sử dụng cho 1 khách hàng',
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Số lần sử dụng cho 1 khách hàng" className="w-full" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="apply_all_users"
                                label="Khách hàng áp dụng"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn khách hàng áp dụng',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn áp dụng"
                                    onChange={handleSelectApplyUser}
                                    options={[
                                        { label: 'Tất cả khách hàng', value: true },
                                        { label: 'Một số khách hàng', value: false },
                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col md={12} xs={24}>
                            <Form.Item
                                name="apply_users"
                                label="Khách hàng được áp dụng"
                                rules={[
                                    {
                                        required: !applyAllUsers,
                                        message: 'Vui lòng chọn khách hàng được áp dụng',
                                    },
                                ]}
                            >
                                <Select
                                    disabled={applyAllUsers}
                                    mode="multiple"
                                    placeholder="Chọn khách hàng"
                                    value={userSelected}
                                    onChange={setUserSelected}
                                    options={filteredUser.map((item) => ({
                                        value: item.id,
                                        label: item.title,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="cycles_id"
                                label="Chu kỳ được áp dụng"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn chu kỳ được áp dụng',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn chu kỳ được áp dụng"
                                    options={cycles.map((cycle) => {
                                        return {
                                            value: cycle.id,
                                            label: cycle.title,
                                        };
                                    })}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="first_order"
                                label="Đơn hàng"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn đơn hàng được áp dụng',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn đơn hàng được áp dụng"
                                    options={[
                                        { label: 'Tất cả', value: false },
                                        { label: 'Đơn đầu tiên', value: true },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="recurring_type"
                                label="Loại đơn"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn loại đơn hàng được áp dụng',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn loại đơn hàng được áp dụng"
                                    options={[
                                        { label: 'Gia hạn', value: 'renew' },
                                        { label: 'Đăng ký', value: 'register' },
                                        { label: 'Nâng cấp', value: 'upgrade' },
                                        { label: 'Mua vĩnh viễn', value: 'buy' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="pay_method"
                                label="Phương thức thanh toán"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn phương thức thanh toán',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn phương thức thanh toán"
                                    options={[{ label: 'Ví Netcode', value: 'app_wallet' }]}
                                />
                            </Form.Item>
                        </Col>

                        <Col md={12} xs={24}>
                            <Form.Item
                                name="expired_at"
                                label="Thời gian hết hạn"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian hết hạn' }]}
                            >
                                <DatePicker showTime className="w-full" placeholder="Chọn thời gian hết hạn" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="description" label="Mô tả">
                                <TextArea rows={3} placeholder="Mô tả" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Flex justify="end" style={{ marginTop: 22 }}>
                        <Space>
                            <Button onClick={() => setOpen(false)}>Huỷ</Button>
                            <Button type="primary" htmlType="submit">
                                Thêm mới
                            </Button>
                        </Space>
                    </Flex>
                </Form>
            )}
        </Drawer>
    );
}

export default CreateCoupon;
