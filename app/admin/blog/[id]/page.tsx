import BlogEditorClient from '@/components/admin/BlogEditorClient';
import { getBlogPostById } from '@/app/actions/admin';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface EditBlogPostPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
    const { id } = await params;
    const post = await getBlogPostById(id);

    if (!post) {
        notFound();
    }

    const { data: categories } = await supabase.from('categories').select('*').order('name');

    return <BlogEditorClient post={post as any} isEditing categories={categories || []} />;
}
