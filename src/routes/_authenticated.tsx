import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/auth',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});
