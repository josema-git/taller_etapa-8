export interface PaginatedResponse<T> {
    start_page: number;
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface Post {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    likes: number;
    comments: number;
    team: string;
    created_at: string;
    permission_level: number;
    is_liked: boolean;
}

export interface Comment {
    id: number;
    author: string;
    post: number;
    content: string;
    created_at: string;
}
export interface Like {
    id: number;
    post: number;
    author: number;
    created_at: string;
}