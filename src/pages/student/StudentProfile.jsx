import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { studentPortalApi } from '../../api/student'

const QUALIFICATIONS = ['10th', '12th', 'Graduate', 'Post Graduate', 'Other']
const GENDERS = ['Male', 'Female', 'Other']

const emptyForm = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  mobile: '',
  email: '',
  aadhaarNumber: '',
  fullAddress: '',
  streetVillage: '',
  districtState: '',
  pinCode: '',
  highestQualification: '',
  yearOfPassing: '',
  fatherName: '',
  motherName: '',
  emergencyContact: '',
  parentsContact: '',
}

export default function StudentProfile() {
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editMode, setEditMode] = useState(false)
  /** Portal header photo (separate from passport cert photo) */
  const [avatarPreview, setAvatarPreview] = useState('')
  const [passportPreview, setPassportPreview] = useState('')
  const [googleConfigured, setGoogleConfigured] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingDocs, setUploadingDocs] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { profile } = await studentPortalApi.getStudentProfileDetails()
      setGoogleConfigured(!!profile.isGoogleSyncConfigured)
      setForm({
        fullName: profile.fullName || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        mobile: profile.mobile || '',
        email: profile.email || '',
        aadhaarNumber: profile.aadhaarNumber || '',
        fullAddress: profile.fullAddress || '',
        streetVillage: profile.streetVillage || '',
        districtState: profile.districtState || '',
        pinCode: profile.pinCode || '',
        highestQualification: profile.highestQualification || '',
        yearOfPassing: profile.yearOfPassing || '',
        fatherName: profile.fatherName || '',
        motherName: profile.motherName || '',
        emergencyContact: profile.emergencyContact || '',
        parentsContact: profile.parentsContact || '',
      })
      setAvatarPreview(profile.avatarPublicUrl || '')
      setPassportPreview(profile.passportPhotoPublicUrl || profile.profilePhotoPublicUrl || '')
    } catch (e) {
      setError(e.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await studentPortalApi.updateStudentProfileDetails(form)
      setSuccess('Profile saved successfully.')
      setEditMode(false)
      await refreshUser()
      await load()
    } catch (err) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    e.preventDefault()
    const file = e.target.avatar?.files?.[0]
    if (!file?.size) {
      setError('Choose a portal profile picture (JPG, PNG or WebP, max 2MB).')
      return
    }
    setUploadingAvatar(true)
    setError('')
    setSuccess('')
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      await studentPortalApi.uploadStudentProfileFiles(fd)
      setSuccess('Portal profile picture saved. Updating header…')
      await refreshUser()
      await load()
      e.target.reset()
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handlePassportAndAadhaarUpload = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const p = fd.get('passportPhoto')
    const a = fd.get('aadhaarFile')
    const hasP = p instanceof File && p.size > 0
    const hasA = a instanceof File && a.size > 0
    if (!hasP && !hasA) {
      setError('Choose passport photo and/or Aadhaar file (max 2MB each).')
      return
    }
    setUploadingDocs(true)
    setError('')
    setSuccess('')
    try {
      const out = await studentPortalApi.uploadStudentProfileFiles(fd)
      setSuccess(out.message || 'Files uploaded.')
      await load()
      e.target.reset()
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploadingDocs(false)
    }
  }

  const inputCls =
    'mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed'

  if (loading) {
    return <p className="text-gray-400">Loading profile…</p>
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Student profile</h1>
          <p className="mt-1 text-gray-400">
            Complete these details for certificates and records. You can edit anytime after login.
          </p>
          {googleConfigured && (
            <p className="mt-2 text-xs text-emerald-400/90">
              Google Drive / Sheets sync is configured on the server — saves also sync when credentials are valid.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!editMode ? (
            <button
              type="button"
              onClick={() => {
                setEditMode(true)
                setSuccess('')
              }}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Edit profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditMode(false)
                load()
              }}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Cancel edit
            </button>
          )}
          <Link
            to="/student/settings"
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Settings
          </Link>
        </div>
      </div>

      {error && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
      {success && (
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>
      )}

      <div className="mt-8 grid max-w-3xl gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-violet-500/40 bg-violet-950/20 p-6">
          <h2 className="text-lg font-semibold text-white">Portal profile picture</h2>
          <p className="mt-1 text-sm text-gray-400">
            Shown in the student portal header. Square crop works best. This is <strong className="text-white">not</strong> your certificate
            passport photo.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-violet-400/60 bg-gray-700">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-gray-500">No portal photo</div>
              )}
            </div>
            <form onSubmit={handleAvatarUpload} className="min-w-0 flex-1 space-y-2">
              <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm text-gray-300" />
              <button
                type="submit"
                disabled={uploadingAvatar}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {uploadingAvatar ? 'Saving…' : 'Save portal photo'}
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-6">
          <h2 className="text-lg font-semibold text-white">Passport-size photo</h2>
          <p className="mt-1 text-sm text-gray-400">
            For certificates and official records. <strong className="text-amber-200">Different</strong> from the small portal avatar.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-amber-500/40 bg-gray-800">
              {passportPreview ? (
                <img src={passportPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-1 text-center text-[10px] text-gray-500">No passport photo</div>
              )}
            </div>
            <p className="flex-1 text-xs text-gray-500">
              Upload below under “Certificate documents” together with Aadhaar, or only passport file there.
            </p>
          </div>
        </section>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-8 max-w-3xl">
        <section className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Basic details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-400">Full name (as per Aadhaar) *</label>
              <input className={inputCls} value={form.fullName} onChange={set('fullName')} disabled={!editMode} required />
            </div>
            <div>
              <label className="text-sm text-gray-400">Date of birth *</label>
              <input type="date" className={inputCls} value={form.dateOfBirth} onChange={set('dateOfBirth')} disabled={!editMode} required />
            </div>
            <div>
              <label className="text-sm text-gray-400">Gender *</label>
              <select className={inputCls} value={form.gender} onChange={set('gender')} disabled={!editMode} required>
                <option value="">Select</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Mobile number *</label>
              <input className={inputCls} inputMode="numeric" maxLength={10} value={form.mobile} onChange={set('mobile')} disabled={!editMode} required />
            </div>
            <div>
              <label className="text-sm text-gray-400">Email ID *</label>
              <input type="email" className={inputCls} value={form.email} onChange={set('email')} disabled={!editMode} required />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Identity</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-400">Aadhaar number * (12 digits)</label>
              <input
                className={inputCls}
                inputMode="numeric"
                maxLength={12}
                value={form.aadhaarNumber}
                onChange={set('aadhaarNumber')}
                disabled={!editMode}
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-400">Full address *</label>
              <textarea className={inputCls} rows={2} value={form.fullAddress} onChange={set('fullAddress')} disabled={!editMode} required />
            </div>
            <div>
              <label className="text-sm text-gray-400">Street / Village *</label>
              <input className={inputCls} value={form.streetVillage} onChange={set('streetVillage')} disabled={!editMode} required />
            </div>
            <div>
              <label className="text-sm text-gray-400">District / State *</label>
              <input className={inputCls} value={form.districtState} onChange={set('districtState')} disabled={!editMode} required />
            </div>
            <div>
              <label className="text-sm text-gray-400">PIN code *</label>
              <input className={inputCls} inputMode="numeric" maxLength={6} value={form.pinCode} onChange={set('pinCode')} disabled={!editMode} required />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Educational qualification</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400">Highest qualification *</label>
              <select
                className={inputCls}
                value={form.highestQualification}
                onChange={set('highestQualification')}
                disabled={!editMode}
                required
              >
                <option value="">Select</option>
                {QUALIFICATIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Year of passing *</label>
              <input className={inputCls} placeholder="e.g. 2024" value={form.yearOfPassing} onChange={set('yearOfPassing')} disabled={!editMode} required />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Additional (recommended)</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400">Father&apos;s name</label>
              <input className={inputCls} value={form.fatherName} onChange={set('fatherName')} disabled={!editMode} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Mother&apos;s name</label>
              <input className={inputCls} value={form.motherName} onChange={set('motherName')} disabled={!editMode} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Emergency contact</label>
              <input className={inputCls} inputMode="numeric" maxLength={10} value={form.emergencyContact} onChange={set('emergencyContact')} disabled={!editMode} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Parents contact number</label>
              <input className={inputCls} inputMode="numeric" maxLength={10} value={form.parentsContact} onChange={set('parentsContact')} disabled={!editMode} />
            </div>
          </div>
        </section>

        {editMode && (
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-violet-600 px-8 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        )}
      </form>

      <div className="mt-10 max-w-3xl rounded-xl border border-blue-700/40 bg-blue-900/10 p-6">
        <h2 className="text-lg font-semibold text-white">Certificate documents</h2>
        <p className="mt-1 text-sm text-gray-400">
          <strong className="text-white">Passport-size photo</strong> (certificates) and <strong className="text-white">Aadhaar</strong>{' '}
          (image or PDF). Max 2MB each. These are separate from the portal profile picture above.
        </p>
        <form onSubmit={handlePassportAndAadhaarUpload} className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400">Passport-size photo (for certificates)</label>
            <input type="file" name="passportPhoto" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-sm text-gray-300" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Aadhaar card (image or PDF)</label>
            <input type="file" name="aadhaarFile" accept="image/*,application/pdf" className="mt-1 block w-full text-sm text-gray-300" />
          </div>
          <button
            type="submit"
            disabled={uploadingDocs}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploadingDocs ? 'Uploading…' : 'Upload passport / Aadhaar'}
          </button>
        </form>
      </div>
    </>
  )
}
