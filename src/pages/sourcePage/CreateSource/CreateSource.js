import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Space, Form, Input, Button, Row, Col, Select, Drawer, Flex, Upload, Image, InputNumber, notification } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreateSource } from '~/services/source';

const { TextArea } = Input;

const OPTIONS = [
    'JavaScript',
    'Java',
    'Python',
    'Golang',
    'PHP',
    'C#',
    'C++',
    'Kotlin',
    'Swift',
    'Ruby',
    'Django',
    'Spring Boot',
    'ExpressJS',
    'NodeJs',
    'ASP.NET Core',
    'TensorFlow',
    'Flask',
    'Angular',
    'Ruby On Rails',
    'Laravel',
    'ReactJS',
    'Swiftic',
    'React Native',
    'Flutter',
    'Xamarin',
    'Ionic',
    'TypeScript',
    'Rust',
    'Scala',
    'Perl',
    'VueJS',
    'Bootstrap',
    'Svelte',
    'NextJS',
    'NestJS',
    'Symfony',
    'Meteor',
];

function CreateSource({ open, setOpen, callback, setCallback }) {
    const [imageUrl, setImageUrl] = useState('');
    const [fileListImage, setFileListImage] = useState([]);
    const [loadingImage, setLoadingImage] = useState(false);

    const [previewImageMeta, setPreviewImageMeta] = useState('');
    const [fileListImageMeta, setFileListImageMeta] = useState([]);
    const [previewOpenImageMeta, setPreviewOpenImageMeta] = useState(false);

    const [selectedItems, setSelectedItems] = useState([]);
    const filteredOptions = OPTIONS.filter((o) => !selectedItems.includes(o));

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

    // File meta
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = file.response.data;
        }
        setPreviewImageMeta(file.url || file.preview);
        setPreviewOpenImageMeta(true);
    };
    const handleChange = ({ fileList: newFileList }) => setFileListImageMeta(newFileList);

    // Create
    const handleCreateSource = async (values) => {
        const { image_url: imageUrl, image_meta: imageMeta, ...other } = values;

        let image_url = '';
        if (imageUrl) {
            image_url = imageUrl.fileList[imageUrl.fileList.length - 1].response.data;
        }
        let image_meta = [];
        if (imageMeta) {
            image_meta = imageMeta.fileList.map((file) => file.response.data);
        }

        const data = {
            image_url,
            image_meta,
            ...other,
        };

        const result = await requestAuthCreateSource(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setCallback([result.data, ...callback]);
            form.resetFields();
            setImageUrl('');
            setFileListImage([]);
            setFileListImageMeta([]);
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
            title="Tạo mới mã nguồn"
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
                onFinish={handleCreateSource}
                initialValues={{
                    price: 0,
                    version: '',
                    priority: 1,
                    demo_url: '',
                    data_url: '',
                    view_count: 0,
                    description: '',
                    purchase_count: 0,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item name="title" label="Tên mã nguồn" rules={[{ required: true, message: 'Vui lòng nhập tên mã nguồn' }]}>
                            <Input placeholder="Tên mã nguồn" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="version" label="Phiên bản" rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}>
                            <Input placeholder="Phiên bản mã nguồn" />
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
                    <Col span={12}>
                        <Form.Item name="languages" label="Ngôn ngữ">
                            <Select
                                className="text-subtitle w-full mb-3"
                                mode="multiple"
                                placeholder="Viết bằng ngôn ngữ"
                                value={selectedItems}
                                onChange={setSelectedItems}
                                options={filteredOptions.map((item) => ({
                                    value: item,
                                    label: item,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={4} xs={24}>
                        <Form.Item name="priority" label="Ưu tiên">
                            <InputNumber className="w-full" placeholder="Ưu tiên" />
                        </Form.Item>
                    </Col>
                    <Col md={4} xs={24}>
                        <Form.Item name="view_count" label="Lượt xem">
                            <InputNumber className="w-full" placeholder="Lượt xem" />
                        </Form.Item>
                    </Col>
                    <Col md={4} xs={24}>
                        <Form.Item name="purchase_count" label="Lượt mua">
                            <InputNumber className="w-full" placeholder="Lượt mua" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="description" label="Mô tả chi tiết">
                            <TextArea rows={4} placeholder="Nhập mô tả chi tiết mã nguồn" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="image_url" label="Ảnh" rules={[{ required: true }]}>
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
                    <Col span={24}>
                        <Form.Item name="image_meta" label="Ảnh demo">
                            <Upload
                                name="image"
                                action={urlUpload}
                                fileList={fileListImageMeta}
                                listType="picture-card"
                                onChange={handleChange}
                                onPreview={handlePreview}
                                withCredentials={true}
                            >
                                {fileListImageMeta.length < 50 && (
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
                        </Form.Item>
                        {previewImageMeta && (
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
                            />
                        )}
                    </Col>
                </Row>

                <Flex justify="end" style={{ marginTop: 22 }}>
                    <Space>
                        <Button onClick={() => setOpen(false)}>Huỷ</Button>
                        <Button type="primary" htmlType="submit">
                            Tạo mới
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default CreateSource;
