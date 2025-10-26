import QRCode from 'qrcode';

export async function generateWalletAddress(): Promise<string> {
  const randomBytes = new Uint8Array(20);
  crypto.getRandomValues(randomBytes);
  const address = '0x' + Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return address;
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      width: 400,
      margin: 2,
      color: {
        dark: '#10B981',
        light: '#FFFFFF',
      },
    });
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export function formatGseedAmount(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}


export const GSEED_TO_PYUSD_RATE = 0.5;