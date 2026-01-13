import React, {useState, useCallback, useEffect} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTriangleExclamation, faRotateRight, faSignal, faPlaneCircleCheck} from '@fortawesome/free-solid-svg-icons'
import {useTranslation} from 'react-i18next'
import SlideDown from './slideDown'
import Cookies from 'js-cookie'

const LoadingError = React.memo(({pageError, setPageError, pageMessage, setPageMessage, getPage, online, offlineMode, setOfflineMode, path}) => {
    const {t} = useTranslation()

    const [offline, setOffline] = useState(Cookies.get('offline') == 'true')

    const errorButton = useCallback(() => {
        if (online) {
            getPage(path, setPageMessage)
            return
        }
        setOfflineMode(true)
        setPageError(false)
    }, [online])

    const [visibility, setVisibility] = useState({
        main: false,
        online: false,
        offline: false
    })

    useEffect(() => {
        const mainVisible = pageError || (!online && !offlineMode)
        setVisibility({
            main: mainVisible,
            online: mainVisible && online,
            offline: mainVisible && !online
    })}, [pageError, online, offlineMode])

    return (
        <SlideDown
            visibility={visibility.main}
        >
            <div
                className='groups-loading-error'
                style={{opacity: pageError || (!online && !offlineMode) ? 1 : 0}}
                onClick={() => errorButton()}
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
                            {t(pageMessage)}
                        </span>
                    </div>
                </div>
                <SlideDown
                    visibility={visibility.online}
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
                    visibility={visibility.offline}
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
                    <label
                        className='newnote-offline-mode'
                        onClick={e => e.stopPropagation()}
                    >
                        <div
                            className='settings-offline-title'
                        >
                            {t('Auto switch to offline mode')}
                        </div>
                        <div
                            className='settings-offline-checkbox'
                        >
                            <input
                                type='checkbox'
                                className='settings-offline-techbox'
                                checked={offline}
                                onChange={e => {
                                    setOffline(e.target.checked)
                                    Cookies.set('offline', e.target.checked, {expires: 1})
                                }}
                            />
                            <FontAwesomeIcon
                                icon={faPlaneCircleCheck}
                                className='settings-offline-logo'
                            />
                        </div>
                    </label>
                </SlideDown>
            </div>
        </SlideDown>
    )
})

export default LoadingError