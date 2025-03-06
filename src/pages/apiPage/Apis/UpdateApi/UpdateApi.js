import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Flex, Form, Image, Input, Space, Drawer, Button, Select, InputNumber, notification } from 'antd';

import router from '~/configs/routes';
import { requestAuthUpdateApi } from '~/services/api';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';

const { TextArea } = Input;

function UpdateApi({ open, setOpen, api, callback, setCallback }) {
    const [imageUrl, setImageUrl] = useState('');

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (api.image_url) {
            setImageUrl(api.image_url);
        }
    }, [api.image_url]);

    const handleUpdateApi = async (values) => {
        const { title, slug_url, price, old_price, priority, version, free_usage, status, description } = values;

        if (!api.key) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được API cần cập nhật',
            });
        }

        const data = {
            title,
            price,
            status,
            version,
            slug_url,
            priority,
            old_price,
            free_usage,
            description,
        };
        const result = await requestAuthUpdateApi(api.key, data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result.status === 200) {
            const cloneApis = [...callback];

            const indexApi = cloneApis.findIndex((a) => a.key === api.key);
            if (indexApi === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy API trong danh sách',
                });
            }

            cloneApis[indexApi] = result.data;
            cloneApis.sort((a, b) => a.priority - b.priority);
            setCallback(cloneApis);

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
            title="Chi tiết API"
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
                onFinish={handleUpdateApi}
                initialValues={{
                    title: api.title,
                    price: api.price,
                    key: api.apikey.key,
                    status: api.status,
                    version: api.version,
                    slug_url: api.slug_url,
                    priority: api.priority,
                    old_price: api.old_price,
                    free_usage: api.free_usage,
                    description: api.description,
                    used: api.apikey.used,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="title"
                            label="Tên api"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên',
                                },
                            ]}
                        >
                            <Input placeholder="Nhập số tên" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="slug_url"
                            label="SEO"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập url seo',
                                },
                            ]}
                        >
                            <Input placeholder="Nhập số url seo" />
                        </Form.Item>
                    </Col>

                    <Col md={12} xs={24}>
                        <Form.Item
                            name="price"
                            label="Giá bán"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá hiện tại',
                                },
                            ]}
                        >
                            <InputNumber className="w-full" placeholder="Nhập giá hiện tại" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="old_price"
                            label="Giá cũ"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá cũ',
                                },
                            ]}
                        >
                            <InputNumber className="w-full" placeholder="Nhập giá cũ" />
                        </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                        <Form.Item
                            name="priority"
                            label="Sắp xếp"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập thứ tự sắp xếp',
                                },
                            ]}
                        >
                            <InputNumber className="w-full" placeholder="Nhập thứ tự sắp xếp" />
                        </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                        <Form.Item
                            name="version"
                            label="Phiên bản"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập phiên bản',
                                },
                            ]}
                        >
                            <Input placeholder="Nhập phiên bản" />
                        </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                        <Form.Item
                            name="free_usage"
                            label="Lượt dùng miễn phí"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập lượt dùng miễn phí',
                                },
                            ]}
                        >
                            <InputNumber placeholder="Lượt dùng miễn phí" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn trạng thái',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                options={[
                                    {
                                        value: 'activated',
                                        label: 'Hoạt động',
                                    },
                                    {
                                        value: 'maintenance',
                                        label: 'Đang bảo trì',
                                    },
                                    {
                                        value: 'blocked',
                                        label: 'Không hoạt động',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={18} xs={24}>
                        <Form.Item name="key" label="Apikey">
                            <Input placeholder="key" readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                        <Form.Item name="used" label="Lượt dùng">
                            <Input placeholder="Lượt dùng" readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label="Mô tả chi tiết"
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
                        >
                            <TextArea autoSize={{ minRows: 3, maxRows: 5 }} placeholder="Nhập mô tả chi tiết" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item label="Icon">
                            <Image
                                width={96}
                                height={96}
                                className="border rounded-8"
                                src={imageUrl}
                                alt="Image"
                                fallback={imageNotFound}
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
export default UpdateApi;
