import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdatePartner } from '~/services/partner';

function PartnerUpdate({ open, setOpen, partner, callback, setCallback }) {
    const [form] = Form.useForm();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdatePartner = async (values) => {
        const { whitelist_ip: whitelistIP } = values;

        if (!partner.key) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID đối tác',
            });
        }

        const whitelist_ip = whitelistIP.split(', ').map((ip) => ip.trim());
        const data = {
            whitelist_ip,
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
            title="Cập nhật đối tác"
            width={620}
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
                onFinish={handleUpdatePartner}
                initialValues={{
                    whitelist_ip: partner.whitelist_ip.join(', '),
                }}
            >
                <Row gutter={16}>
                    <Col md={24} xs={24}>
                        <Form.Item name="whitelist_ip" label="IP cho phép truy cập">
                            <Input placeholder="Mỗi IP khách nhau dấu phẩy (,)" />
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

export default PartnerUpdate;
