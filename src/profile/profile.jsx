import './profile.css'

import {useTranslation} from 'react-i18next'
import {useLocation} from 'react-router'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faRotateRight, faSignal, faFloppyDisk, faTriangleExclamation, faTrashCan, faSpinner, faPlane, faUserTie as faUserTieSolid} from '@fortawesome/free-solid-svg-icons'

import {apiStore, appStore, profileStore} from '../store'

import {SquarePen, Trash2, ImageUp} from 'lucide-react'

import Editor from './editor'
import User from './user'
import Settings from './settings'
import profileLogic from './profileLogic'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {useShallow} from 'zustand/react/shallow'

function Profile() {

    // 
    const {online} = apiStore()
    const {offlineMode, setOfflineMode} = appStore()
    const {t, i18n} = useTranslation()

    const location = useLocation()
    const path = location.pathname.slice(1)

    const {avatar, created, profileLoading, profileSaving, profileError, profileMessage, tempFile, setTempFile, fileError} = profileStore(
        useShallow((state) => ({
            setProfileLoading: state.setProfileLoading,
            profileLoading: state.profileLoading,
            profileMessage: state.profileMessage,
            profileSaving: state.profileSaving,
            profileError: state.profileError,
            setTempFile: state.setTempFile,
            fileError: state.fileError,
            tempFile: state.tempFile,
            created: state.created,
            avatar: state.avatar,
        }))
    )

    // 
    const {drag, setDrag, fileRef, handleFile, delAvatar} = profileLogic()

    return (
        <div
            className='profile-main'
        >
            <article>
                <title>Profile — Note Vault</title>
            </article>
            {tempFile != null ? <Editor/> : null}
            <div className='profile-title-block'>
                <h1 className='profile-title'>
                    {t('profile')}
                </h1>
                <SlideLeft visibility={profileLoading}>
                    <FontAwesomeIcon
                        className='clarify-loading-icon'
                        icon={faSpinner}
                    />
                </SlideLeft>
                <SlideLeft visibility={profileSaving}>
                    <FontAwesomeIcon
                        className={`loading-save-icon ${null == 'delete' ? '--trash' : null}`}
                        icon={null == 'delete' ? faTrashCan : faFloppyDisk}
                    />
                </SlideLeft>
                <SlideLeft visibility={profileError}>
                    <FontAwesomeIcon
                        className='loading-error-icon'
                        icon={faTriangleExclamation}
                    />
                </SlideLeft>
                <SlideLeft visibility={offlineMode}>
                    <FontAwesomeIcon
                        className='newnote-offline-icon'
                        icon={faPlane}
                    />
                </SlideLeft>
            </div>
            <SlideDown visibility={!online && !offlineMode}>
                <div
                    className='groups-loading-error'
                    onClick={() => {online ? turnOnlineMode() : setOfflineMode(true)}}
                >
                    <div
                        className='loading-error-message'
                    >
                        <FontAwesomeIcon
                            className='loading-error-icon --general'
                            icon={faTriangleExclamation}
                        />
                        <div
                            className='error-groups'
                        >
                            <span>
                                {t('Error loading')} {t(path)}.
                            </span>
                            <span>
                                {t(profileMessage)}
                            </span>
                        </div>
                    </div>
                    <SlideDown
                        // visibility={notesError && online}
                        visibility={false}
                    >
                        <div
                            className='loading-retry-action'
                        >
                            <input
                                type='checkbox'
                                className='loading-retry-checkbox'
                                defaultChecked
                            />
                            <FontAwesomeIcon
                                className='loading-retry-icon'
                                icon={faRotateRight}
                            />
                            <span>
                                {t('retry?')}
                            </span>
                        </div>
                    </SlideDown>
                    <SlideDown
                        // visibility={!online && notesError}
                        visibility={true}
                    >
                        <div
                            className='newnote-retry-action'
                        >
                            <FontAwesomeIcon
                                className='newnote-signal-icon'
                                icon={faSignal}
                            />
                            <span
                                className='newnote-offline-text'
                            >
                                {t('Go to offline mode?')}
                            </span>
                        </div>
                    </SlideDown>
                </div>
            </SlideDown>
                <div
                    className='profile-block'
                >
                    {/* upload or change avatar */}
                    <label
                        style={{'--file-hover': drag ? '#2f3847' : 'transparent'}}
                        onDragOver={(e) => {e.preventDefault(); setDrag(true)}}
                        onDragLeave={() => setDrag(false)}
                        onDragEnd={() => setDrag(false)}
                        htmlFor='editor-file-input'
                        className='profile-avatar'
                        onDrop={(e) => {
                            e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0])
                            e.preventDefault()
                            setDrag(false)
                        }}
                        // onClick={() => fileRef.current.click()}
                    >
                        <input
                            onChange={e => setDrag(e.target.checked)}
                            checked={drag}
                            type='radio'
                        />
                        <div className='avatar-element'>
                            <input
                                type='file'
                                className='editor-file-input'
                                id='editor-file-input'
                                ref={fileRef}
                                key={tempFile ? 'has-file' : 'no-file'}
                                onChange={(e) => handleFile(e.target.files[0])}
                                accept='image/*'
                            />
                            <FontAwesomeIcon
                                style={{'--icon-display': (avatar == null || avatar == 'null') ? '' : 'none'}}
                                className='user-icon'
                                icon={faUserTieSolid}
                            />
                            <img
                                style={{'--icon-display': (avatar == null || avatar == 'null') ? 'none' : '1'}}
                                src={avatar ? `${avatar}?t=${Date.now()}` : null}
                                className='avatar-img'
                                key={avatar}
                            />
                            <button
                                className='avatar-upload'
                                type='button'
                                style={{
                                    '--bc-color': (avatar == null || avatar == 'null') ? 'var(--def-btn)' : 'var(--del-btn)',
                                    '--bc-hover': (avatar == null || avatar == 'null') ? 'var(--def-btn-hvr)' : 'var(--del-btn-hvr)'
                                }}
                                onClick={e => {
                                    (avatar == null || avatar == 'null') ? fileRef.current.click() : delAvatar();
                                    e.stopPropagation()
                                }}
                            >
                                {(avatar == null || avatar == 'null') ? <ImageUp className='upload-icon'/> : <Trash2 className='upload-icon'/>}
                            </button>
                            <button
                                className='avatar-edit'
                                tabIndex={(avatar == null || avatar == 'null') ? -1 : 0}
                                type='button'
                                style={{
                                    '--bc-color': (avatar == null || avatar == 'null') ? 'transparent' : 'var(--def-btn)',
                                    '--pointer': (avatar == null || avatar == 'null') ? 'none' : '',
                                    '--icon-display': (avatar == null || avatar == 'null') ? 'none' : 'flex'
                                }}
                                onClick={(e) => {e.stopPropagation(); setTempFile(`${avatar}?t=${Date.now()}`)}}
                            >
                                {avatar && <SquarePen className='edit-icon'/>}
                                {/* <FontAwesomeIcon
                                    className='edit-icon'
                                    icon={avatar == null ? null : faPenToSquare}
                                /> */}
                            </button>
                        </div>
                        <SlideDown
                            visible={fileError}
                        >
                            <p
                                className='file-error'
                            >
                                {t('the file is not an image')}
                            </p>
                        </SlideDown>
                        <p
                            className='avatar-desc'
                        >
                            {t('click to change avatar')}
                        </p>
                    </label>
                    <div className='profile-elements'>
                        <SlideDown visibility={avatar}>
                            <button
                                className='delete-button'
                                style={{backgroundColor: 'var(--def-btn)'}}
                                onClick={(e) => {
                                    e.stopPropagation(),
                                    setTempFile(avatar)
                                }}
                            >
                                {t('edit')}
                            </button>
                        </SlideDown>
                        <button
                            style={{backgroundColor: (avatar == null || avatar == 'null') ? 'var(--def-btn)' : 'var(--del-btn)'}}
                            className='delete-button'
                            onClick={(e) => {
                                e.stopPropagation()
                                (avatar == null || avatar == 'null') ? console.log() : delAvatar()
                            }}
                            // fileRef.current.click()
                        >
                            {t((avatar == null || avatar == 'null') ? 'upload' : 'delete')}
                        </button>
                        {/* change name & email */}
                        <User/>
                        {/* account settings */}
                        <Settings/>
                        <div
                            className='profile-date'
                        >
                            {t('Account created')} {new Date(created).toLocaleDateString(i18n.language, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Profile