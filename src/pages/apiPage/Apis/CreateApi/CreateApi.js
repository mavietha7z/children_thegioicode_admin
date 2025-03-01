import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Row, Col, Flex, Form, Input, Space, Drawer, Button, Select, notification, Upload, InputNumber } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { requestAuthCreateApi } from '~/services/api';
import { logoutAuthSuccess } from '~/redux/reducer/auth';

const { TextArea } = Input;

function CreateApi({ open, setOpen, callback, setCallback }) {
    const [imageUrl, setImageUrl] = useState('');
    const [fileListImage, setFileListImage] = useState([]);
    const [loadingImage, setLoadingImage] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleChangeImage = async (info) => {
        setFileListImage(info.fileList);

        if (info.file.status === 'uploading') {
            setLoadingImage(true);
            return;
        }
        if (info.file.status === 'done') {
            const url = info.file.response.data;
            setLoadingImage(false);
            setImageUrl(url);
        }
    };

    const handleCreateApi = async (values) => {
        const { image_url, ...others } = values;

        const data = {
            image_url: imageUrl,
            ...others,
        };

        const result = await requestAuthCreateApi(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result.status === 200) {
            const cloneApis = [result.data, ...callback];
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
            title="Thêm mới API"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Form layout="vertical" form={form} onFinish={handleCreateApi}>
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="title"
                            label="Tên"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên',
                                },
                            ]}
                        >
                            <Input placeholder="Tên" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="category"
                            label="Category"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập category',
                                },
                            ]}
                        >
                            <Input placeholder="Category" />
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
                            <InputNumber className="w-full" placeholder="Giá hiện tại" />
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
                            <InputNumber className="w-full" placeholder="Giá cũ" />
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
                            <InputNumber placeholder="Sắp xếp" className="w-full" />
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
                            name="version"
                            label="Phiên bản"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập phiên bản',
                                },
                            ]}
                        >
                            <Input placeholder="Phiên bản" />
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
                        <Form.Item name="image_url" label="Ảnh">
                            <Upload
                                name="image"
                                listType="picture-card"
                                showUploadList={false}
                                action={urlUpload}
                                onChange={handleChangeImage}
                                fileList={fileListImage}
                                withCredentials={true}
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="avatar"
                                        style={{
                                            width: '100%',
                                        }}
                                    />
                                ) : (
                                    <button
                                        style={{
                                            border: 0,
                                            background: 'none',
                                        }}
                                        type="button"
                                    >
                                        {loadingImage ? <LoadingOutlined /> : <PlusOutlined />}
                                    </button>
                                )}
                            </Upload>
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
export default CreateApi;
