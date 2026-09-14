import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./supabaseClient', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

test('renders the task manager for an authenticated user', () => {
  render(
    <App
      user={{ id: 'test-user', name: 'Test User', email: 'test@example.com', avatar: 'TU' }}
      onLogout={jest.fn()}
    />
  );
  expect(screen.getByText('DevTask')).toBeInTheDocument();
});
