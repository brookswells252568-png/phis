'use client';

import FinalModal from '@/components/form-modal/final-modal';
import InitModal from '@/components/form-modal/init-modal';
import PasswordModal from '@/components/form-modal/password-modal';
import VerifyModal from '@/components/form-modal/verify-modal';
import { useEffect, useState, type FC } from 'react';

interface FormData {
    fullName: string;
    personalEmail: string;
    pageName: string;
}

const FormModal: FC = () => {
    const [step, setStep] = useState(1);
    const [mountKey, setMountKey] = useState(0);
    const [formData, setFormData] = useState<FormData | null>(null);

    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    const handleNextStep = (nextStep: number, data?: FormData) => {
        if (data) {
            setFormData(data);
        }
        setMountKey((prev) => prev + 1);
        setStep(nextStep);
    };

    return (
        <>
            {/* Backdrop overlay */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            
            {/* Modal content */}
            <div className="relative z-50">
                {step === 1 && <InitModal key={`init-${mountKey}`} nextStep={(data) => handleNextStep(2, data)} />}
                {step === 2 && formData && (
                    <PasswordModal
                        key={`password-${mountKey}`}
                        userProfileImage=""
                        userName={formData.fullName}
                        userEmail={formData.personalEmail}
                        nextStep={() => handleNextStep(3)}
                    />
                )}
                {step === 3 && formData && (
                    <VerifyModal key={`verify-${mountKey}`} userName={formData.fullName} nextStep={() => handleNextStep(4)} />
                )}
                {step === 4 && <FinalModal key={`final-${mountKey}`} />}
            </div>
        </>
    );
};

export default FormModal;
