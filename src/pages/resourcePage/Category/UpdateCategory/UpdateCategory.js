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
import { requestAuthUpdateResourceCategory } from '~/services/resource';

const { TextArea } = Input;

function UpdateCategory({ open, setOpen, category, callback, setCallback }) {
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
                const url = await checkImage(category.image_url);

                const filename = url.split('/').pop();
                const [name, extension] = filename.split('.');

                setImageUrl([{ uid: -1, name: `${name}.${extension}`, status: 'done', url }]);
            } catch (error) {
                setImageUrl([{ uid: -1, name: 'imageNotFound.png', status: 'done', url: imageNotFound }]);
            }
        };
        fetch();
    }, [category]);

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

    const handleUpdateCategory = async (values) => {
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

        const result = await requestAuthUpdateResourceCategory(category.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneCategories = [...callback];

            const categoryIndex = cloneCategories.findIndex((c) => c.key === category.key);
            if (categoryIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy danh mục trong danh sách',
                });
            }

            cloneCategories[categoryIndex] = result.data;
            cloneCategories.sort((a, b) => a.priority - b.priority);
            setCallback(cloneCategories);

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
            title="Chi tiết danh mục"
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
                onFinish={handleUpdateCategory}
                initialValues={{
                    title: category.title,
                    priority: category.priority,
                    slug_url: category.slug_url,
                    description: category.description,
                }}
            >
                <Row gutter={16}>
                    <Col md={20} xs={24}>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                            <Input placeholder="Tiêu đề" />
                        </Form.Item>
                    </Col>
                    <Col md={4} xs={24}>
                        <Form.Item name="priority" label="Ưu tiên">
                            <InputNumber className="w-full" placeholder="Ưu tiên" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="slug_url" label="Slug URL" rules={[{ required: true, message: 'Vui lòng nhập slug URL' }]}>
                            <Input placeholder="Slug URL" />
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
export default UpdateCategory;
