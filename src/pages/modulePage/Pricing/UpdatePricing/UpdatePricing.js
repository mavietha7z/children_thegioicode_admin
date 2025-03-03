import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, InputNumber, Row, Space, Spin, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdatePricing } from '~/services/module';

function UpdatePricing({ open, setOpen, pricing, callback, setCallback }) {
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdatePricing = async (data) => {
        setLoading(true);

        const result = await requestAuthUpdatePricing('info', pricing.key, data);

        setLoading(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePricings = [...callback];

            const indexPricing = clonePricings.findIndex((cycles) => cycles.key === pricing.key);
            if (indexPricing === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy giá cả trong danh sách',
                });
            }

            clonePricings[indexPricing] = result.data;
            setCallback(clonePricings);

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
            title="Chi tiết giá sản phẩm"
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
                    onFinish={handleUpdatePricing}
                    initialValues={{
                        price: pricing.price,
                        discount: pricing.discount,
                        other_fees: pricing.other_fees,
                        service: pricing.service.title,
                        bonus_point: pricing.bonus_point,
                        penalty_fee: pricing.penalty_fee,
                        renewal_fee: pricing.renewal_fee,
                        upgrade_fee: pricing.upgrade_fee,
                        service_type: pricing.service_type,
                        creation_fee: pricing.creation_fee,
                        cycles: pricing.cycles.display_name,
                        brokerage_fee: pricing.brokerage_fee,
                        cancellation_fee: pricing.cancellation_fee,
                    }}
                >
                    <Row gutter={16}>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="service"
                                label="Dịch vụ"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input placeholder="Dịch vụ" readOnly />
                            </Form.Item>
                        </Col>
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
                                <Input placeholder="Loại dịch vụ" readOnly />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="cycles"
                                label="Chu kỳ"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn chu kỳ',
                                    },
                                ]}
                            >
                                <Input placeholder="Chu kỳ" readOnly />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="price"
                                label="Giá"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập giá dịch vụ',
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Giá" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="discount" label="Giảm giá (%)">
                                <InputNumber placeholder="Giảm giá (%)" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="creation_fee" label="Phí khởi tạo">
                                <InputNumber placeholder="Phí khởi tạo" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="penalty_fee" label="Phí phạt">
                                <InputNumber placeholder="Phí phạt" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="renewal_fee" label="Phí gia hạn">
                                <InputNumber placeholder="Phí gia hạn" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="upgrade_fee" label="Phí nâng cấp">
                                <InputNumber placeholder="Phí nâng cấp" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="cancellation_fee" label="Phí huỷ (%)">
                                <InputNumber placeholder="Phí huỷ (%)" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="brokerage_fee" label="Phí môi giới">
                                <InputNumber placeholder="Phí môi giới" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="other_fees" label="Chi phí khác">
                                <InputNumber placeholder="Chi phí khác" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="bonus_point" label="Điểm thưởng">
                                <InputNumber placeholder="Điểm thưởng" style={{ width: '100%' }} />
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

export default UpdatePricing;
