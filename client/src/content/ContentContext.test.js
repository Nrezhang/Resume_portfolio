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
  portfolioApi.getContent.mockReset();
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
