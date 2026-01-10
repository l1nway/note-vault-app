import './notesList.css'
import {motion} from 'framer-motion'

import React, {useMemo, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useLocation} from 'react-router'

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

    const {notes, setNotes, online, offlineMode, setOfflineMode, setNoteInfo} = appStore(
        useShallow((state) => ({
            notes: state.notes,
            setNotes: state.setNotes,
            online: state.online,
            offlineMode: state.offlineMode,
            setOfflineMode: state.setOfflineMode,
            setNoteInfo: state.setNoteInfo
    })))

    const {action, notesError, notesLoading, notesMessage, setTag, setCategory, setNotesError, retryFunction} = clarifyStore(
        useShallow((state) => ({
            action: state.action,
            notesError: state.notesError,
            notesLoading: state.notesLoading,
            notesMessage: state.notesMessage,
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
                pageError={notesError}
                setPageError={setNotesError}
                pageMessage={notesMessage}
                getPage={getNotes}
                online={online}
                offlineMode={offlineMode}
                setOfflineMode={setOfflineMode}
                path={path}
            />
            <SlideDown
                visibility={notes?.length}
            >
                <motion.div
                    className='notes-list'
                >
                    {renderNotes}
                    <ExtraObj
                        listView={listView}
                        loading={notesLoading}
                        page={page}
                        lastPage={lastPage}
                        loadMore={loadMore}
                    />
                </motion.div>
            </SlideDown>
            {action ?
                <Clarify
                    id={elementID}
                    setID={setElementID}
                    getNotes={getNotes}
                    setNotes={setNotes}
                />
            : null}
        </>
    )
}

export default React.memo(NotesList)