import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconX } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, InputNumber, Row, Select, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateService } from '~/services/partner';

function ServiceUpdate({ open, setOpen, service, callback, setCallback }) {
    const [fields, setFields] = useState(service.discount_rules || []);

    // Hàm thêm cặp ô nhập liệu
    const handleAddFields = () => {
        setFields([...fields, {}]);
    };

    // Hàm xóa cặp ô nhập liệu
    const handleRemoveField = (index) => {
        const updatedFields = fields.filter((_, idx) => idx !== index);
        setFields(updatedFields);
    };

    const [form] = Form.useForm();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdateService = async (values) => {
        const discount_rules = fields.map((_, index) => ({
            service: values[`service_${index}`],
            discount: values[`discount_${index}`],
        }));

        if (!service.key) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID dịch vụ',
            });
        }

        const data = {
            discount_rules,
            discount_type: values.discount_type,
        };

        const result = await requestAuthUpdateService(service.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneServices = [...callback];

            const serviceIndex = cloneServices.findIndex((ser) => ser.key === service.key);
            if (serviceIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy dịch vụ trong danh sách',
                });
            }
            cloneServices[serviceIndex] = result.data;
            setCallback(cloneServices);

            setOpen(false);
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

    return (
        <Drawer
            title="Cập nhật dịch vụ đối tác"
            width={620}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Form layout="vertical" form={form} onFinish={handleUpdateService} initialValues={{ discount_type: service.discount_type }}>
                {fields.map((field, index) => (
                    <Row gutter={16} key={index} align="middle">
                        <Col md={10} xs={24}>
                            <Form.Item name={`service_${index}`} label="Số dịch vụ" initialValue={field.service}>
                                <InputNumber className="w-full" placeholder={`Số lượng dịch vụ ${index + 1}`} />
                            </Form.Item>
                        </Col>
                        <Col md={10} xs={24}>
                            <Form.Item name={`discount_${index}`} label="Chiết khấu (%)" initialValue={field.discount}>
                                <InputNumber className="w-full" placeholder={`Chiết khấu ${index + 1}`} min={0} max={100} />
                            </Form.Item>
                        </Col>

                        <Col md={4} xs={24}>
                            <Button danger className="mt-3" onClick={() => handleRemoveField(index)} icon={<IconX size={20} />}></Button>
                        </Col>
                    </Row>
                ))}

                <Row>
                    <Col span={24} className="mb-5">
                        <Button onClick={handleAddFields} type="dashed">
                            Thêm dòng
                        </Button>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="discount_type" label="Loại giảm giá">
                            <Select
                                mode="multiple"
                                placeholder="Chọn loại giảm giá dịch vụ"
                                options={[
                                    {
                                        label: 'APP',
                                        value: 'app',
                                    },
                                    {
                                        label: 'API',
                                        value: 'api',
                                    },
                                ]}
                            />
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
        </Drawer>
    );
}

export default ServiceUpdate;
