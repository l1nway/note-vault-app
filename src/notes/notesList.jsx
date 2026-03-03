import './notesList.css'
import {motion, AnimatePresence} from 'framer-motion'

import React, {useMemo, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useLocation} from 'react-router'
import {Link} from 'react-router'

import {useTranslation} from 'react-i18next'
import {appStore, clarifyStore, notesViewStore} from '../store'

import LoadingError from '../components/loadingError'
import NoteCard from '../components/noteCard'
import ExtraObj from '../components/extraObj'
import Clarify from '../components/clarify'
import notesLogic from './notesLogic'
import Cookies from 'js-cookie'

function NotesList() {
    const token = useMemo(() => [localStorage.getItem('token'), Cookies.get('token')].find(t => t && t !== 'null'), [])

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

    const {elementID, setElementID, getNotes, openAnim, loadMore, page, lastPage, filteredNotes} = notesLogic()

    const handleAction = useCallback((type, id) => {
        setElementID(id)
        openAnim(type)
    }, [openAnim])

    // displaying a sorted list
    const renderNotes = useMemo(() => {
        const source = (online && !offlineMode && token) ? notes : filteredNotes
        return source?.map((element, index) =>
            <NoteCard
                retryFunction={retryFunction}
                setCategory={setCategory}
                setNoteInfo={setNoteInfo}
                onAction={handleAction}
                listView={listView}
                key={element.id}
                setTag={setTag}
                note={element}
            />
    )}, [filteredNotes, online, offlineMode, notes, handleAction, setCategory, setTag, listView])

    const source = (online && !offlineMode && token) ? notes : filteredNotes
    const empty = !notesLoading && source?.length === 0

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
            <div className='notes-list'>
                {empty &&
                    <motion.div
                        className='note-animated-element'
                        style={{ 
                            willChange: 'transform, opacity, height',
                            backfaceVisibility: 'hidden',
                            transform: 'translateZ(0)'
                        }}
                        viewport={{once: false, amount: 0.1, margin: '0px 0px 0px 0px'}}
                        initial={{opacity: 0, scale: 0.9}}
                        whileInView={{opacity: 1, scale: 1}}
                        key='empty'
                        transition={{
                            layout: { 
                                type: 'spring', 
                                stiffness: 300, 
                                damping: 30
                            },
                            default: { 
                                duration: 0.3, 
                                ease: 'easeInOut'
                            },
                            opacity: {duration: 0.3}
                        }}
                        exit={{opacity: 0, scale: 0.8, transition: {duration: 0.3}}}
                    >
                        <Link className='note-element' to='./new'>
                            <div className='note-empty-group'>
                                <h2 className='note-empty-title'>
                                    {t('No notes yet')}
                                </h2>
                                <p className='note-desc'>{t('Create a note?')}</p>
                            </div>
                        </Link>
                    </motion.div>
                }
                {renderNotes}
                <ExtraObj
                    loading={notesLoading}
                    listView={listView}
                    lastPage={lastPage}
                    loadMore={loadMore}
                    page={page}
                />
            </div>
            {action &&
                <Clarify
                    setID={setElementID}
                    getNotes={getNotes}
                    setNotes={setNotes}
                    id={elementID}
                />
            }
        </>
    )
}

export default React.memo(NotesList)