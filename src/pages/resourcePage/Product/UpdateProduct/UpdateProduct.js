import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Image, Input, InputNumber, Row, Space, Upload, notification } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { checkImage, configGetBase64 } from '~/configs';
import imageNotFound from '~/assets/image/image_not.jpg';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateResourceProduct } from '~/services/resource';

const { TextArea } = Input;

function UpdateProduct({ open, setOpen, product, callback, setCallback }) {
    const [imageUrl, setImageUrl] = useState([]);

    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [previewOpenImageUrl, setPreviewOpenImageUrl] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            try {
                const url = await checkImage(product.image_url);

                const filename = url.split('/').pop();
                const [name, extension] = filename.split('.');

                setImageUrl([{ uid: -1, name: `${name}.${extension}`, status: 'done', url }]);
            } catch (error) {
                setImageUrl([{ uid: -1, name: 'imageNotFound.png', status: 'done', url: imageNotFound }]);
            }
        };
        fetch();
    }, [product]);

    const handlePreviewImageUrl = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await configGetBase64(file.originFileObj);
        }
        setPreviewImageUrl(file.url || file.preview);
        setPreviewOpenImageUrl(true);
    };

    const handleChangeImageUrl = async ({ fileList: newFileList }) => {
        setImageUrl(newFileList);
    };

    const handleUpdateProduct = async (values) => {
        let data = {
            image_url: '',
            ...values,
        };

        let image_url = imageUrl.map((image) => image.url || image.response.data);
        if (image_url.length < 1) {
            return notification.error({
                message: 'Thông báo',
                description: 'Vui lòng tải lên một ảnh chính',
            });
        }
        data.image_url = image_url[0];

        const result = await requestAuthUpdateResourceProduct(product.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneProducts = [...callback];

            const productIndex = cloneProducts.findIndex((c) => c.key === product.key);
            if (productIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy danh mục trong danh sách',
                });
            }

            cloneProducts[productIndex] = result.data;
            cloneProducts.sort((a, b) => a.priority - b.priority);
            setCallback(cloneProducts);

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
            title="Chi tiết loại tài khoản"
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
                onFinish={handleUpdateProduct}
                initialValues={{
                    title: product.title,
                    priority: product.priority,
                    view_count: product.view_count,
                    description: product.description,
                    category: product.category.title,
                    purchase_count: product.purchase_count,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                            <Input placeholder="Danh mục" readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                            <Input placeholder="Tiêu đề" />
                        </Form.Item>
                    </Col>
                    <Col md={8} xs={24}>
                        <Form.Item name="priority" label="Ưu tiên">
                            <InputNumber className="w-full" placeholder="Ưu tiên" />
                        </Form.Item>
                    </Col>
                    <Col md={8} xs={24}>
                        <Form.Item name="view_count" label="Lượt xem">
                            <InputNumber className="w-full" placeholder="Lượt xem" />
                        </Form.Item>
                    </Col>
                    <Col md={8} xs={24}>
                        <Form.Item name="purchase_count" label="Lượt mua">
                            <InputNumber className="w-full" placeholder="Lượt mua" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="description" label="Mô tả ngắn">
                            <TextArea rows={3} placeholder="Nhập mô tả ngắn" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item label="Ảnh" name="image_url">
                            <Upload
                                action={urlUpload}
                                listType="picture-card"
                                fileList={imageUrl}
                                onPreview={handlePreviewImageUrl}
                                onChange={handleChangeImageUrl}
                                withCredentials={true}
                                name="image"
                            >
                                {imageUrl.length >= 1 ? null : (
                                    <button
                                        style={{
                                            border: 0,
                                            background: 'none',
                                        }}
                                        type="button"
                                    >
                                        <PlusOutlined />
                                    </button>
                                )}
                            </Upload>
                            {previewImageUrl.length > 0 && (
                                <Image
                                    wrapperStyle={{
                                        display: 'none',
                                    }}
                                    preview={{
                                        visible: previewOpenImageUrl,
                                        onVisibleChange: (visible) => setPreviewOpenImageUrl(visible),
                                        afterOpenChange: (visible) => !visible && setPreviewImageUrl(''),
                                    }}
                                    src={previewImageUrl}
                                    fallback={imageNotFound}
                                />
                            )}
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
export default UpdateProduct;
