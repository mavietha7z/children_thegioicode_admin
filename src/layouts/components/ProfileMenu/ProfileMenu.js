import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Divider, Flex, notification } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconPower, IconUsersGroup, IconWallet } from '@tabler/icons-react';

import './ProfileMenu.css';
import router from '~/configs/routes';
import { requestLogoutAuth } from '~/services/auth';
import IconBalance from '~/assets/icon/IconBalance';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageAvatarDefault from '~/assets/image/avatar-default.png';

function ProfileMenu() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const { currentUser } = useSelector((state) => state.auth);

    const handleLogoutAuth = async () => {
        const result = await requestLogoutAuth();

        if (result.status === 200) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    return (
        <div className="profile__menu-content">
            <Flex align="center" style={{ padding: '16px 16px 8px 16px' }}>
                <div style={{ width: 45 }}>
                    <Avatar
                        src={currentUser?.avatar_url || imageAvatarDefault}
                        style={{ width: 45, height: 45, lineHeight: 45 }}
                        alt="Avatar"
                    />
                </div>

                <div className="ml-2 flex-1">
                    <div style={{ color: '#000' }} className="font-bold">
                        {currentUser?.full_name}
                    </div>
                    <div style={{ fontSize: 'smaller', color: '#000' }}>{currentUser?.email}</div>
                    <div className="profile__menu-status">{currentUser?.membership.current.name}</div>
                </div>
            </Flex>
            <Divider style={{ margin: '4px 0' }} />

            <ul className="profile__menu-list">
                <Link to={router.wallets} className="w-full">
                    <li className="profile__menu-item">
                        <IconWallet size={18} />
                        <span className="profile__menu-title">Quản lý ví</span>
                    </li>
                </Link>
                <Link to={router.notification_web} className="w-full">
                    <li className="profile__menu-item">
                        <IconBalance width={18} height={18} />
                        <span className="profile__menu-title">Biến động số dư</span>
                    </li>
                </Link>
                <Link to={router.users} className="w-full">
                    <li className="profile__menu-item">
                        <IconUsersGroup size={18} />
                        <span className="profile__menu-title">Quản lý người dùng</span>
                    </li>
                </Link>

                <Divider style={{ margin: '4px 0' }} />
                <li className="profile__menu-item" onClick={handleLogoutAuth}>
                    <IconPower size={18} />
                    <span className="profile__menu-title">Đăng xuất</span>
                </li>
            </ul>
        </div>
    );
}

export default ProfileMenu;
