import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, InputNumber, Row, Select, Space, Spin, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreateCycles } from '~/services/module';

function CreateCycles({ open, setOpen, callback, setCallback }) {
    const [loading, setLoading] = useState(false);
    const [selectOption, setSelectOption] = useState('months');

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleCreatePricing = async (data) => {
        setLoading(true);

        const result = await requestAuthCreateCycles(data);

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
            title="Thêm mới chu kỳ"
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
                <Form layout="vertical" form={form} onFinish={handleCreatePricing} initialValues={{ unit: selectOption }}>
                    <Row gutter={16}>
                        <Col md={12} xs={24}>
                            <Form.Item name="value" label="Giá trị">
                                <InputNumber placeholder="Giá trị" disabled={selectOption === 'forever'} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="unit"
                                label="Đơn vị"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn đơn vị',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn đơn vị"
                                    value={selectOption}
                                    onChange={(e) => {
                                        setSelectOption(e);
                                        form.setFieldsValue({ value: null });
                                    }}
                                    options={[
                                        {
                                            label: 'Tháng',
                                            value: 'months',
                                        },
                                        {
                                            label: 'Năm',
                                            value: 'years',
                                        },
                                        {
                                            label: 'Vĩnh viễn',
                                            value: 'forever',
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="display_name"
                                label="Tên hiển thị"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập tên hiển thị',
                                    },
                                ]}
                            >
                                <Input placeholder="Tên hiển thị" />
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

export default CreateCycles;
