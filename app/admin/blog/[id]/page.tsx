import BlogEditorClient from '@/components/admin/BlogEditorClient';
import { getBlogPostById } from '@/app/actions/admin';
import { notFound } from 'next/navigation';

interface EditBlogPostPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
    const { id } = await params;
    const post = await getBlogPostById(id);

    if (!post) {
        notFound();
    }

    return <BlogEditorClient post={post as any} isEditing />;
}
