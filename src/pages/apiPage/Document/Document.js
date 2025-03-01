import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumb, Button, Card, Flex, notification, Space } from 'antd';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-javascript';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/toolbar/prism-toolbar.css';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUploadImage } from '~/services/upload';
import { requestAuthGetDocumentApi, requestAuthUpdateDocumentApi } from '~/services/api';

// Khởi tạo MarkdownIt với Prism.js
const mdParser = new MarkdownIt({
    highlight: (str, lang) => {
        if (lang && Prism.languages[lang]) {
            return `<pre className="language-${lang}"><code className="language-${lang}">${Prism.highlight(
                str,
                Prism.languages[lang],
                lang,
            )}</code></pre>`;
        } else {
            return `<pre><code>${mdParser.utils.escapeHtml(str)}</code></pre>`;
        }
    },
});

function Document() {
    const [title, setTitle] = useState('');
    const [documentText, setDocumentText] = useState('');
    const [documentHtml, setDocumentHtml] = useState('');

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách apis';

        Prism.highlightAll();

        if (id) {
            const fetch = async () => {
                const result = await requestAuthGetDocumentApi(id);

                if (result.status === 401 || result.status === 403) {
                    dispatch(logoutAuthSuccess());
                    navigate(`${router.login}?redirect_url=${pathname}`);
                } else if (result?.status === 200) {
                    setTitle(result.data.title);
                    setDocumentText(result.data.document_text);
                    setDocumentHtml(result.data.document_html);
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                    });
                }
            };
            fetch();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleEditorChange = ({ html, text }) => {
        setDocumentText(text);
        setDocumentHtml(html);
    };

    const handleUploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const result = await requestAuthUploadImage(formData);
        if (result.status === 200) {
            return result.data;
        }
    };

    const handleUpdateApi = async () => {
        const data = {
            document_text: documentText,
            document_html: documentHtml,
        };

        const result = await requestAuthUpdateDocumentApi(id, data);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result.status === 200) {
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
        <Space style={{ width: '100%', flexDirection: 'column' }}>
            <Card styles={{ body: { padding: 12 } }}>
                <Flex justify="space-between" align="center">
                    <Flex className="gap-2" align="center">
                        <Button size="small" className="box-center" onClick={() => navigate(router.apis)}>
                            <IconArrowLeft size={18} />
                        </Button>
                        <Breadcrumb
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: <Link to={router.apis}>Apis</Link>,
                                },
                                {
                                    title: `${title}`,
                                },
                            ]}
                        />
                    </Flex>

                    <Button type="primary" onClick={handleUpdateApi}>
                        Cập nhật
                    </Button>
                </Flex>
            </Card>

            <Card>
                <MdEditor
                    style={{ height: '100vh', fontSize: '1.6rem' }}
                    renderHTML={(text) => mdParser.render(text)}
                    onChange={handleEditorChange}
                    onImageUpload={handleUploadImage}
                    placeholder="Nội dung viết ở đây"
                    value={documentText}
                    view={{ html: window.innerWidth < 1024 ? false : true }}
                    className="news_feed"
                />
            </Card>
        </Space>
    );
}

export default Document;
