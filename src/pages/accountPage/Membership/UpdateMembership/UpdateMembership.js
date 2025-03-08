import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Space, notification, InputNumber } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateMembership } from '~/services/account';

const { TextArea } = Input;

function UpdateMembership({ open, setOpen, membership, callback, setCallback }) {
    const [form] = Form.useForm();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdateMembership = async (values) => {
        if (!membership.key) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID bậc thành viên',
            });
        }
        if (values.discount < 0 || values.discount > 100) {
            return notification.error({
                message: 'Thông báo',
                description: 'Giảm giá chỉ được từ 1% đến 100%',
            });
        }

        if (values.achieve_point < 0) {
            return notification.error({
                message: 'Thông báo',
                description: 'Điểm thành tích luỹ phải lớn hơn hoặc bằng 0',
            });
        }
        const result = await requestAuthUpdateMembership(membership.key, 'info', values);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneMemberships = [...callback];

            const indexMembership = cloneMemberships.findIndex((member) => member.key === membership.key);
            if (indexMembership === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy bậc thành viên trong danh sách',
                });
            }

            cloneMemberships[indexMembership].discount = values.discount;
            cloneMemberships[indexMembership].description = values.description;
            cloneMemberships[indexMembership].achieve_point = values.achieve_point;
            cloneMemberships.sort((a, b) => a.achieve_point - b.achieve_point);
            setCallback(cloneMemberships);

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
            title={`Bậc #${membership.id}`}
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
                onFinish={handleUpdateMembership}
                initialValues={{
                    discount: membership.discount,
                    description: membership.description,
                    achieve_point: membership.achieve_point,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item name="achieve_point" label="Điểm cần đạt được">
                            <InputNumber className="w-full" placeholder="Nhập điểm cần đạt được" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="discount" label="Giảm giá dịch vụ (%)">
                            <InputNumber className="w-full" placeholder="Nhập % giảm giá dịch vụ" />
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

export default UpdateMembership;
