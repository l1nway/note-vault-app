import {faTriangleExclamation} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useState, useEffect, useRef, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {useTranslation} from 'react-i18next'
import {shake} from '../components/shake'
import {profileStore} from '../store'
import Cookies from 'js-cookie'
import {useMemo} from 'react'

function User() {

    const {t} = useTranslation()

    const nameRef = useRef(null)

    const {setLanguage, name, setName, email, setEmail, setVerifed, setCreated, setAvatar, setProfileLoading} = profileStore(
        useShallow((state) => ({
            setProfileLoading: state.setProfileLoading,
            setLanguage: state.setLanguage,
            setCreated: state.setCreated,
            setVerifed: state.setVerifed,
            setAvatar: state.setAvatar,
            setEmail: state.setEmail,
            setName: state.setName,
            email: state.email,
            name: state.name
        }))
    )

    const [localName, setLocalName] = useState('')
    const [localEmail, setLocalEmail] = useState('')

    //
    const [nameSaved, setNameSaved] = useState(false)
    // states for values
    const [nameError, setNameError] = useState(false)

    // displaying a message about sending verification
    const [sendVerif, setSendVerif] = useState(false)

    // displaying a message about unavailability of email editing
    const [prohibited, setProhibited] = useState(false)

    // checking password matches
    const nameEdited = name !== localName
    const emailEdited = email !== localEmail
    
    let nameStatus
        if (nameError) {nameStatus = 'error'}
        else if (name == '') {nameStatus = 'empty'}
        else if (nameSaved) {nameStatus = 'saved'}
        else {nameStatus = 'unsaved'}

    const nameText = {
        error: 'Error saving changes',
        empty: 'Name cannot be empty',
        unsaved: 'Name unsaved',
        saved: 'Name saved'
    }

    // individual token of the logged-in user
    const token = useMemo(() => {
        return [
            localStorage.getItem('token'),
            Cookies.get('token')
        ].find(t => t && t !== 'null')
    }, [])

    // getting user information from the server
    const getUser = useCallback(async (token) => {
        try {
            setProfileLoading(true)
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!res.ok) {
                const e = await res.json()
                console.error(e)
                return
            }

            const data = await res.json()
            setVerifed(data.email_verified_at)
            setCreated(data.created_at)
            setLanguage(data.language)
            setAvatar(data.avatar_url)
            setLocalEmail(data.email)
            setLocalName(data.name)
            setEmail(data.email)
            setName(data.name)
            
            return data
        } catch (e) {
            console.error(e)
        } finally {
            setProfileLoading(false)
        }
    })

    // triggers a call at the time of first load
    useEffect(() => {getUser(token)}, [])

    const changeName = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({name: name})
            })

            if (!response.ok) throw new Error('Update failed')

            const resData = await response.json()

            setLocalName(resData.name)
            setName(resData.name)

            setNameSaved(true)
            setTimeout(() => setNameSaved(false), 7000)
        } catch (error) {
            shake(nameRef.current)
            console.error(error)
            setNameError(true)
        }
    }, [name, token])

    return (
        <form className='profile-values'>
            <label className='profile-name'>
                <span className='profile-name-group'>
                    <div className='name-title-group'>
                        <p className='name-title'>
                            {t('Username')} 
                        </p>
                        <SlideLeft visibility={nameError}>
                            <FontAwesomeIcon
                                className='newnote-loading-error'
                                icon={faTriangleExclamation}
                                onClick={() => retryLoad()}
                                tabIndex='0'
                            />
                        </SlideLeft>
                    </div>
                    <SlideLeft visibility={nameEdited || nameSaved}>
                        <p
                            className={`name-status --${nameStatus}`}
                            key={nameStatus}
                        >
                            {t(nameText[nameStatus])}
                        </p>
                    </SlideLeft>
                </span>
                <input
                    className={`name-input ${(nameError || name == '') && '--animated-error'}`}
                    onFocus={() => setNameSaved(false)}
                    ref={nameRef}
                    value={name}
                    type='text'
                    onChange={e => {
                        setName(e.target.value)
                        setNameError(false)
                    }}
                />
            </label>
            <label className='profile-email'>
                <span className='profile-email-group'>
                    <p className='profile-email-title'>
                        {t('E-Mail')}
                    </p>
                    <SlideLeft visibility={emailEdited}>
                        <p className='name-status'>
                            {t('Email unsaved')}
                        </p>
                    </SlideLeft>
                    <SlideLeft visibility={prohibited}>
                        <p className='name-status'>
                            {t('Email editing is not yet available')}
                        </p>
                    </SlideLeft>
                </span>
                <input
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setProhibited(true)}
                    onBlur={() => setProhibited(false)}
                    className='profile-email-input'
                    value={email}
                    type='text'
                    readOnly
                />
            </label>
            <SlideDown visibility={(name !== '' && nameEdited) || emailEdited}>
                <div className='values-buttons'>
                    <button
                        tabIndex={nameEdited || emailEdited ? 0 : -1}
                        onClick={() => changeName()}
                        className='values-save'
                        type='button'
                    >
                        {t('save')}
                    </button>
                    
                    <button
                        tabIndex={nameEdited || emailEdited ? 0 : -1}
                        className='values-cancel'
                        onClick={() => {
                            setEmail(localEmail)
                            setNameError(false)
                            setName(localName)
                        }}
                        type='button'
                    >
                        {t('cancel')}
                    </button>
                </div>
            </SlideDown>
            {/*
            <SlideDown
                visibility={!verifed}
            >
                <span
                    className='profile-email-unverifed'
                >
                    {t("Isn't verifed yet")}
                </span>
            </SlideDown>
            <SlideDown
                visibility={!verifed}
            >
                <button
                    className='verify-button'
                    type='button'
                    onClick={() => setSendVerif(true)}
                >
                    {t('Verify email')}
                </button>
            </SlideDown>
            <SlideDown
                visibility={sendVerif}
            >
                <span
                    className='profile-email-sended'
                >
                    {t("Verification link has been sent to your email address")}
                </span>
            </SlideDown>
            */}
        </form>
    )}
    
    export default User