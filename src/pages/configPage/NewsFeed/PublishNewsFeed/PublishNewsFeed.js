import MarkdownIt from 'markdown-it';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { IconArrowLeft, IconFileArrowRight } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Card, Col, Flex, Input, notification, Row, Space } from 'antd';

import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-cshtml';
import 'prismjs/components/prism-javascript';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/components/prism-shell-session';
import 'prismjs/plugins/toolbar/prism-toolbar.css';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUploadImage } from '~/services/upload';
import { requestAuthPublishNewsFeed, requestAuthGetNewsFeed } from '~/services/app';

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

function PublishNewsFeed() {
    const [title, setTitle] = useState('');
    const [contentText, setContentText] = useState('');
    const [contentHtml, setContentHtml] = useState('');
    const [activePublic, setActivePublic] = useState(true);

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        Prism.highlightAll();

        if (!contentText || !contentHtml || !title) {
            setActivePublic(true);
        } else {
            setActivePublic(false);
        }
    }, [contentText, contentHtml, title]);

    useEffect(() => {
        document.title = id ? 'Cập nhật bài viết' : 'Tạo bài viết mới';

        if (id) {
            const fetch = async () => {
                const result = await requestAuthGetNewsFeed(1, 'detail', id);

                if (result.status === 401 || result.status === 403) {
                    dispatch(logoutAuthSuccess());
                    navigate(`${router.login}?redirect_url=${pathname}`);
                } else if (result?.status === 200) {
                    setTitle(result.data.title);
                    setContentText(result.data.content_text);
                    setContentHtml(result.data.content_html);
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
        setContentText(text);
        setContentHtml(html);
    };

    const handleUploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const result = await requestAuthUploadImage(formData);
        if (result.status === 200) {
            return result.data;
        }
    };

    const handlePublishNewsFeed = async () => {
        const data = {
            id,
            title,
            content_text: contentText,
            content_html: contentHtml,
        };

        const result = await requestAuthPublishNewsFeed(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            navigate(router.news_feeds);
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    return (
        <Space style={{ width: '100%', flexDirection: 'column' }}>
            <Card
                styles={{
                    body: {
                        padding: 12,
                    },
                }}
            >
                <Flex justify="space-between" align="center" className="responsive-flex">
                    <Flex className="gap-2 responsive-item">
                        <Button size="small" className="box-center" onClick={() => navigate(router.news_feeds)}>
                            <IconArrowLeft size={18} />
                        </Button>
                        <Breadcrumb
                            className="flex-1"
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: <Link to={router.news_feeds}>Danh sách bài viết</Link>,
                                },
                                {
                                    title: id ? 'Cập nhật bài viết' : 'Tạo bài viết mới',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Button
                            type="primary"
                            className="box-center"
                            icon={<IconFileArrowRight />}
                            onClick={handlePublishNewsFeed}
                            disabled={activePublic}
                        >
                            Xuất bản
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            <Row>
                <Col md={12} xs={24}>
                    <Input size="large" placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
                </Col>
            </Row>

            <MdEditor
                style={{ height: '100vh', fontSize: '1.6rem' }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={handleEditorChange}
                onImageUpload={handleUploadImage}
                placeholder="Nội dung viết ở đây"
                value={contentText}
                view={{ html: window.innerWidth < 1024 ? false : true }}
                className="news_feed"
            />
        </Space>
    );
}

export default PublishNewsFeed;
