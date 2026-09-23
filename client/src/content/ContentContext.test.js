import { render, screen, waitFor } from '@testing-library/react';
import { ContentProvider, useContent } from './ContentContext';
import { portfolioApi } from '../services/api';

jest.mock('../services/api', () => ({
  portfolioApi: { getContent: jest.fn() },
}));

function ContentStatus() {
  const { content, source } = useContent();
  return <div data-testid="content-status">{source}:{content.profile.name}</div>;
}

beforeEach(() => {
  delete process.env.REACT_APP_CONTENT_PREVIEW;
  portfolioApi.getContent.mockReset();
});

afterEach(() => { delete process.env.REACT_APP_CONTENT_PREVIEW; });

test('production preview fails closed without rendering bundled content', async () => {
  process.env.REACT_APP_CONTENT_PREVIEW = 'true';
  portfolioApi.getContent.mockRejectedValue(new Error('offline'));
  render(<ContentProvider><ContentStatus /></ContentProvider>);
  expect(await screen.findByRole('alert')).toHaveTextContent('local fallback is disabled');
  expect(screen.queryByTestId('content-status')).not.toBeInTheDocument();
});

test('production preview identifies published content as read-only', async () => {
  process.env.REACT_APP_CONTENT_PREVIEW = 'true';
  portfolioApi.getContent.mockResolvedValue({ profile: { name: 'Published Henry' }, education: [] });
  render(<ContentProvider><ContentStatus /></ContentProvider>);
  expect(await screen.findByText(/Read-only production content/)).toBeInTheDocument();
  expect(screen.getByTestId('content-status')).toHaveTextContent('api:Published Henry');
});

test('uses content returned by the API', async () => {
  portfolioApi.getContent.mockResolvedValue({
    profile: { name: 'Remote Henry' },
    education: [],
  });

  render(<ContentProvider><ContentStatus /></ContentProvider>);

  await waitFor(() => {
    expect(screen.getByTestId('content-status')).toHaveTextContent('api:Remote Henry');
  });
});

test('keeps bundled content as an explicit fallback when the API fails', async () => {
  portfolioApi.getContent.mockRejectedValue(new Error('API unavailable'));

  render(<ContentProvider><ContentStatus /></ContentProvider>);

  await waitFor(() => {
    expect(screen.getByTestId('content-status')).toHaveTextContent('fallback:Henry Zhang');
  });
});
