import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateCloudServerPartner } from '~/services/cloudServer';

const { TextArea } = Input;

function UpdatePartner({ open, setOpen, partner, callback, setCallback }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleCreatePartner = async (values) => {
        if (!partner.key) {
            return notification.error({ message: 'Thông báo', description: 'Không thể lấy được ID đối tác cần cập nhật' });
        }

        const { name, url, api_key, password, node_select, description } = values;

        const data = {
            url,
            name,
            password,
            description,
            node_select,
            key: api_key,
        };

        const result = await requestAuthUpdateCloudServerPartner(partner.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePartners = [...callback];

            const indexPartner = clonePartners.findIndex((part) => part.key === partner.key);
            if (indexPartner === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy đối tác trong danh sách',
                });
            }

            clonePartners[indexPartner] = result.data;
            setCallback(clonePartners);

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
            title="Chi tiết đối tác"
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
                onFinish={handleCreatePartner}
                initialValues={{
                    url: partner.url,
                    name: partner.name,
                    api_key: partner.api_key,
                    password: partner.password,
                    description: partner.description,
                    node_select: partner.node_select,
                }}
            >
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
                    <Col md={12} xs={24}>
                        <Form.Item name="api_key" label="API key" rules={[{ required: true, message: 'Vui lòng nhập API key đối tác' }]}>
                            <Input placeholder="API key" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="password"
                            label="API Password"
                            rules={[{ required: true, message: 'Vui lòng nhập API Password đối tác' }]}
                        >
                            <Input placeholder="API Password" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="node_select"
                            label="Node Select"
                            rules={[{ required: true, message: 'Vui lòng nhập Node Select Server' }]}
                        >
                            <Input placeholder="Node Select" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="description" label="Mô tả">
                            <TextArea rows={3} placeholder="Nhập mô tả ngắn" />
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

export default UpdatePartner;
