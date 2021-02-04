import React, {useState} from 'react';
import ReCAPTCHA from 'react-google-recaptcha';


/* Components */
import { SubmitButton } from '../../components/SubmitButton';

/* API & Types */
import { redeemCheckout } from '../../api';
type CheckoutFormProps = {
  fancyId: string;
  onSuccess: (qr: string) => void
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ fancyId, onSuccess }) => {
  const [captchaSolved, setCaptchaSolved] = useState<boolean>(false);
  const [captchaValue, setCaptchaValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_KEY || '';

  const onChange = (value: string | null) => {
    if (value) {
      setCaptchaValue(value);
      setCaptchaSolved(true);
    }
  };
  const onExpired = () => {
    setCaptchaValue('');
    setCaptchaSolved(false);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setIsSubmitting(true);

    if (captchaValue && captchaSolved) {
      // POST
      try {
        const result = await redeemCheckout(fancyId, captchaValue);
        onSuccess(result.qr_hash);
      } catch (e) {
        if (e.message) setErrorMessage(e.message);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className={'checkout-form'}>
      <div className={'recaptcha'}>
        <ReCAPTCHA sitekey={recaptchaKey} onChange={onChange} onExpired={onExpired} />
      </div>
      <form onSubmit={handleSubmit}>
        <SubmitButton text={'Get claim link'} isSubmitting={isSubmitting} canSubmit={captchaSolved} />
        {errorMessage && (
          <div className={'error'}>{errorMessage}</div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
