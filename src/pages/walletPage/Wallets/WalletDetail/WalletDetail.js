import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, InputNumber, Row, Select, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateWallet } from '~/services/wallet';

function WalletDetail({ open, setOpen, wallet, callback, setCallback }) {
    const [form] = Form.useForm();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdateWallet = async (values) => {
        if (!wallet.key) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID người dùng cần cập nhật ví',
            });
        }

        const result = await requestAuthUpdateWallet(wallet.key, values);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneWallets = [...callback];

            const indexWallet = cloneWallets.findIndex((w) => w.key === wallet.key);
            if (indexWallet === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ví người dùng trong danh sách',
                });
            }

            cloneWallets[indexWallet] = result.data;
            setCallback(cloneWallets);

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
            title={`Nạp - rút ví: ${wallet.id}`}
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
                onFinish={handleUpdateWallet}
                initialValues={{
                    id: wallet.id,
                    status: wallet.status,
                    currency: wallet.currency,
                    bonus_point: wallet.bonus_point,
                    main_balance: wallet.main_balance,
                    bonus_balance: wallet.bonus_balance,
                    total_balance: wallet.total_balance,
                    credit_balance: wallet.credit_balance,
                    total_recharge: wallet.total_recharge,
                    total_withdrawal: wallet.total_withdrawal,
                    total_bonus_point: wallet.total_bonus_point,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="id"
                            label="ID"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="currency"
                            label="Tiền tệ"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Select
                                options={[
                                    {
                                        label: 'VND',
                                        value: 'VND',
                                    },
                                    {
                                        label: 'USD',
                                        value: 'USD',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="credit_balance" label="SD chính">
                            <InputNumber style={{ width: '100%' }} placeholder="Số dư chính" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="bonus_balance" label="SD khuyễn mãi">
                            <Input readOnly placeholder="Số dư khuyễn mãi" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="total_balance" label="Tổng số dư">
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="bonus_point" label="Điểm thưởng">
                            <Input readOnly placeholder="Điểm thưởng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="main_balance" label="SD có thể rút">
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="total_bonus_point" label="Tổng điểm thưởng">
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="total_recharge" label="Tổng nạp">
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="total_withdrawal" label="Tổng rút">
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn trạng thái người dùng',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn trạng thái người dùng"
                                options={[
                                    {
                                        value: 'activated',
                                        label: 'Hoạt động',
                                    },
                                    {
                                        value: 'inactivated',
                                        label: 'Không hoạt động',
                                    },
                                    {
                                        value: 'deleted',
                                        label: 'Bị chặn',
                                    },
                                ]}
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

export default WalletDetail;
