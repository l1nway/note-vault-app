import './trash.css'

import {useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlane, faUserSlash, faSpinner, faTrashCan, faTriangleExclamation, faFloppyDisk, faList as faListSolid, faTableCells as faTableCellsSolid} from '@fortawesome/free-solid-svg-icons'

import Clarify from '../components/clarify'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import trashLogic from './trashLogic'
import NoteCard from '../components/noteCard'
import ExtraObj from '../components/extraObj'

import {notesViewStore, clarifyStore, appStore} from '../store'

function Trash() {
  const {t} = useTranslation()

  const {deletedLoading, archivedLoading, path, selectedNotes, elementID, gridRef, listRef, getTrash, setElementID, openAnim, loadMore, lastPage, page} = trashLogic()

  const {archive, setArchive, trash, setTrash, offlineMode, guestMode} = appStore(
    useShallow((state) => ({
        archive: state.archive,
        setArchive: state.setArchive,
        trash: state.trash,
        setTrash: state.setTrash,
        offlineMode: state.offlineMode,
        guestMode: state.guestMode,
  })))

  // global state that stores the display view of notes
  const {notesView, setNotesView} = notesViewStore(
      useShallow((state) => ({
          notesView: state.notesView,
          setNotesView: state.setNotesView,
  })))

  // сonverts values ​​to true or false; for convenience (reducing unnecessary code with tags)
  const listView = notesView == 'list'

  const {action, setAction, setVisibility} = clarifyStore(
    useShallow((state) => ({
        // action being performed and its purpose
        action: state.action,
        setAction: state.setAction,
        // <Clarify/> window visibility
        setVisibility: state.setVisibility,
  })))

  const handleAction = useCallback((type, id) => {
      setElementID(id)
      openAnim(type)
  }, [setElementID, openAnim])
  
  const data = path == 'trash' ? trash : archive

  const renderTrash = useMemo(
    () => {
      return Array.isArray(data)
        ? data.map((element) => (
            <NoteCard
              key={element.id}
              note={element}
              onAction={handleAction}
            />
          ))
        : null
    }, [data, handleAction]
  )

  return (
    <div
      className='trash-main'
    >
      <header
        className='trash-header'
      >
        <div
          className='notes-top-group'
        >
          <h1
            className='trash-title'
          >
            {t(path)}
          </h1>
          {/* displayed during loading */}
          <SlideLeft
              visibility={path == 'trash' ? deletedLoading : archivedLoading}
          >
              <FontAwesomeIcon
                  className='clarify-loading-icon'
                  icon={faSpinner}
              />
          </SlideLeft>
          {/* displayed during saving */}
          <SlideLeft
              visibility={data?.some(item => item?.saving == true)}
          >
            <FontAwesomeIcon
                className='loading-save-icon'
                icon={faFloppyDisk}
            />
          </SlideLeft>
          {/* displayed only if the server returned an error */}
          <SlideLeft
              visibility={data?.some(item => item?.error == true)}
          >
              <FontAwesomeIcon
                  className='loading-error-icon'
                  icon={faTriangleExclamation}
              />
          </SlideLeft>
          {/* displayed only if offline mode is enabled */}
          <SlideLeft
              visibility={offlineMode}
          >
              <FontAwesomeIcon
                  className='newnote-offline-icon'
                  icon={faPlane}
              />
          </SlideLeft>
          {/* displayed only if the user is not authorized */}
          <SlideLeft
              visibility={guestMode}
          >
              <FontAwesomeIcon
                  className='unauthorized-user-icon'
                  icon={faUserSlash}
              />
          </SlideLeft>

        </div>
        <div
          className='trash-main-buttons'
        >
          <label
              className='trash-view'
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
              checked={notesView == 'list'}
              onChange={() => setNotesView(notesView == 'list' ? 'grid' : 'list')}
            />
          </label>

          <SlideLeft
            visibility={selectedNotes.length > 0}
          >
            <button
              className='trash-new'
              onClick={() => {
                setAction('restore')
                setTimeout(() => {
                    setVisibility(true)
                }, 10)
              }}
            >
              {t('noteAction', {
                action: path == 'trash' ? 'restore' : 'unarchive',
                count: selectedNotes.length
              })}
            </button>
          </SlideLeft>
        </div>
      </header>
        <SlideDown
          visibility={listView}
        >
          <div
            className='groups-table'
          >
              <p
                className='tab-element'
              >
                {t('title & description')}
              </p>
              <p
                className='tab-element'
              >
                {t(`${path == 'trash' ? 'archiving' : 'deleting'} date`)}
              </p>
              <p
                className='tab-element'
              >
                {t('restore')}
              </p>
          </div>
      </SlideDown>
      <SlideDown
        visibility={trash.length}
      >
          <div
            className='trash-list'
          >
            {renderTrash}
            <ExtraObj
                listView={listView}
                loading={path == 'trash' ? deletedLoading : archivedLoading}
                page={page}
                lastPage={lastPage}
                loadMore={loadMore}
            />
          </div>
      </SlideDown>
      {action ?
        <Clarify
          id={elementID}
          getTrash={getTrash}
          setTrash={setTrash}
          setArchive={setArchive}
          elementsIDs={selectedNotes}
        /> : null}
    </div>
  )
}

export default Trash