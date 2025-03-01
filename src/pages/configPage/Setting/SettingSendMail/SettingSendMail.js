import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconMailCog } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Form, Input, InputNumber, notification, Row, Select } from 'antd';

import Setting from '../Setting';
import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetConfigSendMail, requestAuthUpdateConfigSendMail } from '~/services/app';

function SettingSendMail() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            const result = await requestAuthGetConfigSendMail();

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                const { partner, host, port, secure, email, password } = result.data;

                form.setFieldValue('host', host);
                form.setFieldValue('port', port);
                form.setFieldValue('email', email);
                form.setFieldValue('secure', secure);
                form.setFieldValue('partner', partner);
                form.setFieldValue('password', password);
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

    const handleUpdateConfigInfo = async (values) => {
        const result = await requestAuthUpdateConfigSendMail(values);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
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
        <Setting
            keyTab="2"
            label={
                <span className="box-align-center gap-2 text-subtitle">
                    <IconMailCog size={20} />
                    Gửi email
                </span>
            }
        >
            <Form layout="vertical" form={form} onFinish={handleUpdateConfigInfo}>
                <Row gutter={16} className="mt-4">
                    <Col md={12} xs={24}>
                        <Form.Item name="partner" label="Đối tác" rules={[{ required: true, message: 'Vui lòng nhập thông tin đối tác' }]}>
                            <Input size="large" placeholder="Đối tác" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="host" label="Host" rules={[{ required: true, message: 'Vui lòng nhập host' }]}>
                            <Input size="large" placeholder="Host" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="port" label="Port" rules={[{ required: true, message: 'Vui lòng nhập port' }]}>
                            <InputNumber size="large" placeholder="Port" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="secure" label="Chắc chắn" rules={[{ required: true, message: 'Vui lòng chọn chắc chắn' }]}>
                            <Select
                                size="large"
                                options={[
                                    { value: true, label: 'True' },
                                    { value: false, label: 'False' },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ email' }]}>
                            <Input size="large" placeholder="Email" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu email' }]}>
                            <Input.Password size="large" placeholder="Password" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button type="primary" size="large" htmlType="submit">
                            Lưu cấu hình
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Setting>
    );
}

export default SettingSendMail;
