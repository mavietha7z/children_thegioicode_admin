import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select } from 'antd';

function ModuleTemplate() {
    return (
        <Form.List name="modules">
            {(fields, { add, remove }) => (
                <div
                    style={{
                        display: 'flex',
                        rowGap: 16,
                        flexDirection: 'column',
                        marginBottom: 24,
                    }}
                >
                    {fields.map((field) => (
                        <Card
                            size="small"
                            title={`Mô-đun ${field.name + 1}`}
                            key={field.key}
                            extra={
                                <CloseOutlined
                                    onClick={() => {
                                        remove(field.name);
                                    }}
                                />
                            }
                        >
                            <Row style={{ margin: '0 -4px' }}>
                                <Col md={7} xs={24} style={{ padding: '0 4px' }}>
                                    <Form.Item label="Mô-đun" className="mb-0" name={[field.name, 'modun']}>
                                        <Input placeholder="Nhập tên mô-đun" />
                                    </Form.Item>
                                </Col>
                                <Col md={13} xs={24} style={{ padding: '0 4px' }}>
                                    <Form.Item label="Mô tả" className="mb-0" name={[field.name, 'content']}>
                                        <Input placeholder="Mô tả ngắn mô-đun" />
                                    </Form.Item>
                                </Col>
                                <Col md={4} xs={24} style={{ padding: '0 4px' }}>
                                    <Form.Item label="Bao gồm" name={[field.name, 'include']}>
                                        <Select
                                            placeholder="Chọn"
                                            options={[
                                                {
                                                    value: true,
                                                    label: 'Có',
                                                },
                                                {
                                                    value: false,
                                                    label: 'Không',
                                                },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Mô tả chi tiết */}
                            <Form.Item label="Mô tả chi tiết">
                                <Form.List name={[field.name, 'description']}>
                                    {(subFields, subOpt) => (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                rowGap: 16,
                                            }}
                                        >
                                            {subFields.map((subField, index) => (
                                                <Row style={{ margin: '0 -4px' }} key={index}>
                                                    <Col span={23} style={{ padding: '0 4px' }}>
                                                        <Form.Item noStyle name={[subField.name, 'desc']}>
                                                            <Input placeholder="Mô tả chi tiết mô-đun" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={1} style={{ padding: '0 4px' }}>
                                                        <CloseOutlined
                                                            onClick={() => {
                                                                subOpt.remove(subField.name);
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                            ))}
                                            <Button type="dashed" onClick={() => subOpt.add()} block>
                                                + Thêm mô tả chi tiết
                                            </Button>
                                        </div>
                                    )}
                                </Form.List>
                            </Form.Item>
                        </Card>
                    ))}

                    <Button type="dashed" onClick={() => add()} block>
                        + Thêm mô-đun
                    </Button>
                </div>
            )}
        </Form.List>
    );
}

export default ModuleTemplate;
