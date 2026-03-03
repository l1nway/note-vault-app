import './groups.css'

import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {motion} from 'framer-motion'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUserSlash, faPlane, faTableCells as faTableCellsSolid, faList as faListSolid, faFloppyDisk, faTriangleExclamation, faTrashCan, faSpinner} from '@fortawesome/free-solid-svg-icons'

import Clarify from '../components/clarify'
import SlideLeft from '../components/slideLeft'
import groupsLogic from './groupsLogic'
import GroupCard from './groupCard'
import LoadingError from '../components/loadingError'
import ExtraObj from '../components/extraObj'

function Groups() {

    const {t} = useTranslation()
    const token = useMemo(() => [localStorage.getItem('token'), Cookies.get('token')].find(t => t && t !== 'null'), [])

    const {path, loading, catsView, setCatsView, listView, elementID, setElementID, color, setColor, name, setName, openAnim, retryFunction, action, clarifyRef, gridRef, listRef, setLoadingError, getGroups, errorMessage, loadingError, setErrorMessage, items, saving, error, offlineMode, setOfflineMode, online, page, lastPage, loadMore} = groupsLogic()

    const renderGroups = useMemo(() => {
        return (items || []).map((element) =>
            <GroupCard
                retryFunction={retryFunction}
                setElementID={setElementID}
                setCatsView={setCatsView}
                openAnim={openAnim}
                setColor={setColor}
                listView={listView}
                catsView={catsView}
                element={element}
                setName={setName}
                key={element.id}
            />
        )
    }, [items, openAnim, listView])

    return(
        <div
            className='groups-main'
        >
        <article>
            <title>Groups — Note Vault</title>
        </article>
            {/* header  */}
            <div
                className='groups-top'
            >
                <div
                    className='groups-top-title'
                >
                    <h1
                        className='groups-title'
                    >
                        {t(path)}
                    </h1>
                    {/* displayed during loading */}
                    <SlideLeft visibility={!token}>
                        <FontAwesomeIcon
                            className='unauthorized-user-icon'
                            icon={faUserSlash}
                        />
                    </SlideLeft>
                    <SlideLeft visibility={loading}>
                        <FontAwesomeIcon
                            className='clarify-loading-icon'
                            icon={faSpinner}
                        />
                    </SlideLeft>
                    <SlideLeft visibility={saving}>
                        <FontAwesomeIcon
                            className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                            icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                        />
                    </SlideLeft>
                    <SlideLeft visibility={loadingError || error}>
                        <FontAwesomeIcon
                            className='loading-error-icon'
                            icon={faTriangleExclamation}
                        />
                    </SlideLeft>
                    <SlideLeft visibility={false}>
                        <span
                            className='notes-error-text'
                        >
                            {t(errorMessage)}
                        </span>
                    </SlideLeft>
                    <SlideLeft visibility={offlineMode}>
                        <FontAwesomeIcon
                            className='newnote-offline-icon'
                            icon={faPlane}
                        />
                    </SlideLeft>
                </div>
                <div
                    className='groups-buttons'
                >
                    <label
                        className={`groups-view ${(false) && '--disabled'}`}
                    >
                        <FontAwesomeIcon
                            tabIndex='0'
                            className='view-icon'
                            icon={faTableCellsSolid}
                            ref={gridRef}
                        />
                        <FontAwesomeIcon
                            tabIndex='0'
                            className='view-icon'
                            icon={faListSolid}
                            ref={listRef}
                        />
                        <input
                            type='checkbox'
                            disabled={loadingError}
                            checked={catsView == 'list'}
                            onChange={() => setCatsView(catsView == 'list' ? 'grid' : 'list')}
                        />
                    </label>
                    <button
                        // className={`notes-new ${(!online && !offlineMode) && '--new-disabled'}`}
                        // onClick={(e) => (!online && !offlineMode) && e.preventDefault()}
                        className='groups-new'
                        onClick={() => openAnim('new')}
                        disabled={!online && !offlineMode}
                    >
                        + {t(path == 'tags' ? 'New tag' : 'New category')}
                    </button>
                </div>
            </div>
                <LoadingError
                    setPageMessage={setErrorMessage}
                    setOfflineMode={setOfflineMode}
                    setPageError={setLoadingError}
                    pageMessage={errorMessage}
                    offlineMode={offlineMode}
                    pageError={loadingError}
                    getPage={getGroups}
                    online={online}
                    path={path}
                />
                <motion.div
                    className='groups-list'
                >
                    {!loading && !items?.length &&
                        <div
                            style={{display: 'flex', flexDirection: 'column'}}
                            onClick={() => openAnim('new')}
                            className='group-element'
                        >
                            <h2 className='note-empty-title'>{t(`No ${path} yet`)}</h2>
                            <p className='group-amount'>{t(`Create a ${path == 'tags' ? 'tag' : 'category'}?`)}</p>
                        </div>
                    }
                    {renderGroups}
                    <ExtraObj
                        listView={listView}
                        lastPage={lastPage}
                        loadMore={loadMore}
                        loading={loading}
                        page={page}
                    />
                </motion.div>
            {action ?
                <Clarify
                    setID={setElementID}
                    setColor={setColor}
                    setName={setName}
                    ref={clarifyRef}
                    id={elementID}
                    color={color}
                    name={name}
                />
            : null}
        </div>
    )
}

export default Groups