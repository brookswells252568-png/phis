import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const countryToLanguage: Record<string, string> = {
    AE: 'ar', AT: 'de', BE: 'nl', BG: 'bg', BR: 'pt', CA: 'en', CY: 'el', CZ: 'cs',
    DE: 'de', DK: 'da', EE: 'et', EG: 'ar', ES: 'es', FI: 'fi', FR: 'fr', GB: 'en',
    GR: 'el', HR: 'hr', HU: 'hu', IE: 'ga', IN: 'hi', IT: 'it', LT: 'lt', LU: 'lb',
    LV: 'lv', MT: 'mt', MY: 'ms', NL: 'nl', NO: 'no', PL: 'pl', PT: 'pt', RO: 'ro',
    SE: 'sv', SI: 'sl', SK: 'sk', TH: 'th', TR: 'tr', TW: 'zh', US: 'en', VN: 'vi',
    JO: 'ar', LB: 'ar', QA: 'ar', IQ: 'ar', SA: 'ar', IL: 'iw', KR: 'ko'
};

async function translateSingle(text: string, targetLang: string): Promise<string> {
    if (targetLang === 'en') {
        return text;
    }

    try {
        const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
            params: {
                client: 'gtx',
                sl: 'en',
                tl: targetLang,
                dt: 't',
                q: text
            },
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const data = response.data;
        const translatedText = data[0]
            ?.map((item: unknown[]) => item[0])
            .filter(Boolean)
            .join('');

        return translatedText || text;
    } catch {
        return text;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { texts, countryCode } = await req.json();

        if (!Array.isArray(texts) || !countryCode) {
            return NextResponse.json(
                { error: 'Missing texts array or countryCode' },
                { status: 400 }
            );
        }

        const targetLang = countryToLanguage[countryCode] || 'en';

        // Translate all texts in parallel
        const results = await Promise.all(
            texts.map(text => translateSingle(text, targetLang))
        );

        const translationMap: Record<string, string> = {};
        texts.forEach((text, index) => {
            translationMap[text] = results[index];
        });

        return NextResponse.json({ results: translationMap });
    } catch (error) {
        console.error('Translation API error:', error);
        return NextResponse.json(
            { error: 'Translation failed' },
            { status: 500 }
        );
    }
}

