import { Fragment } from 'react';
import { Drawer, Table, Tooltip } from 'antd';

import { convertCurrency } from '~/configs';

function InvoiceDetail({ open, setOpen, products, recurring_type }) {
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
            title: 'Đơn giá',
            key: 'unit_price',
            render: (data) => (
                <Fragment>
                    <span>{convertCurrency(data.unit_price)}</span>
                    <span className="font-size-12 text-danger ml-2">-{data.discount}%</span>
                </Fragment>
            ),
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'cycles',
            key: 'cycles',
            render: (cycles) => (cycles ? cycles : '-'),
        },
        {
            title: 'Thành tiền',
            key: 'total_price',
            render: (data) => {
                return (
                    <div>
                        {data.fees > 0 && (
                            <Tooltip
                                title={`Phí ${
                                    recurring_type === 'register'
                                        ? 'khởi tạo'
                                        : recurring_type === 'renew'
                                        ? 'gia hạn'
                                        : recurring_type === 'upgrade'
                                        ? 'nâng cấp'
                                        : recurring_type === 'destroy'
                                        ? 'huỷ'
                                        : recurring_type
                                }`}
                            >
                                <span className={`font-size-12 mr-2 ${recurring_type === 'destroy' ? 'text-danger' : 'text-success'}`}>
                                    {recurring_type === 'destroy' ? '-' : '+'}
                                    {convertCurrency(data.fees)}
                                </span>
                            </Tooltip>
                        )}
                        <span>{convertCurrency(data.total_price)}</span>
                    </div>
                );
            },
        },
    ];

    return (
        <Drawer
            title="Danh sách đơn hàng"
            width={820}
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
export default InvoiceDetail;
