import { generateSPKIFingerprint } from "mockttp";

interface GeneratePacFileInput {
  shouldProxy(url: string, host: string): boolean;
}

export async function generatePacFile({
  shouldProxy,
}: GeneratePacFileInput): Promise<string> {
  console.log(`[PAC] - ${shouldProxy}`);
  return "~/.malcolm/proxy.pac";
}

interface MalcolmSystemConfig {
  shouldProxy(url: string, host: string): boolean;
  https: {
    cert: string;
    key: string;
  };
}

export async function prepareSystem({
  shouldProxy,
  https,
}: MalcolmSystemConfig) {
  const spkiFingerprint = generateSPKIFingerprint(https.cert);
  console.log(`[SPKI Fingerprint] - ${spkiFingerprint}`);

  const pacFilePath = await generatePacFile({ shouldProxy });
  console.log(`[PAC File] - ${pacFilePath}`);
}
