import {useState, useEffect, useMemo, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowUp as faArrowUpSolid} from '@fortawesome/free-solid-svg-icons'

import {appStore, profileStore, notesViewStore, screenStore, clarifyStore, pendingStore, editorStore, settingStore, tokenStore} from '../store'

import Password from './password'
import Connections from './connections'
import SlideDown from '../components/slideDown'

function ProfileSettings() {

    const {t, i18n} = useTranslation()

    const navigate = useNavigate()

    const token = useMemo(() => {
        return [
            localStorage.getItem('token'),
            Cookies.get('token')
        ].find(t => t && t !== 'null')
    }, [])

    const {language, setLanguage, tempFile} = profileStore(
        useShallow((state) => ({
            setLanguage: state.setLanguage,
            language: state.language,
            tempFile: state.tempFile
        }))
    )

    // image editor visibility
    const {setVisible} = editorStore()

    const [passwordChanged, setPasswordChanged] = useState(false)
    const [langChanged, setLangChanged] = useState(false)

    // subpage visibility states
    const [changingPassword, setChangingPassword] = useState(false)
    const [connections, setConnections] = useState(false)
    const [changingLang, setChangingLang] = useState(false)
    const [logout, setLogout] = useState(false)

    // 

    const langList = useMemo(() => [{
        icon: '🇷🇺',
        name: 'russian',
        code: 'ru'
    }, {
        icon: '🇺🇦',
        name: 'ukrainian',
        code: 'ua'
    }, {
        icon: '🇵🇱',
        name: 'polish',
        code: 'pl'
    },{
        icon: '🇬🇧',
        name: 'english',
        code: 'en'
    }], [])

    const changeLanguage = useCallback(async (code) => {
        i18n.changeLanguage(code)
        setLanguage(code)

        if (token) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({language: code})
                })

                if (response.ok) {
                    setTimeout(() => setLangChanged(false), 7000)
                    setChangingLang(false)
                    setLangChanged(true)
                } else {
                    console.error('Failed to save language on server')
                }
            } catch (error) {
                console.error(error)
            }
        } else {
            setTimeout(() => setLangChanged(false), 7000)
            setLangChanged(true)
        }
    }, [token, i18n, t])

    const renderLangs = useMemo(() => 
        langList.map((element, index) =>
        <label
            className='slctd-lang'
            key={element.code}
        >
            <input
                onChange={() => changeLanguage(element.code)}
                checked={language === element.code}
                className='lang-checkbox'
                type='radio'
            />
            <div
                className='lang-icon'
            >
                {element.icon}
            </div>
            <div
                className='lang-name'
            >
                {t(element.name)}
            </div>
        </label>
    ), [langList, i18n, t, language, changeLanguage])

    const stores = [appStore, profileStore, notesViewStore, screenStore, clarifyStore, pendingStore, editorStore, settingStore, tokenStore]

    const log_out = useCallback(() => {
        stores.forEach(store => {store.setState({}, true)})

        window.location.href = '/login'
    }, [])

    // array with account settings buttons

    // // title — button name
    // // class — button class
    // // action — subpage visibility toggle
    // // visibility — subpage visibility status
    // // component — subpage component
    // // message — appearing message returned from the component
    const settingsButtons = useMemo(() => [
        {
            title: 'Change language',
            class: 'language-settings',
            action: () => {
                setLangChanged(false)
                setChangingLang(prev => !prev)
            },
            visibility: changingLang,
            component: 
                <div
                    className='lang-settings'
                >
                    {renderLangs}
                </div>,
            message: 
                <SlideDown
                    visibility={langChanged}
                >
                    <div
                        className='settings-password-changed'
                    >
                        {t('Changed successfully')}
                    </div>
                </SlideDown>
        },{
            title: 'Change password',
            class: 'settings-password',
            action: setChangingPassword,
            visibility: changingPassword,
            component: 
                <Password
                    setChangingPassword={setChangingPassword}
                    setPasswordChanged={setPasswordChanged}
                />,
            message: 
                <SlideDown
                    visibility={passwordChanged}
                >
                    <div
                        className='settings-password-changed'
                    >
                        {t('Changed successfully')}
                    </div>
                </SlideDown>
        },
        // {
        //     title: 'Connected accounts',
        //     class: 'settings-accounts',
        //     action: setConnections,
        //     visibility: connections,
        //     component: <Connections/>
        // },
        {
            title: 'Log-out',
            class: 'logout',
            action: setLogout,
            visibility: logout,
            component: 
                <div
                    className='logout-buttons'
                >
                    <button
                        className='logout-cancel'
                        onClick={() => setLogout(false)}
                    >
                        {t('cancel')}
                    </button>
                    <button
                        className='logout-true'
                        onClick={log_out}
                    >
                        {t('Confirm logout')}
                    </button>
                </div>
        }
        // ,{
        //     title: 'Delete account',
        //     class: 'settings-delete',
        //     action: 'Delete'
        // }
    ])

    // render account settings buttons
    const renderSettings = useMemo(() => 
        settingsButtons.map((element, index) => 
        <div
            key={index}
        >
            <button
                className={element.class}
                onClick={() => element.action(prev => !prev)}
            >
                {t(element.title)}
                <FontAwesomeIcon
                    icon={faArrowUpSolid}
                    className='arrow-icon'
                    style={{
                        '--arrow-direction': element.visibility ? '0deg' : '180deg'
                    }}
                />
            </button>
            {element.message}
            <SlideDown
                visibility={element.visibility}
            >
                {element.component}
            </SlideDown>
        </div>
        )
    )

    // presence of a temporary file determines the existence of a image editor, if the file exists, a super-short timeout is started, allowing the animation to play
    useEffect(() => {
        if (tempFile != null) {
            setTimeout(() => setVisible(true), 10)
            return () => clearTimeout()
        }
    }, [tempFile])

    return (
        <div
            className='profile-settings'
        >
            <h2
                className='settings-title'
            >
                {t('Account settings')}
            </h2>
            <div
                className='settings-buttons'
            >
                {renderSettings}
            </div>
        </div>
    )}

export default ProfileSettings