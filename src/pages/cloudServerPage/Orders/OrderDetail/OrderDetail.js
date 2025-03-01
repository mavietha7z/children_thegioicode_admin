import { Button, Drawer } from 'antd';
import { useEffect, useState } from 'react';
import { IconCopy } from '@tabler/icons-react';

import { serviceCopyKeyBoard } from '~/configs';

function OrderDetail({ open, setOpen, order }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        setData(JSON.stringify(order, null, 3));
    }, [order]);

    return (
        <Drawer
            title="Chi tiết đơn hàng"
            className="api-detail"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <div className="copy">
                <pre>
                    <code className="text-copy">{data}</code>
                </pre>

                <div className="btn-copy">
                    <Button size="small" className="box-center" onClick={() => serviceCopyKeyBoard(data)}>
                        <IconCopy size={18} />
                    </Button>
                </div>
            </div>
        </Drawer>
    );
}

export default OrderDetail;
