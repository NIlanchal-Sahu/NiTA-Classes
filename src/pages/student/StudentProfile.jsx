import { useEffect, useMemo, useState } from 'react'
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

function StatusBadge({ ok, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
      }`}
    >
      {ok ? '✓' : '!'} {label}
    </span>
  )
}

function ViewRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-700/60 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm font-medium text-white sm:text-right">{value || '—'}</span>
    </div>
  )
}

function calcCompletion(form, { hasPassport, hasAadhaarFile, hasAvatar }) {
  const essential = [
    form.fullName,
    form.dateOfBirth,
    form.gender,
    form.mobile,
    form.email,
    form.aadhaarNumber,
    form.fullAddress,
    form.highestQualification,
  ]
  const essentialDone = essential.filter((v) => String(v || '').trim()).length
  const docsDone = (hasPassport ? 1 : 0) + (hasAadhaarFile ? 1 : 0) + (hasAvatar ? 1 : 0)
  const total = essential.length + 3
  return Math.round(((essentialDone + docsDone) / total) * 100)
}

export default function StudentProfile() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editMode, setEditMode] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [passportPreview, setPassportPreview] = useState('')
  const [hasAadhaarFile, setHasAadhaarFile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingDocs, setUploadingDocs] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { profile } = await studentPortalApi.getStudentProfileDetails()
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
      setAvatarPreview(user?.avatarUrl || profile.avatarUrl || '')
      setPassportPreview(profile.passportPhotoPublicUrl || profile.profilePhotoPublicUrl || '')
      setHasAadhaarFile(!!profile.aadhaarPublicUrl || !!profile.aadhaarLocalPath || !!profile.aadhaarFileUrl)
    } catch (e) {
      setError(e.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const completion = useMemo(
    () =>
      calcCompletion(form, {
        hasPassport: !!passportPreview,
        hasAadhaarFile,
        hasAvatar: !!avatarPreview,
      }),
    [form, passportPreview, hasAadhaarFile, avatarPreview],
  )

  const maskedAadhaar = useMemo(() => {
    const n = String(form.aadhaarNumber || '').replace(/\D/g, '')
    if (n.length !== 12) return form.aadhaarNumber || '—'
    return `XXXX XXXX ${n.slice(-4)}`
  }, [form.aadhaarNumber])

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
      setError('Choose a photo (JPG, PNG or WebP, max 2MB).')
      return
    }
    setUploadingAvatar(true)
    setError('')
    setSuccess('')
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      await studentPortalApi.uploadStudentProfileFiles(fd)
      setSuccess('Profile picture updated.')
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
      setSuccess(out.message || 'Documents uploaded.')
      await load()
      e.target.reset()
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploadingDocs(false)
    }
  }

  const inputCls =
    'mt-1 block w-full rounded-xl border border-gray-600 bg-gray-800 px-3 py-2.5 text-white placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed'

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-gray-400">Loading your profile…</p>
      </div>
    )
  }

  const displayName = form.fullName || user?.name || 'Student'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/student/settings" className="text-sm font-medium text-violet-300 hover:text-violet-200">
            ← Back to My Account
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">Certificate Profile</h1>
          <p className="mt-1 text-sm text-gray-400">
            Details used on your course certificate. Keep them accurate and up to date.
          </p>
        </div>
        {!editMode ? (
          <button
            type="button"
            onClick={() => {
              setEditMode(true)
              setSuccess('')
            }}
            className="shrink-0 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Edit details
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditMode(false)
              load()
            }}
            className="shrink-0 rounded-xl border border-gray-600 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      {success && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {/* Completion + photos */}
      <div className="mt-6 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 to-gray-900 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-violet-400/40 bg-gray-800">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-bold text-violet-300">{initial}</div>
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-white">{displayName}</p>
              <p className="text-sm text-gray-400">{form.mobile || user?.email || '—'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge ok={!!passportPreview} label="Passport photo" />
                <StatusBadge ok={hasAadhaarFile} label="Aadhaar uploaded" />
              </div>
            </div>
          </div>
          <div className="sm:ml-auto sm:min-w-[140px] sm:text-right">
            <p className="text-3xl font-bold text-white">{completion}%</p>
            <p className="text-xs text-gray-500">Profile complete</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {!editMode ? (
        <>
          {/* Read-only summary */}
          <section className="mt-6 rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Personal details</h2>
            <ViewRow label="Full name" value={form.fullName} />
            <ViewRow label="Date of birth" value={form.dateOfBirth} />
            <ViewRow label="Gender" value={form.gender} />
            <ViewRow label="Mobile" value={form.mobile} />
            <ViewRow label="Email" value={form.email} />
          </section>

          <section className="mt-4 rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Address & education</h2>
            <ViewRow label="Address" value={form.fullAddress} />
            <ViewRow label="District / State" value={form.districtState} />
            <ViewRow label="PIN code" value={form.pinCode} />
            <ViewRow label="Qualification" value={form.highestQualification} />
            <ViewRow label="Year of passing" value={form.yearOfPassing} />
            <ViewRow label="Aadhaar" value={maskedAadhaar} />
          </section>

          {(form.fatherName || form.emergencyContact) && (
            <section className="mt-4 rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Emergency contacts</h2>
              {form.fatherName && <ViewRow label="Father's name" value={form.fatherName} />}
              {form.motherName && <ViewRow label="Mother's name" value={form.motherName} />}
              {form.emergencyContact && <ViewRow label="Emergency contact" value={form.emergencyContact} />}
            </section>
          )}
        </>
      ) : (
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <section className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
            <h2 className="font-semibold text-white">About you</h2>
            <p className="mt-1 text-xs text-gray-500">Use the same name as on your Aadhaar card.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-400">Full name *</label>
                <input className={inputCls} value={form.fullName} onChange={set('fullName')} required />
              </div>
              <div>
                <label className="text-sm text-gray-400">Date of birth *</label>
                <input type="date" className={inputCls} value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
              </div>
              <div>
                <label className="text-sm text-gray-400">Gender *</label>
                <select className={inputCls} value={form.gender} onChange={set('gender')} required>
                  <option value="">Select</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Mobile *</label>
                <input className={inputCls} inputMode="numeric" maxLength={10} value={form.mobile} onChange={set('mobile')} required />
              </div>
              <div>
                <label className="text-sm text-gray-400">Email *</label>
                <input type="email" className={inputCls} value={form.email} onChange={set('email')} required />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
            <h2 className="font-semibold text-white">Address & qualification</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-400">Full address *</label>
                <textarea className={inputCls} rows={2} value={form.fullAddress} onChange={set('fullAddress')} required />
              </div>
              <div>
                <label className="text-sm text-gray-400">Street / Village</label>
                <input className={inputCls} value={form.streetVillage} onChange={set('streetVillage')} />
              </div>
              <div>
                <label className="text-sm text-gray-400">District / State *</label>
                <input className={inputCls} value={form.districtState} onChange={set('districtState')} required />
              </div>
              <div>
                <label className="text-sm text-gray-400">PIN code</label>
                <input className={inputCls} inputMode="numeric" maxLength={6} value={form.pinCode} onChange={set('pinCode')} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Aadhaar number * (12 digits)</label>
                <input className={inputCls} inputMode="numeric" maxLength={12} value={form.aadhaarNumber} onChange={set('aadhaarNumber')} required />
              </div>
              <div>
                <label className="text-sm text-gray-400">Highest qualification *</label>
                <select className={inputCls} value={form.highestQualification} onChange={set('highestQualification')} required>
                  <option value="">Select</option>
                  {QUALIFICATIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Year of passing</label>
                <input className={inputCls} placeholder="e.g. 2024" value={form.yearOfPassing} onChange={set('yearOfPassing')} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
            <h2 className="font-semibold text-white">Parent / emergency (optional)</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-gray-400">Father&apos;s name</label>
                <input className={inputCls} value={form.fatherName} onChange={set('fatherName')} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Mother&apos;s name</label>
                <input className={inputCls} value={form.motherName} onChange={set('motherName')} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Emergency contact</label>
                <input className={inputCls} inputMode="numeric" maxLength={10} value={form.emergencyContact} onChange={set('emergencyContact')} />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-violet-600 py-3.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 sm:w-auto sm:px-10"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}

      {/* Photos & documents — always accessible */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5">
          <h2 className="font-semibold text-white">Profile picture</h2>
          <p className="mt-1 text-xs text-gray-400">Shown in the portal header — not used on certificates.</p>
          <form onSubmit={handleAvatarUpload} className="mt-4 space-y-3">
            <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm text-gray-300 file:mr-2 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-white" />
            <button
              type="submit"
              disabled={uploadingAvatar}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {uploadingAvatar ? 'Uploading…' : 'Update picture'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-5">
          <h2 className="font-semibold text-white">Certificate documents</h2>
          <p className="mt-1 text-xs text-gray-400">Passport-size photo and Aadhaar for your official certificate.</p>
          {passportPreview && (
            <div className="mt-3 h-28 w-24 overflow-hidden rounded-lg border border-amber-500/30">
              <img src={passportPreview} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <form onSubmit={handlePassportAndAadhaarUpload} className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-gray-400">Passport-size photo</label>
              <input type="file" name="passportPhoto" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-sm text-gray-300" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Aadhaar (image or PDF)</label>
              <input type="file" name="aadhaarFile" accept="image/*,application/pdf" className="mt-1 block w-full text-sm text-gray-300" />
            </div>
            <button
              type="submit"
              disabled={uploadingDocs}
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {uploadingDocs ? 'Uploading…' : 'Upload documents'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
