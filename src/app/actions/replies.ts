'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type ReplyType = 'professor' | 'campus';

interface Reply {
    id: string;
    rating_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user_nickname?: string;
    is_anonymous: boolean;
}

/**
 * Add a reply to a review
 */
export async function addReply(
    ratingId: string, 
    content: string, 
    type: ReplyType,
    isAnonymous: boolean = false
): Promise<{ success: boolean; error?: string; reply?: Reply }> {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in to reply' };
    }
    
    // Validate content
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
        return { success: false, error: 'Reply cannot be empty' };
    }
    if (trimmedContent.length > 500) {
        return { success: false, error: 'Reply must be 500 characters or less' };
    }
    
    const tableName = type === 'professor' ? 'rating_replies' : 'campus_rating_replies';
    
    const { data, error } = await supabase
        .from(tableName)
        .insert({
            rating_id: ratingId,
            user_id: user.id,
            content: trimmedContent,
            is_anonymous: isAnonymous
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding reply:', error);
        if (error.message.includes('3 replies')) {
            return { success: false, error: 'You can only post up to 3 replies per review' };
        }
        return { success: false, error: 'Failed to add reply. Please try again.' };
    }
    
    return { success: true, reply: data };
}

/**
 * Get all replies for a review
 */
export async function getReplies(
    ratingId: string, 
    type: ReplyType
): Promise<{ success: boolean; replies: Reply[]; error?: string }> {
    const supabase = await createClient();
    
    const tableName = type === 'professor' ? 'rating_replies' : 'campus_rating_replies';
    
    const { data, error } = await supabase
        .from(tableName)
        .select(`
            id,
            rating_id,
            user_id,
            content,
            created_at,
            is_anonymous,
            users:user_id (nickname)
        `)
        .eq('rating_id', ratingId)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('Error fetching replies:', error);
        return { success: false, replies: [], error: 'Failed to load replies' };
    }
    
    // Transform data to include nickname (or mask if anonymous)
    const replies = (data || []).map((reply: any) => ({
        id: reply.id,
        rating_id: reply.rating_id,
        user_id: reply.user_id,
        content: reply.content,
        created_at: reply.created_at,
        is_anonymous: reply.is_anonymous,
        user_nickname: reply.is_anonymous ? 'Anonymous' : (reply.users?.nickname || 'Unknown User')
    }));
    
    return { success: true, replies };
}

/**
 * Delete a reply (only within 24 hours)
 */
export async function deleteReply(
    replyId: string, 
    type: ReplyType
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in' };
    }
    
    const tableName = type === 'professor' ? 'rating_replies' : 'campus_rating_replies';
    
    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', replyId)
        .eq('user_id', user.id);
    
    if (error) {
        console.error('Error deleting reply:', error);
        if (error.message.includes('24 hours')) {
            return { success: false, error: 'Replies can only be deleted within 24 hours' };
        }
        return { success: false, error: 'Failed to delete reply' };
    }
    
    return { success: true };
}

/**
 * Get reply count for a review
 */
export async function getReplyCount(
    ratingId: string, 
    type: ReplyType
): Promise<number> {
    const supabase = await createClient();
    
    const tableName = type === 'professor' ? 'rating_replies' : 'campus_rating_replies';
    
    const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('rating_id', ratingId);
    
    if (error) {
        console.error('Error counting replies:', error);
        return 0;
    }
    
    return count || 0;
}
