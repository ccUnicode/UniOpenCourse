import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { escapeHtml } from './html.utils';

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
    expect(escapeHtml("O'Brien & Co.")).toBe('O&#39;Brien &amp; Co.');
  });
});

describe('MailService', () => {
  let service: MailService;
  let fetchMock: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(''),
    });
    global.fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const values: Record<string, string> = {
                BREVO_API_KEY: 'test-key',
                MAIL_FROM: 'Test <test@example.com>',
                FRONTEND_URL: 'http://localhost:3000',
                BREVO_REQUEST_TIMEOUT_MS: '15000',
              };
              return values[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should escape the user name in the HTML email body', async () => {
    await service.sendVerificationEmail(
      'user@example.com',
      '<img src=x onerror=alert(1)>',
      'abc123',
    );

    const [[, requestInit]] = fetchMock.mock.calls as Array<[string, { body: string }]>;
    const payload = JSON.parse(requestInit.body) as { htmlContent: string };

    expect(payload.htmlContent).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(payload.htmlContent).not.toContain('<img src=x');
  });

  it('should pass an AbortSignal to the Brevo fetch request', async () => {
    await service.sendVerificationEmail('user@example.com', 'Test', 'abc123');

    const [[, requestInit]] = fetchMock.mock.calls as Array<
      [string, { signal: AbortSignal }]
    >;
    expect(requestInit.signal).toBeInstanceOf(AbortSignal);
  });
});
