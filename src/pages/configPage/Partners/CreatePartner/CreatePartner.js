import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreatePartner } from '~/services/app';

const { TextArea } = Input;

function CreatePartner({ open, setOpen, callback, setCallback }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleCreatePartner = async (values) => {
        const result = await requestAuthCreatePartner(values);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setCallback([result.data, ...callback]);

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
            title="Thêm mới đối tác"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Form layout="vertical" form={form} onFinish={handleCreatePartner}>
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item name="name" label="Tên đối tác" rules={[{ required: true, message: 'Vui lòng nhập tên đối tác' }]}>
                            <Input placeholder="Tên đối tác" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="url" label="Website url" rules={[{ required: true, message: 'Vui lòng nhập website url' }]}>
                            <Input placeholder="Website url" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="token" label="Token" rules={[{ required: true, message: 'Vui lòng nhập token đối tác' }]}>
                            <TextArea rows={3} placeholder="Token" />
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
        </Drawer>
    );
}

export default CreatePartner;
