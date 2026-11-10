import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../constants.js';
import { EMPTY_PROFILE, STEP_KEYS, validateAll, validateStep } from '../validation.js';

const TITLES = { personal: 'Your details', measurements: 'Measurements', delivery: 'Delivery', review: 'Review' };
const LABELS = {
  fullName: 'Full name',
  email: 'Email',
  phone: 'Mobile number',
  category: 'Usual garment',
  chest: 'Chest or bust (cm)',
  waist: 'Waist (cm)',
  height: 'Height (cm)',
  fit: 'Preferred fit',
  address: 'Address',
  city: 'City',
  pincode: 'PIN code',
  consent: 'Consent',
};
const ORDER = Object.keys(LABELS);

export default function ProfileForm({ initial, onSubmit, serverFields, submitError, submitting }) {
  const [values, setValues] = useState({ ...EMPTY_PROFILE, ...initial });
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [focusToken, setFocusToken] = useState(0);
  const summaryRef = useRef(null);
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  const keys = [...STEP_KEYS, 'review'];
  const step = keys[stepIndex];
  const errorList = ORDER.filter((k) => errors[k]);

  useEffect(() => {
    if (serverFields && Object.keys(serverFields).length) {
      setErrors(serverFields);
      setFocusToken((t) => t + 1);
    }
  }, [serverFields]);

  useEffect(() => {
    if (focusToken > 0) summaryRef.current?.focus();
  }, [focusToken]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [stepIndex]);

  const set = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const next = { ...values, [name]: value };
    setValues(next);
    if (attempted) setErrors(validateStep(step, next));
  };

  const field = (name) => ({
    id: `f-${name}`,
    name,
    value: values[name],
    onChange: set(name),
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `f-${name}-error` : `f-${name}-hint`,
  });

  const Error = ({ name }) =>
    errors[name] ? (
      <p id={`f-${name}-error`} className="field-error">
        <span className="sr-only">Error: </span>
        {errors[name]}
      </p>
    ) : null;

  const next = () => {
    const e = validateStep(step, values);
    setErrors(e);
    setAttempted(true);
    if (Object.keys(e).length) {
      setFocusToken((t) => t + 1);
      return;
    }
    setAttempted(false);
    setStepIndex((i) => i + 1);
  };

  const back = () => {
    setErrors({});
    setAttempted(false);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const submit = (e) => {
    e.preventDefault();
    if (step !== 'review') return next();
    const all = validateAll(values);
    if (Object.keys(all).length) {
      setErrors(all);
      setFocusToken((t) => t + 1);
      const failing = STEP_KEYS.findIndex((s) => Object.keys(validateStep(s, values)).length);
      setStepIndex(failing);
      return;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={submit} noValidate aria-labelledby="form-title">
      <h2 id="form-title">Fit profile</h2>
      <ol className="steps" aria-label="Progress">
        {keys.map((k, i) => (
          <li key={k} aria-current={i === stepIndex ? 'step' : undefined} className={i <= stepIndex ? 'done' : ''}>
            <span className="step-num">{i + 1}</span> {TITLES[k]}
          </li>
        ))}
      </ol>

      {(errorList.length > 0 || submitError) && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="error-summary">
          <h3>{submitError && !errorList.length ? 'We could not save your profile' : `Please fix ${errorList.length} ${errorList.length === 1 ? 'problem' : 'problems'}`}</h3>
          {submitError && !errorList.length && <p>{submitError}</p>}
          <ul>
            {errorList.map((k) => (
              <li key={k}>
                <a
                  href={`#f-${k}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`f-${k}`)?.focus();
                  }}
                >
                  {LABELS[k]}: {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="step">
        <legend className="sr-only">{TITLES[step]}</legend>
        <h3 ref={headingRef} tabIndex={-1}>
          Step {stepIndex + 1} of {keys.length}: {TITLES[step]}
        </h3>

        {step === 'personal' && (
          <>
            <div className="field">
              <label htmlFor="f-fullName">Full name</label>
              <input type="text" autoComplete="name" required {...field('fullName')} />
              <p id="f-fullName-hint" className="hint">As on your delivery address.</p>
              <Error name="fullName" />
            </div>
            <div className="field">
              <label htmlFor="f-email">Email</label>
              <input type="email" autoComplete="email" required {...field('email')} />
              <p id="f-email-hint" className="hint">We send order updates here.</p>
              <Error name="email" />
            </div>
            <div className="field">
              <label htmlFor="f-phone">Mobile number</label>
              <input type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} required {...field('phone')} />
              <p id="f-phone-hint" className="hint">10 digits, no country code.</p>
              <Error name="phone" />
            </div>
          </>
        )}

        {step === 'measurements' && (
          <>
            <div className="field">
              <label htmlFor="f-category">Usual garment</label>
              <select required {...field('category')}>
                <option value="">Choose one</option>
                {CATEGORIES.filter((c) => c !== 'Dupattas').map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <p id="f-category-hint" className="hint">Helps us pick the right size chart.</p>
              <Error name="category" />
            </div>
            {['chest', 'waist', 'height'].map((n) => (
              <div className="field" key={n}>
                <label htmlFor={`f-${n}`}>{LABELS[n]}</label>
                <input type="number" inputMode="numeric" required {...field(n)} />
                <p id={`f-${n}-hint`} className="hint">Whole centimetres are fine.</p>
                <Error name={n} />
              </div>
            ))}
            <div className="field">
              <fieldset aria-describedby={errors.fit ? 'f-fit-error' : undefined}>
                <legend>Preferred fit</legend>
                {['Regular', 'Relaxed'].map((f) => (
                  <label key={f} className="inline">
                    <input
                      type="radio"
                      name="fit"
                      id={f === 'Regular' ? 'f-fit' : undefined}
                      value={f}
                      checked={values.fit === f}
                      onChange={set('fit')}
                      aria-invalid={errors.fit ? 'true' : undefined}
                    />{' '}
                    {f}
                  </label>
                ))}
              </fieldset>
              <Error name="fit" />
            </div>
          </>
        )}

        {step === 'delivery' && (
          <>
            <div className="field">
              <label htmlFor="f-address">Address</label>
              <textarea rows={3} autoComplete="street-address" required {...field('address')} />
              <p id="f-address-hint" className="hint">House name, street and landmark.</p>
              <Error name="address" />
            </div>
            <div className="field">
              <label htmlFor="f-city">City</label>
              <input type="text" autoComplete="address-level2" required {...field('city')} />
              <p id="f-city-hint" className="hint">We deliver across Kerala.</p>
              <Error name="city" />
            </div>
            <div className="field">
              <label htmlFor="f-pincode">PIN code</label>
              <input type="text" inputMode="numeric" autoComplete="postal-code" maxLength={6} required {...field('pincode')} />
              <p id="f-pincode-hint" className="hint">Thiruvananthapuram PIN codes start with 695.</p>
              <Error name="pincode" />
            </div>
            <div className="field">
              <label className="inline">
                <input
                  type="checkbox"
                  id="f-consent"
                  name="consent"
                  checked={values.consent}
                  onChange={set('consent')}
                  aria-invalid={errors.consent ? 'true' : undefined}
                  aria-describedby={errors.consent ? 'f-consent-error' : undefined}
                />{' '}
                Save these details to my profile
              </label>
              <Error name="consent" />
            </div>
          </>
        )}

        {step === 'review' && (
          <dl className="review">
            {ORDER.filter((k) => k !== 'consent').map((k) => (
              <div key={k}>
                <dt>{LABELS[k]}</dt>
                <dd>{String(values[k])}</dd>
              </div>
            ))}
          </dl>
        )}
      </fieldset>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={back} disabled={stepIndex === 0}>
          Back
        </button>
        {step !== 'review' ? (
          <button type="button" className="btn" onClick={next}>
            Next
          </button>
        ) : (
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save profile'}
          </button>
        )}
      </div>
    </form>
  );
}
