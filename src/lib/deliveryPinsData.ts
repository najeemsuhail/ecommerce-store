import * as fs from 'fs';
import * as path from 'path';

export interface DeliveryPinData {
  pinCode: string;
  type: 'cod' | 'prepaid';
}

// Paths to the COD and prepaid JSON files
const COD_DATA_PATH = path.join(process.cwd(), 'public', 'data', 'cod-pincode.json');
const PREPAID_DATA_PATH = path.join(process.cwd(), 'public', 'data', 'prepaid-pincode.json');

const readPinsFromFile = (filePath: string, type: DeliveryPinData['type']): DeliveryPinData[] => {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(fileContent) as
    | Array<{ pinCode?: string; pincode?: number | string; type?: string }>
    | { pinCode?: string; pincode?: number | string; type?: string };

  const entries = Array.isArray(parsed) ? parsed : [parsed];

  return entries
    .map((entry) => {
      const rawPin = entry.pinCode ?? entry.pincode;
      const pinCode = rawPin === undefined ? '' : String(rawPin).padStart(6, '0');
      const entryType = entry.type === 'cod' || entry.type === 'prepaid' ? entry.type : type;
      return { pinCode, type: entryType } as DeliveryPinData;
    })
    .filter((entry) => /^\d{6}$/.test(entry.pinCode));
};

export async function readDeliveryPins(): Promise<DeliveryPinData[]> {
  try {
    const codPins = readPinsFromFile(COD_DATA_PATH, 'cod');
    const prepaidPins = readPinsFromFile(PREPAID_DATA_PATH, 'prepaid');
    return [...codPins, ...prepaidPins];
  } catch (error) {
    console.error('Error reading delivery pins:', error);
    return [];
  }
}

export async function findDeliveryPin(pinCode: string): Promise<DeliveryPinData | null> {
  const allPins = await readDeliveryPins();
  return allPins.find((pin) => pin.pinCode === pinCode) || null;
}

export async function saveDeliveryPins(data: DeliveryPinData[]): Promise<void> {
  try {
    const dir = path.dirname(COD_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const codPins = data
      .filter((entry) => entry.type === 'cod')
      .map((entry) => ({ pincode: Number(entry.pinCode), type: 'cod' as const }));
    const prepaidPins = data
      .filter((entry) => entry.type === 'prepaid')
      .map((entry) => ({ pincode: Number(entry.pinCode), type: 'prepaid' as const }));

    fs.writeFileSync(COD_DATA_PATH, JSON.stringify(codPins, null, 2), 'utf-8');
    fs.writeFileSync(PREPAID_DATA_PATH, JSON.stringify(prepaidPins, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving delivery pins:', error);
    throw error;
  }
}
