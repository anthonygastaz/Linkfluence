import { createKycSignedUrl } from '../../lib/kycSignedUrlHandler';

interface VercelRequest {
  method?: string;
  body?: unknown;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const result = await createKycSignedUrl({
    username: body.username as string | undefined,
    password: body.password as string | undefined,
    filePath: body.filePath as string | undefined,
  });

  return res.status(result.status).json(result.body);
}
