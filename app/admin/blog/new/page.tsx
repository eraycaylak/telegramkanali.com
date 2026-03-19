import BlogEditorClient from '@/components/admin/BlogEditorClient';
import { supabase } from '@/lib/supabaseClient';

export default async function NewBlogPostPage() {
    const { data: categories } = await supabase.from('categories').select('*').order('name');
    
    return <BlogEditorClient categories={categories || []} />;
}
