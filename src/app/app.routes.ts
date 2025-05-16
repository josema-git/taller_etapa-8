import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import("@/shared/pages/layout/layout.component"),
        children: [
            {
                path: '',
                loadComponent: () => import("@/posts/pages/list/list.component"),
            },
            {
                path: 'post/:postId',
                loadComponent: () => import("@/posts/pages/specific-post/specific-post.component")
            },
            {
                path: 'create',
                loadComponent: () => import("@/posts/pages/add-post/add-post.component"),
            },
        ]
    },
    {
        path: 'login',
        loadComponent: () => import("@/auth/pages/login/login.component"),
    },
    {
        path: 'register',
        loadComponent: () => import("@/auth/pages/register/register.component"),
    }
];
