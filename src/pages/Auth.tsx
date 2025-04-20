import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { setAuthToken } from '../services/api'
import { login, register } from '../services/auth'

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const token =
          mode === 'login'
            ? await login(value.email, value.password)
            : await register(value);

        localStorage.setItem('token', token);
        setAuthToken(token);
        navigate({ to: '/' });
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {mode === 'login' ? 'Login' : 'Register'}
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {mode === 'register' && (
            <form.Field
              name="fullName"
              children={(field) => (
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border rounded"
                    placeholder="Your full name"
                  />
                </div>
              )}
            />
          )}

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value.includes('@') ? 'Invalid email' : undefined,
            }}
            children={(field) => (
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded"
                  placeholder="you@example.com"
                />
                {field.state.meta.isTouched && field.state.meta.errors && (
                  <div className="text-red-500 text-sm">
                    {field.state.meta.errors}
                  </div>
                )}
              </div>
            )}
          />

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 6 ? 'Password too short' : undefined,
            }}
            children={(field) => (
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded"
                  placeholder="••••••••"
                />
                {field.state.meta.isTouched && field. state.meta.errors && (
                  <div className="text-red-500 text-sm">
                    {field.state.meta.errors}
                  </div>
                )}
              </div>
            )}
          />

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          {mode === 'login' ? "Don't have an account?" : 'Already registered?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-blue-600 underline"
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
