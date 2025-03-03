import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, InputNumber, Row, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdatePartner } from '~/services/app';

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

        const { name, url, token, difference_cloud_server, difference_public_api } = values;

        const data = {
            url,
            name,
            token,
            difference_public_api,
            difference_cloud_server,
        };

        const result = await requestAuthUpdatePartner(partner.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePartners = [...callback];

            const partnerIndex = clonePartners.findIndex((part) => part.key === partner.key);
            if (partnerIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy đối tác trong danh sách',
                });
            }

            clonePartners[partnerIndex] = result.data;
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
                    token: partner.token,
                    difference_public_api: partner.difference_public_api,
                    difference_cloud_server: partner.difference_cloud_server,
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
                        <Form.Item
                            name="difference_cloud_server"
                            label="Giá chênh lệch VPS"
                            rules={[{ required: true, message: 'Vui lòng nhập giá chênh lệch vps' }]}
                        >
                            <InputNumber className="w-full" placeholder="Giá chênh lệch VPS" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="difference_public_api"
                            label="Giá chênh lệch API"
                            rules={[{ required: true, message: 'Vui lòng nhập giá chênh lệch API' }]}
                        >
                            <InputNumber className="w-full" placeholder="Giá chênh lệch API" />
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
                            Cập nhật
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default UpdatePartner;
