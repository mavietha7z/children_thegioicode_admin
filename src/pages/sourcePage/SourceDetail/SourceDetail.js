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
import { requestAuthUpdateSource } from '~/services/source';

const { TextArea } = Input;

function SourceDetail({ open, setOpen, source, callback, setCallback }) {
    const [imageUrl, setImageUrl] = useState([]);
    const [imageMeta, setImageMeta] = useState([]);

    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [previewOpenImageUrl, setPreviewOpenImageUrl] = useState(false);

    const [previewImageMeta, setPreviewImageMeta] = useState('');
    const [previewOpenImageMeta, setPreviewOpenImageMeta] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            try {
                const url = await checkImage(source.image_url);

                const filename = url.split('/').pop();
                const [name, extension] = filename.split('.');

                setImageUrl([{ uid: -1, name: `${name}.${extension}`, status: 'done', url }]);
            } catch (error) {
                setImageUrl([{ uid: -1, name: 'imageNotFound.png', status: 'done', url: imageNotFound }]);
            }

            const imageMeta = await Promise.all(
                source.image_meta.map(async (item, index) => {
                    const filename = item.split('/').pop();
                    const [name, extension] = filename.split('.');

                    try {
                        const url = await checkImage(item);
                        return {
                            uid: index + 1,
                            name: `${name}.${extension}`,
                            status: 'done',
                            url,
                        };
                    } catch (error) {
                        return {
                            uid: index + 1,
                            name: 'imageNotFound.png',
                            status: 'done',
                            url: imageNotFound,
                        };
                    }
                }),
            );

            setImageMeta(imageMeta);
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePreviewImageMeta = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await configGetBase64(file.originFileObj);
        }
        setPreviewImageMeta(file.url || file.preview);
        setPreviewOpenImageMeta(true);
    };

    const handlePreviewImageUrl = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await configGetBase64(file.originFileObj);
        }
        setPreviewImageUrl(file.url || file.preview);
        setPreviewOpenImageUrl(true);
    };

    const handleChangeImageMeta = async ({ fileList: newFileList }) => {
        setImageMeta(newFileList);
    };
    const handleChangeImageUrl = async ({ fileList: newFileList }) => {
        setImageUrl(newFileList);
    };

    const handleUpdateSource = async (values) => {
        if (!source.key) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID mã nguồn cần cập nhật',
            });
        }

        let image_meta = imageMeta.map((image) => image.url || image.response.data);
        let data = {
            image_url: '',
            image_meta,
            ...values,
        };

        let image_url = imageUrl.map((image) => image.url || image.response.data);
        if (image_url.length > 0) {
            data.image_url = image_url[0];
        }

        const result = await requestAuthUpdateSource(source.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneSources = [...callback];

            const indexSource = cloneSources.findIndex((s) => s.key === source.key);
            if (indexSource === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy mã nguồn trong danh sách',
                });
            }

            cloneSources[indexSource] = result.data;
            cloneSources.sort((a, b) => a.priority - b.priority);
            setCallback(cloneSources);

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
            title="Chi tiết mã nguồn"
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
                onFinish={handleUpdateSource}
                initialValues={{
                    title: source.title,
                    slug_url: source.slug_url,
                    data_url: source.data_url,
                    demo_url: source.demo_url,
                    version: source.version,
                    priority: source.priority,
                    view_count: source.view_count,
                    purchase_count: source.purchase_count,
                    description: source.description,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                            <Input placeholder="Tiêu đề" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="slug_url" label="SEO" rules={[{ required: true, message: 'Vui lòng nhập url seo' }]}>
                            <Input placeholder="SEO" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="data_url" label="Data url">
                            <Input placeholder="Data url" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="demo_url" label="Demo url">
                            <Input placeholder="Demo url" />
                        </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                        <Form.Item name="version" label="Phiên bản" rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}>
                            <Input placeholder="Phiên bản" />
                        </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                        <Form.Item name="priority" label="Sắp xếp">
                            <InputNumber className="w-full" placeholder="Sắp xếp" />
                        </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                        <Form.Item name="view_count" label="Lượt xem">
                            <InputNumber className="w-full" placeholder="Lượt xem" />
                        </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                        <Form.Item name="purchase_count" label="Lượt mua">
                            <InputNumber className="w-full" placeholder="Lượt mua" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="description" label="Mô tả chi tiết">
                            <TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
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
                    <Col span={24}>
                        <Form.Item label="Ảnh demo">
                            <Upload
                                action={urlUpload}
                                listType="picture-card"
                                fileList={imageMeta}
                                onPreview={handlePreviewImageMeta}
                                onChange={handleChangeImageMeta}
                                withCredentials={true}
                                name="image"
                            >
                                {imageMeta.length >= 20 ? null : (
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
                            {previewImageMeta.length > 0 && (
                                <Image
                                    wrapperStyle={{
                                        display: 'none',
                                    }}
                                    preview={{
                                        visible: previewOpenImageMeta,
                                        onVisibleChange: (visible) => setPreviewOpenImageMeta(visible),
                                        afterOpenChange: (visible) => !visible && setPreviewImageMeta(''),
                                    }}
                                    src={previewImageMeta}
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
export default SourceDetail;
