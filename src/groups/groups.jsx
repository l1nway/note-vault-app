import './groups.css'

import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {motion, AnimatePresence} from 'framer-motion'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlane, faTableCells as faTableCellsSolid, faList as faListSolid, faFloppyDisk, faTriangleExclamation, faTrashCan, faSpinner} from '@fortawesome/free-solid-svg-icons'

import Clarify from '../components/clarify'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import groupsLogic from './groupsLogic'
import GroupCard from './groupCard'
import LoadingError from '../components/loadingError'
import ExtraObj from '../components/extraObj'

function Groups() {

    const {t} = useTranslation()

    const {path, loading, catsView, setCatsView, listView, elementID, setElementID, color, setColor, name, setName, openAnim, retryFunction, action, clarifyRef, gridRef, listRef, setLoadingError, getGroups, errorMessage, loadingError, setErrorMessage, items, saving, error, offlineMode, setOfflineMode, online} = groupsLogic()

    const renderGroups = useMemo(() => {
        return (items || []).map((element) =>
            <GroupCard
                key={element.id}
                element={element}
                openAnim={openAnim}
                setElementID={setElementID}
                setName={setName}
                setColor={setColor}
                listView={listView}
                catsView={catsView}
                setCatsView={setCatsView}
                retryFunction={retryFunction}
            />
        )
    }, [items, openAnim, listView])

    return(
        <div
            className='groups-main'
        >
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
                    <SlideLeft
                        visibility={loading}
                    >
                        <FontAwesomeIcon
                            className='clarify-loading-icon'
                            icon={faSpinner}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={saving}
                    >
                        <FontAwesomeIcon
                            className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                            icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={loadingError || error}
                    >
                        <FontAwesomeIcon
                            className='loading-error-icon'
                            icon={faTriangleExclamation}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={false}
                    >
                        <span
                            className='notes-error-text'
                        >
                            {t(errorMessage)}
                        </span>
                    </SlideLeft>
                    <SlideLeft
                        visibility={offlineMode}
                    >
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
                    pageError={loadingError}
                    setPageError={setLoadingError}
                    pageMessage={errorMessage}
                    setPageMessage={setErrorMessage}
                    getPage={getGroups}
                    online={online}
                    offlineMode={offlineMode}
                    setOfflineMode={setOfflineMode}
                    path={path}
                />
                <SlideDown
                    visibility={items?.length}
                >
                    <motion.div
                        className='groups-list'
                    >
                        <AnimatePresence>
                            {renderGroups}
                            <ExtraObj
                                listView={listView}
                                loading={loading}
                                // page={page}
                                // lastPage={lastPage}
                                // loadMore={loadMore}
                            />
                        </AnimatePresence>
                    </motion.div>
                </SlideDown>
            {action ?
                <Clarify
                    ref={clarifyRef}
                    id={elementID}
                    setID={setElementID}
                    color={color}
                    setColor={setColor}
                    name={name}
                    setName={setName}
                />
            : null}
        </div>
    )
}

export default Groups