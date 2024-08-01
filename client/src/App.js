import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// import all components
import Username from './components/Username';
import Password from './components/Password';
import Register from './components/Register';
import Profile from './components/Profile';
import Recovery from './components/Recovery';
import Reset from './components/Reset';
import PageNotFound from './components/PageNotFound';

// auth middleware
import { AuthorizeUser, ProtectRoute } from './middleware/auth';

// root router
const router = createBrowserRouter([
    {
        path: '/', element: <Username></Username>
    },
    {
        path: '/register', element: <Register></Register>
    },
    {
        path: '/password', element: <ProtectRoute><Password></Password></ProtectRoute>
    },
    {
        path: '/profile', element: <AuthorizeUser><Profile></Profile></AuthorizeUser>
    },
    {
        path: '/recovery', element: <Recovery></Recovery>
    },
    {
        path: '/reset', element: <Reset></Reset>
    },
    {
        path: '/*', element: <PageNotFound></PageNotFound>
    },
])

export default function App() {
  return (
    <main>
        <RouterProvider router={router}></RouterProvider>
    </main>
  )
}
