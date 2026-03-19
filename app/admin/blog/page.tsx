import BlogAdminClient from '@/components/admin/BlogAdminClient';
import { getAllBlogPostsAdmin } from '@/app/actions/admin';

export default async function AdminBlogPage() {
    const posts = await getAllBlogPostsAdmin();

    return <BlogAdminClient posts={posts} />;
}
