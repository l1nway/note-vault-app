import './notesList.css'
import {motion} from 'framer-motion'

import React, {useMemo, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useLocation} from 'react-router'
import {Link} from 'react-router'

import {useTranslation} from 'react-i18next'
import {appStore, clarifyStore, notesViewStore} from '../store'

import Clarify from '../components/clarify'
import notesLogic from './notesLogic'
import NoteCard from '../components/noteCard'
import LoadingError from '../components/loadingError'
import ExtraObj from '../components/extraObj'
import SlideDown from '../components/slideDown'

function NotesList() {
    const location = useLocation()
    const path = location.pathname.slice(1)
    const {t} = useTranslation()

    const {notes, setNotes, online, offlineMode, setOfflineMode, setNoteInfo} = appStore(
        useShallow((state) => ({
            notes: state.notes,
            setNotes: state.setNotes,
            online: state.online,
            offlineMode: state.offlineMode,
            setOfflineMode: state.setOfflineMode,
            setNoteInfo: state.setNoteInfo
    })))

    const {action, notesError, notesLoading, notesMessage, setNotesMessage, setTag, setCategory, setNotesError, retryFunction} = clarifyStore(
        useShallow((state) => ({
            action: state.action,
            notesError: state.notesError,
            notesLoading: state.notesLoading,
            notesMessage: state.notesMessage,
            setNotesMessage: state.setNotesMessage,
            setTag: state.setTag,
            setCategory: state.setCategory,
            setNotesError: state.setNotesError,
            retryFunction: state.retryFunction
    })))

    const notesView = notesViewStore(state => state.notesView)

    // сonverts values ​​to true or false; for convenience (reducing unnecessary code with tags)
    const listView = notesView == 'list'

    const {elementID, setElementID, getNotes, openAnim, loadMore, page, lastPage} = notesLogic()

    const handleAction = useCallback((type, id) => {
        setElementID(id)
        openAnim(type)
    }, [openAnim])

    // displaying a sorted list
    const renderNotes = useMemo(() => {
        const source = notes
        return source?.map((element, index) =>
            <NoteCard
                key={element.id}
                note={element}
                onAction={handleAction}
                setCategory={setCategory}
                setTag={setTag}
                setNoteInfo={setNoteInfo}
                retryFunction={retryFunction}
                listView={listView}
            />
    )}, [notes, handleAction, setCategory, setTag, listView])

    return(
        <>
            <LoadingError
                setPageMessage={setNotesMessage}
                setOfflineMode={setOfflineMode}
                setPageError={setNotesError}
                pageMessage={notesMessage}
                offlineMode={offlineMode}
                pageError={notesError}
                getPage={getNotes}
                online={online}
                path={path}
            />
            <motion.div
                className='notes-list'
            >
                {!notesLoading && !notes.length ?
                    <Link
                        className='note-animated-element'
                        to='./new'
                    >
                        <div className='note-element'>
                            <div className='note-top-group'>
                                <h2 className='note-title'>
                                    {t('No notes yet')}
                                </h2>
                                <p className='note-desc'>{t('Create a note?')}</p>
                            </div>
                        </div>
                    </Link>
                : null}
                {renderNotes}
                <ExtraObj
                    loading={notesLoading}
                    listView={listView}
                    lastPage={lastPage}
                    loadMore={loadMore}
                    page={page}
                />
            </motion.div>
            {action ?
                <Clarify
                    setID={setElementID}
                    getNotes={getNotes}
                    setNotes={setNotes}
                    id={elementID}
                />
            : null}
        </>
    )
}

export default React.memo(NotesList)