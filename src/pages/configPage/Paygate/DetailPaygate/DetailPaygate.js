import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Image, Input, InputNumber, notification, Row, Select, Space, Upload } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { checkImage } from '~/configs';
import { configGetBase64 } from '~/configs';
import imageNotFound from '~/assets/image/image_not.jpg';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdatePaygate } from '~/services/app';

const { TextArea } = Input;

function DetailPaygate({ open, setOpen, paygate, callback, setCallback }) {
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
                const url = await checkImage(paygate.logo_url);

                const filename = url.split('/').pop();
                const [name, extension] = filename.split('.');

                setImageUrl([{ uid: -1, name: `${name}.${extension}`, status: 'done', url }]);
            } catch (error) {
                setImageUrl([{ uid: -1, name: 'imageNotFound.png', status: 'done', url: imageNotFound }]);
            }
        };
        fetch();
    }, [paygate]);

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

    const handleUpdatePaygate = async (values) => {
        const { logo_url, ...others } = values;

        if (!paygate.key) {
            return notification.error({ message: 'Thông báo', description: 'Không thể lấy được ID cổng thanh toán' });
        }

        let image_url = imageUrl.map((image) => image.url || image.response.data);
        if (image_url.length < 1) {
            return notification.error({ message: 'Thông báo', description: 'Vui lòng chọn tải logo cổng thanh toán' });
        }

        const data = {
            ...others,
            logo_url: image_url[0],
        };

        const result = await requestAuthUpdatePaygate(paygate.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePaygates = [...callback];

            const indexPaygate = clonePaygates.findIndex((pay) => pay.key === paygate.key);
            if (indexPaygate === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy cổng thanh toán trong danh sách',
                });
            }

            clonePaygates[indexPaygate] = result.data;
            setCallback(clonePaygates);

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
            title="Chi tiết cổng thanh toán"
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
                onFinish={handleUpdatePaygate}
                initialValues={{
                    name: paygate.name,
                    service: paygate.service,
                    vat_tax: paygate.vat_tax,
                    question: paygate.question,
                    promotion: paygate.promotion,
                    description: paygate.description,
                    bonus_point: paygate.bonus_point,
                    callback_code: paygate.callback_code,
                    minimum_payment: paygate.minimum_payment,
                    maximum_payment: paygate.maximum_payment,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="name"
                            label="Tên đầy đủ"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên đầy đủ',
                                },
                            ]}
                        >
                            <Input placeholder="Tên đầy đủ" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="service"
                            label="Dịch vụ"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn loại dịch vụ',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn loại dịch vụ"
                                options={[
                                    {
                                        label: 'Nạp',
                                        value: 'recharge',
                                    },
                                    {
                                        label: 'Rút',
                                        value: 'withdrawal',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="callback_code"
                            label="Callback code"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập callback code',
                                },
                            ]}
                        >
                            <Input placeholder="Callback code" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="bonus_point" label="Điểm thưởng">
                            <InputNumber placeholder="Điểm thưởng" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="promotion" label="Khuyễn mãi (%)">
                            <InputNumber placeholder="Khuyễn mãi (%)" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="vat_tax" label="Thuế giá trị gia tăng (VAT %)">
                            <InputNumber placeholder="Thuế giá trị gia tăng (VAT %)" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="minimum_payment"
                            label="Tối thiểu thanh toán"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số tiền',
                                },
                            ]}
                        >
                            <InputNumber placeholder="Tối thiểu thanh toán" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="maximum_payment"
                            label="Tối đa thanh toán"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số tiền',
                                },
                            ]}
                        >
                            <InputNumber placeholder="Tối đa thanh toán" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="question" label="Câu hỏi">
                            <TextArea rows={3} placeholder="Câu hỏi" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="description" label="Mô tả">
                            <TextArea rows={3} placeholder="Mô tả" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="logo_url" label="Logo">
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

export default DetailPaygate;
