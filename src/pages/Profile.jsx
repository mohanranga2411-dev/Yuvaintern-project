import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadProfile, saveProfile } from '../store/profileSlice.js';
import ProfileForm from '../components/ProfileForm.jsx';
import { ErrorState, Loading } from '../components/StatusViews.jsx';

export default function Profile() {
  const dispatch = useDispatch();
  const { data, status, error, saveStatus, saveError } = useSelector((s) => s.profile);

  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  if (status === 'idle' || status === 'loading') return <Loading label="Loading your profile" />;
  if (status === 'failed') return <ErrorState error={error} onRetry={() => dispatch(loadProfile())} />;

  return (
    <>
      <title>Profile | Kasavu Ethnic Wear</title>
      <h1>Your profile</h1>
      {data && (
        <section className="summary-card" aria-labelledby="saved-title">
          <h2 id="saved-title">Saved details</h2>
          <p>
            <strong>{data.fullName}</strong> · {data.email} · {data.phone}
          </p>
          <p className="muted">
            Usually shops for {data.category}, chest {data.chest} cm, waist {data.waist} cm, {data.fit.toLowerCase()} fit.
          </p>
          <p className="muted">
            {data.address}, {data.city} {data.pincode}
          </p>
        </section>
      )}
      <p role="status" className="success" hidden={saveStatus !== 'saved'}>
        {saveStatus === 'saved' ? 'Profile saved. Your size suggestions are ready.' : ''}
      </p>
      <ProfileForm
        key={data ? 'saved' : 'new'}
        initial={data || undefined}
        submitting={saveStatus === 'saving'}
        submitError={saveError?.message}
        serverFields={saveError?.fields}
        onSubmit={(values) => dispatch(saveProfile(values))}
      />
    </>
  );
}
