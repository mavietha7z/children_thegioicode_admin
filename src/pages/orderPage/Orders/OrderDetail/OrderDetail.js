import { Fragment } from 'react';
import { Button, Drawer, Table } from 'antd';
import { IconDownload } from '@tabler/icons-react';

import { convertCurrency } from '~/configs';

function OrderDetail({ open, setOpen, products }) {
    const columns = [
        {
            title: 'Nội dung',
            key: 'title',
            render: (data) => (
                <Fragment>
                    <div className="font-weight-bold font-size-16">{data.title}</div>
                    <div className="text-subtitle">{data.description}</div>
                </Fragment>
            ),
        },
        {
            title: 'Số tiền',
            key: 'unit_price',
            render: (data) => (
                <Fragment>
                    <span>{convertCurrency(data.unit_price)}</span>
                    <span className="font-size-12 text-danger ml-2">-{data.discount}%</span>
                </Fragment>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_price',
            key: 'total_price',
            render: (total_price) => convertCurrency(total_price),
        },
        {
            title: 'Dữ liệu',
            dataIndex: 'data_url',
            key: 'data_url',
            render: (data_url) =>
                data_url && (
                    <a href={data_url} target="_blank" rel="noreferrer">
                        <Button type="primary" size="small" className="box-center">
                            <IconDownload size={16} />
                        </Button>
                    </a>
                ),
        },
    ];

    return (
        <Drawer
            title="Danh sách đơn hàng"
            width={1000}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Table columns={columns} dataSource={products.map((product, index) => ({ key: index, ...product }))} pagination={false} />
        </Drawer>
    );
}
export default OrderDetail;
