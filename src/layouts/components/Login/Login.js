import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconLock, IconMail } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Card, Flex, Input, Form, Divider, Spin, notification } from 'antd';

import router from '~/configs/routes';
import logoGitHub from '~/assets/image/github.png';
import logoGoogle from '~/assets/image/logo-google.png';
import { loginAuthSuccess } from '~/redux/reducer/auth';
import { requestGetCurrentAuth, requestLoginAuth, requestVerifyLoginAuth } from '~/services/auth';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVerify, setIsVerify] = useState(false);
    const [verifyType, setVerifyType] = useState(null);
    const [loadingButton, setLoadingButton] = useState(false);

    const [form] = Form.useForm();
    const { currentUser } = useSelector((state) => state.auth);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect_url');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Quản trị website - Đăng nhập quản trị website';

        if (currentUser) {
            const fetch = async () => {
                const result = await requestGetCurrentAuth();

                if (result?.status === 200) {
                    dispatch(loginAuthSuccess(result.data));
                    navigate(router.home);
                    setLoading(true);
                }
            };
            fetch();
        } else {
            setLoading(true);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleVerifyOtpLogin = async (values) => {
        const { otp } = values;

        if (!otp || otp.length !== 6) {
            return notification.error({ message: 'Thông báo', description: 'Mã xác minh không hợp lệ' });
        }

        setLoadingButton(true);
        const data = {
            otp,
            email,
            password,
            type: verifyType,
        };

        const result = await requestVerifyLoginAuth(data);

        setLoadingButton(false);
        if (result?.status === 200) {
            dispatch(loginAuthSuccess(result.data));
            navigate(redirectUrl || router.home);
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

    const handleLoginEmail = async (data) => {
        setEmail(data.email);
        setLoadingButton(true);
        setPassword(data.password);

        const result = await requestLoginAuth(data);

        setLoadingButton(false);
        if (result?.status === 2) {
            setIsVerify(true);
            setVerifyType(result.data);
        } else if (result?.status === 200) {
            dispatch(loginAuthSuccess(result.data));
            navigate(redirectUrl || router.home);
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

    const onChange = (otp) => {
        if (otp.length === 6) {
            form.submit();
        }
    };

    const sharedProps = {
        onChange,
    };

    return (
        <Fragment>
            {loading ? (
                <Flex justify="center" align="center" style={{ height: '100vh' }} className="login">
                    <Card className="login-content">
                        {isVerify ? (
                            <Fragment>
                                <h3 className="mb-1 font-weight-bold font-size-30">Xác thực OTP</h3>
                                <p className="mb-6 text-left">
                                    {verifyType === 'Email' ? (
                                        'Một mã xác minh đã được gửi đến địa chỉ email của bạn. Mã xác minh sẽ có hiệu lực trong 5 phút. Vui lòng nhập mã vào ô bên dưới để tiếp tục.'
                                    ) : (
                                        <Fragment>
                                            Bạn đã bật <b>Google Authenticator</b> để xác thực. Vui lòng mở ứng dụng{' '}
                                            <b>Google Authenticator</b> để nhận mã và nhập mã vào ô bên dưới để tiếp tục.
                                        </Fragment>
                                    )}
                                </p>
                                <Form form={form} name="horizontal_login" onFinish={handleVerifyOtpLogin}>
                                    <Form.Item
                                        name="otp"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập mã xác nhận',
                                            },
                                        ]}
                                    >
                                        <Input.OTP
                                            length={6}
                                            size="large"
                                            autoFocus
                                            placeholder="Mã xác nhận"
                                            {...sharedProps}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        disabled={loadingButton}
                                        style={{ width: '100%' }}
                                    >
                                        {loadingButton ? <Spin /> : <Fragment>Xác nhận</Fragment>}
                                    </Button>
                                </Form>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <h3 className="mb-4 font-weight-bold font-size-30">Welcome Back</h3>
                                <p className="mb-6 text-center">Chào mừng bạn trở lại quản lý website!</p>
                                <Form form={form} name="horizontal_login" onFinish={handleLoginEmail}>
                                    <Form.Item
                                        name="email"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập email',
                                            },
                                            {
                                                type: 'email',
                                                message: 'Email không đúng định dạng',
                                            },
                                        ]}
                                    >
                                        <Input size="large" autoFocus prefix={<IconMail />} placeholder="Nhập địa chỉ email của bạn" />
                                    </Form.Item>
                                    <Form.Item
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập mật khẩu',
                                            },
                                            {
                                                pattern: /^\S{6,30}$/,
                                                message: 'Mật khẩu không hợp lệ',
                                            },
                                        ]}
                                        style={{ marginBottom: 12 }}
                                    >
                                        <Input.Password
                                            size="large"
                                            prefix={<IconLock />}
                                            placeholder="Nhập mật khẩu của bạn"
                                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        />
                                    </Form.Item>
                                    <Flex justify="end" style={{ marginBottom: 12 }}>
                                        <Link
                                            to={router.login}
                                            onClick={() =>
                                                notification.error({ message: 'Thông báo', description: 'Chức năng đang được phát triển' })
                                            }
                                        >
                                            Quên mật khẩu?
                                        </Link>
                                    </Flex>
                                    <Form.Item shouldUpdate>
                                        {() => (
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                size="large"
                                                disabled={loadingButton}
                                                style={{ width: '100%' }}
                                            >
                                                {loadingButton ? <Spin /> : <Fragment>ĐĂNG NHẬP</Fragment>}
                                            </Button>
                                        )}
                                    </Form.Item>
                                </Form>
                                <Divider style={{ color: '#7a869a' }}>Hoặc thông qua</Divider>
                                <Flex justify="center" gap={10}>
                                    <Button
                                        size="large"
                                        style={{ display: 'flex', alignItems: 'center', borderRadius: 40 }}
                                        onClick={() =>
                                            notification.error({ message: 'Thông báo', description: 'Chức năng đang được phát triển' })
                                        }
                                    >
                                        <img src={logoGoogle} alt="Google" className="login-google" />
                                    </Button>
                                    <Button
                                        size="large"
                                        style={{ display: 'flex', alignItems: 'center', borderRadius: 40 }}
                                        onClick={() =>
                                            notification.error({ message: 'Thông báo', description: 'Chức năng đang được phát triển' })
                                        }
                                    >
                                        <img src={logoGitHub} alt="GitHub" className="login-google" />
                                    </Button>
                                </Flex>
                            </Fragment>
                        )}
                    </Card>
                </Flex>
            ) : (
                <Flex align="center" justify="center" style={{ height: '70vh' }}>
                    <Spin />
                </Flex>
            )}
        </Fragment>
    );
}

export default Login;
