/**
 * Input Sanitization Utilities
 * Protects against XSS and injection attacks
 */

// HTML entity encoding map
const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
    '=': '&#x3D;'
};

/**
 * Escapes HTML entities to prevent XSS attacks
 * Use this when displaying user-generated content
 */
export function escapeHtml(text: string): string {
    if (!text) return '';
    return String(text).replace(/[&<>"'`=/]/g, char => htmlEntities[char] || char);
}

/**
 * Strips all HTML tags from a string
 * Use this for plain text content
 */
export function stripHtml(text: string): string {
    if (!text) return '';
    return String(text).replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes user input for safe storage
 * Removes dangerous patterns and trims whitespace
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    
    return String(input)
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Trim
        .trim()
        // Limit length to prevent DoS
        .slice(0, 10000);
}

/**
 * Validates and sanitizes a review/comment
 * More aggressive sanitization for UGC
 */
export function sanitizeReview(review: string): string {
    if (!review) return '';
    
    return sanitizeInput(review)
        // Remove potential script injection patterns
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<script\b[^>]*>/gi, '')
        .replace(/<\/script>/gi, '')
        // Allow basic formatting but escape HTML
        .replace(/[<>]/g, char => htmlEntities[char] || char);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitizes a nickname - alphanumeric, spaces, and common characters only
 */
export function sanitizeNickname(nickname: string): string {
    if (!nickname) return '';
    
    return String(nickname)
        // Only allow safe characters
        .replace(/[^a-zA-Z0-9\s\-_]/g, '')
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        .trim()
        // Limit length
        .slice(0, 50);
}

/**
 * Generates a safe slug from text
 */
export function generateSlug(text: string): string {
    if (!text) return '';
    
    return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 100);
}

/**
 * Rate limiting helper - checks if action should be blocked
 * Use in conjunction with server-side rate limiting
 */
export function createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map<string, { count: number; firstAttempt: number }>();
    
    return {
        check(key: string): boolean {
            const now = Date.now();
            const record = attempts.get(key);
            
            if (!record) {
                attempts.set(key, { count: 1, firstAttempt: now });
                return true;
            }
            
            // Reset window
            if (now - record.firstAttempt > windowMs) {
                attempts.set(key, { count: 1, firstAttempt: now });
                return true;
            }
            
            // Check limit
            if (record.count >= maxAttempts) {
                return false;
            }
            
            record.count++;
            return true;
        },
        
        reset(key: string): void {
            attempts.delete(key);
        },
        
        remaining(key: string): number {
            const record = attempts.get(key);
            if (!record) return maxAttempts;
            return Math.max(0, maxAttempts - record.count);
        }
    };
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
    // 5 rating submissions per hour
    ratingSubmission: createRateLimiter(5, 60 * 60 * 1000),
    // 10 reports per hour
    reportSubmission: createRateLimiter(10, 60 * 60 * 1000),
    // 30 searches per minute
    search: createRateLimiter(30, 60 * 1000),
    // 100 upvotes per hour
    upvote: createRateLimiter(100, 60 * 60 * 1000),
};
