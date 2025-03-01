import { Link } from 'react-router-dom';
import { Fragment, useEffect } from 'react';
import { Button, Flex, Result } from 'antd';
import { IconHome } from '@tabler/icons-react';

import router from '~/configs/routes';

function NotFound({ coming = false }) {
    useEffect(() => {
        document.title = 'Thegioicode.com - Not Found';
    }, []);

    return (
        <Flex align="center" justify="center" className="container h-full">
            {coming ? (
                <Result status="403" subTitle={<strong>Coming soon...</strong>} />
            ) : (
                <Result
                    status="404"
                    title={<h2 className="font-size-26 font-max">Không tìm thấy nội dung 😓</h2>}
                    subTitle={
                        <Fragment>
                            URL của nội dung này đã
                            <strong> bị thay đổi</strong> hoặc <strong>không còn tồn tại</strong>
                            <br />
                            Nếu bạn <strong>đang lưu URL này</strong>, hãy thử <strong>truy cập lại từ trang chủ</strong> thay vì dùng URL
                            đã lưu
                        </Fragment>
                    }
                    extra={
                        <Link to={router.home}>
                            <Button type="primary">
                                <div className="box-center">
                                    <IconHome stroke={1.3} size={20} />
                                    <span className="ml-1">Quay lại trang chủ</span>
                                </div>
                            </Button>
                        </Link>
                    }
                />
            )}
        </Flex>
    );
}

export default NotFound;
