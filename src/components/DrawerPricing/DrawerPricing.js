import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, InputNumber, notification, Row, Select, Space } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetCyclesInitialize } from '~/services/module';

function DrawerPricing({ open, setOpen, onClick }) {
    const [cycles, setCycles] = useState([]);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            const result = await requestAuthGetCyclesInitialize();

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

    return (
        <Drawer
            title="Thông tin giá cả"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Form
                layout="vertical"
                form={form}
                onFinish={onClick}
                initialValues={{
                    price: 0,
                    discount: 0,
                    other_fees: 0,
                    renewal_fee: 0,
                    bonus_point: 0,
                    penalty_fee: 0,
                    upgrade_fee: 0,
                    creation_fee: 0,
                    brokerage_fee: 0,
                    original_price: 0,
                    cancellation_fee: 0,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="cycles_id"
                            label="Chu kỳ"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn chu kỳ',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn chu kỳ"
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
                            name="original_price"
                            label="Giá gốc"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá gốc',
                                },
                            ]}
                        >
                            <InputNumber placeholder="Giá gốc" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="price"
                            label="Giá hiện tại"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá hiện tại',
                                },
                            ]}
                        >
                            <InputNumber placeholder="Giá hiện tại" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="discount" label="Giảm giá (%)">
                            <InputNumber placeholder="Giảm giá (%)" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="creation_fee" label="Phí khởi tạo">
                            <InputNumber placeholder="Phí khởi tạo" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="penalty_fee" label="Phí phạt">
                            <InputNumber placeholder="Phí phạt" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="renewal_fee" label="Phí gia hạn">
                            <InputNumber placeholder="Phí gia hạn" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="upgrade_fee" label="Phí nâng cấp">
                            <InputNumber placeholder="Phí nâng cấp" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="cancellation_fee" label="Phí huỷ (%)">
                            <InputNumber placeholder="Phí huỷ (%)" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="brokerage_fee" label="Phí môi giới">
                            <InputNumber placeholder="Phí môi giới" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="other_fees" label="Chi phí khác">
                            <InputNumber placeholder="Chi phí khác" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="bonus_point" label="Điểm thưởng">
                            <InputNumber placeholder="Điểm thưởng" className="w-full" />
                        </Form.Item>
                    </Col>
                </Row>

                <Flex justify="end" style={{ marginTop: 22 }}>
                    <Space>
                        <Button onClick={() => setOpen(false)}>Huỷ</Button>
                        <Button type="primary" htmlType="submit">
                            Xác nhận
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default DrawerPricing;
