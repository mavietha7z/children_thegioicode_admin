import dayjs from 'dayjs';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import TextArea from 'antd/es/input/TextArea';
import vi from 'antd/es/date-picker/locale/vi_VN';
import { useLocation, useNavigate } from 'react-router-dom';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Button, Col, DatePicker, Drawer, Flex, Form, Input, InputNumber, Row, Select, Space, Spin, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateCoupon } from '~/services/module';

dayjs.extend(customParseFormat);

const buddhistLocale = {
    ...vi,
    lang: {
        ...vi.lang,
    },
};

function UpdateCoupon({ open, setOpen, coupon, callback, setCallback }) {
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdateCoupon = async (values) => {
        const {
            code,
            expired_at,
            user_limit,
            pay_method,
            usage_limit,
            first_order,
            description,
            min_discount,
            max_discount,
            discount_type,
            recurring_type,
            discount_value,
        } = values;

        const data = {
            code,
            expired_at,
            user_limit,
            pay_method,
            usage_limit,
            first_order,
            description,
            min_discount,
            max_discount,
            discount_type,
            recurring_type,
            discount_value,
        };

        setLoading(true);

        const result = await requestAuthUpdateCoupon('info', coupon.key, data);

        setLoading(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneCoupons = [...callback];

            const indexCoupon = cloneCoupons.findIndex((cou) => cou.key === coupon.key);
            if (indexCoupon === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy giá cả trong danh sách',
                });
            }

            cloneCoupons[indexCoupon] = result.data;
            setCallback(cloneCoupons);

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
            title="Chi tiết mã giảm giá"
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
                    onFinish={handleUpdateCoupon}
                    initialValues={{
                        code: coupon.code,
                        user_limit: coupon.user_limit,
                        pay_method: coupon.pay_method,
                        usage_limit: coupon.usage_limit,
                        first_order: coupon.first_order,
                        description: coupon.description,
                        min_discount: coupon.min_discount,
                        max_discount: coupon.max_discount,
                        discount_type: coupon.discount_type,
                        expired_at: dayjs(coupon.expired_at),
                        recurring_type: coupon.recurring_type,
                        discount_value: coupon.discount_value,
                    }}
                >
                    <Row gutter={16}>
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
                                label="Số lần được sử dụng cho 1 người"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số lần được sử dụng cho 1 người',
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Số lần được sử dụng cho 1 người" className="w-full" />
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
                                <DatePicker locale={buddhistLocale} showTime className="w-full" placeholder="Chọn thời gian hết hạn" />
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
                                Cập nhật
                            </Button>
                        </Space>
                    </Flex>
                </Form>
            )}
        </Drawer>
    );
}

export default UpdateCoupon;
